const moment = require('moment');
const db = require('../database/redis');
const ScheduledMessage = require('../dtos/ScheduledMessage');

class ScheduledMessages {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async save(scheduledMessage) {
    return this.#db.callAsync('set', scheduledMessage._id, scheduledMessage.toString());
  }

  /*
  publishMessage(scheduledMessage) {
    this.#db.publish('ScheduledMessagesChannel', scheduledMessage.toString());
  }

  onMessage(handler) {
    this.#db.subscribe('ScheduledMessagesChannel', (message) => {
      message = ScheduledMessage.parse(message);
      handler(message);
    });
  }

  unsubscribe() {
    this.#db.unsubscribe();
  }
  */

  async addToSchedule(scheduleStamp, _id) {
    this.#db.callAsync('zadd', 'scheduledMessageStamps', scheduleStamp, scheduleStamp);
    this.#db.callAsync('zadd', 'scheduledMessages:' + scheduleStamp, 0, _id);
  }

  async schedule(scheduledMessage) {
    return (scheduledMessage.now === true)
      ? this.scheduleNow(scheduledMessage)
      : this.addToSchedule(scheduledMessage.scheduleStamp, scheduledMessage._id);
  }

  async scheduleNow(scheduledMessage) {
    // return this.publishMessage(scheduledMessage);
    return this.addToSchedule(0, scheduledMessage._id);
  }

  async get(key) {
    const data = await this.#db.callAsync('get', key);
    if (data) return ScheduledMessage.parse(data);
    return null;
  }

  async pickMessages() {
    const result = await this.#db.callAsync('zrange', 'scheduledMessageStamps', 0, 0, 'WITHSCORES');
    if (!(result && result.length === 2)) return {};

    const [stamp, scheduleStamp] = result;

    const scheduleTime = new Date(parseInt(scheduleStamp));
    if (moment(scheduleTime).isAfter()) return {};

    const scheduledMessageIds = await this.#db.callAsync('zrange', 'scheduledMessages:' + stamp, 0, -1);
    const scheduledMessages = await Promise.all(scheduledMessageIds.map(id => this.get(id)));

    return { stamp, scheduledMessages };
  }

  async deleteScheduleStamp(stamp) {
    await this.#db.callAsync('zremrangebyscore', 'scheduledMessageStamps', stamp, stamp);
    await this.#db.callAsync('del', 'scheduledMessages:' + stamp);
  }

  async lockMessagesByStamp(stamp) {
    return await this.#db.callAsync('setnx', 'scheduledMessages:' + stamp + ':lock', parseInt(Date.now() / 1000) + 3);
  }

  async releaseLockMessagesByStamp(stamp) {
    return await this.#db.callAsync('del', 'scheduledMessages:' + stamp + ':lock');
  }
}

module.exports = new ScheduledMessages(db);
