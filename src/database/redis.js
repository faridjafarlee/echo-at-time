const redis = require('redis');

class RedisClient {
  #client = { connection: null, connected: false };
  #publisherClient = { connection: null, connected: false };
  #subscriberClient = { connection: null, connected: false };

  async callAsync(method, ...args) {
    return new Promise((resolve, reject) => {
      this.client[method](...args, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  get client() {
    if (!this.#client.connection) throw new Error('Cannot get redis client - connection does not exist');
    if (!this.#client.connected) throw new Error('Not connected to redis');
    return this.#client.connection;
  }

  get publisher() {
    if (!this.#publisherClient.connection) throw new Error('Cannot get publisher redis client - connection does not exist');
    if (!this.#publisherClient.connected) throw new Error('Not connected to redis as publisher');
    return this.#publisherClient.connection;
  }

  get subscriber() {
    if (!this.#subscriberClient.connection) throw new Error('Cannot get subscriber redis client - connection does not exist');
    if (!this.#subscriberClient.connected) throw new Error('Not connected to redis as subscriber');
    return this.#subscriberClient.connection;
  }

  async createClient(connectionUrl, clientDescriptor, onError) {
    return new Promise((resolve, reject) => {
      const client = redis.createClient({
        url: connectionUrl,
        retry_strategy: function (options) {
          if (options.attempt > 3) {
            if (onError) return onError(options.error);
          }
          return 1000;
        },
      });

      client.once('error', (error) => {
        reject(error);
      });

      client.once('ready', () => {
        clientDescriptor.connected = true;
        clientDescriptor.connection = client;
        resolve();

        client.on('error', (error) => {
          console.log('error', error.message);
          if (clientDescriptor.connected) {
            clientDescriptor.connected = false;
            if (onError) return onError(error);
          }
        });
      });

      client.on('connect', () => {
        clientDescriptor.connected = true;
      });

      client.on('reconnecting', () => {
        clientDescriptor.connected = false;
      });
    });
  }

  async connect(connectionUrl, onError) {
    if (!connectionUrl) throw new Error('Cannot create redis client - connection url not provided');

    await this.createClient(connectionUrl, this.#client, onError);
    // await this.connectPubSub(connectionUrl, onError);
  }

  async connectPubSub(connectionUrl) {
    if (!connectionUrl) throw new Error('Cannot create pub/sub redis client - connection url not provided');
    await this.createClient(connectionUrl, this.#publisherClient);
    await this.createClient(connectionUrl, this.#subscriberClient);
  }

  async close() {
    this.#client.connected = false;
    this.#publisherClient.connected = false;
    this.#subscriberClient.connected = false;

    return new Promise((resolve) => {
      if (this.#publisherClient.connection) this.#publisherClient.connection.end(true);
      if (this.#subscriberClient.connection) this.#subscriberClient.connection.end(true);
      (this.#client.connection)
        ? this.#client.connection.quit(() => resolve())
        : resolve();
    });
  }

  publish(channel, payload) {
    this.publisher.publish(channel, payload);
  }

  subscribe(channel, handler) {
    this.subscriber.on('message', (messageChannel, message) => {
      if (channel === messageChannel) handler(message);
    });
    this.subscriber.subscribe(channel);
  }

  unsubscribe() {
    if (this.#subscriberClient.connection) {
      this.#subscriberClient.connection.unsubscribe();
    }
  }
}

module.exports = new RedisClient();
