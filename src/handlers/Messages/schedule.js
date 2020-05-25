const moment = require('moment');
const Boom = require('@hapi/boom');

const ScheduledMessage = require('../../dtos/ScheduledMessage');
const ScheduledMessagesRepository = require('../../repositories/ScheduledMessages');

module.exports = async (req, res) => {
  const { message, now } = req.body;
  let time = now === true ? new Date() : req.body.time;

  time = moment(time).toDate().toISOString();
  if (moment(time).isBefore(moment(), 'minutes')) {
    throw Boom.badRequest('Time provided in request is older than now');
  }

  const scheduledMessage = ScheduledMessage.create(message, time, now);
  await ScheduledMessagesRepository.save(scheduledMessage);
  await ScheduledMessagesRepository.schedule(scheduledMessage);

  res.status(201).send(scheduledMessage);
};
