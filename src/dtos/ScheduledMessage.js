const uuid = require('uuid');

class ScheduledMessage {
  _id;
  message;
  time;
  now;

  constructor(message, time, now = false) {
    this._id = uuid.v4();
    this.message = message;
    this.time = time;
    this.now = !!now;
    this.scheduleStamp = new Date(time).getTime();
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports.ScheduledMessage = ScheduledMessage;

module.exports.fromString =
module.exports.parse =
function (scheduledMessageString) {
  const { _id, message, time, now } = JSON.parse(scheduledMessageString);
  const scheduledMessage = new ScheduledMessage(message, time, now);
  scheduledMessage._id = _id;
  return Object.freeze(scheduledMessage);
};

module.exports.create = function (message, time, now = false) {
  return Object.freeze(new ScheduledMessage(message, time, now));
};
