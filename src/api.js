const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));
app.use(require('./routes'));
app.use((error, req, res, next) => {
  if (error.isBoom) {
    const stackTrace = (error.output.statusCode >= 500 && error.statusCode <= 599)
      ? error.stack
      : undefined;

    res.status(error.output.statusCode)
      .json(Object.assign({}, error.output.payload, error.data, { stackTrace }));
    return;
  }
  next(error);
});

module.exports = app;
