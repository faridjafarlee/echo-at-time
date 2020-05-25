const express = require('express');
const boom = require('@hapi/boom');
const joi = require('@hapi/joi');

const { validate } = require('../validator');
const Messages = require('../handlers/Messages');

const wrapHandler = fn => (req, res, next) => {
  Promise
    .resolve(fn(req, res, next))
    .catch((err) => {
      if (!err.isBoom) {
        return next(boom.badImplementation(err));
      }
      next(err);
    });
};

const router = express.Router();

router.post(
  '/schedule',
  (req, res, next) => {
    validate(
      req,
      {
        body: {
          time: joi.date().optional(),
          message: joi.string().required(),
          now: joi.bool().optional(),
        },
      },
      next);
  },
  (req, res, next) => {
    if (req.body.now === true) {
      req.body.now = true;
      delete req.body.time;
    }
    next();
  },
  wrapHandler(Messages.schedule));

router.post(
  '/schedule/now',
  (req, res, next) => {
    validate(
      req,
      {
        body: {
          message: joi.string().required(),
        },
      },
      next);
  },
  (req, _, next) => {
    req.body.now = true;
    next();
  },
  wrapHandler(Messages.schedule));

module.exports = router;
