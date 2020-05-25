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

  async addToSchedule(scheduleStamp, _id) {
    return this.#db.callAsync('zadd', 'scheduledMessages', scheduleStamp, _id);
  }

  async schedule(scheduledMessage) {
    return (scheduledMessage.now === true)
      ? this.scheduleNow(scheduledMessage)
      : this.addToSchedule(scheduledMessage.scheduleStamp, scheduledMessage._id);
  }

  async scheduleNow(scheduledMessage) {
    return this.addToSchedule(0, scheduledMessage._id);
  }

  async get(key) {
    const data = await this.#db.callAsync('get', key);
    if (data) return ScheduledMessage.parse(data);
    return null;
  }

  async pick() {
    const result = await this.#db.callAsync('zpopmin', 'scheduledMessages');
    if (!(result && result.length === 2)) return null;

    const [_id, scheduleStamp] = result;

    const scheduleTime = new Date(parseInt(scheduleStamp));
    if (moment(scheduleTime).isAfter()) {
      await this.addToSchedule(scheduleStamp, _id);
      return null;
    }

    return await this.get(_id);
  }
}

module.exports = new ScheduledMessages(db);
