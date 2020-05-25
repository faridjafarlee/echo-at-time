const redis = require('redis');

class RedisClient {
  #client;

  async callAsync(method, ...args) {
    return new Promise((resolve, reject) => {
      this.client[method](...args, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  get client() {
    if (!this.#client) throw new Error('Cannot get redis client - connection does not exist');
    return this.#client;
  }

  connect(connectionUrl) {
    if (!connectionUrl) throw new Error('Cannot create redis client - connection url not provided');

    this.#client = redis.createClient(connectionUrl);
    return this.#client;
  }
}

module.exports = new RedisClient();
