const boom = require('@hapi/boom');
const joi = require('@hapi/joi');

module.exports = async (input, schema, next) => {
  if (!schema) {
    return next();
  }

  try {
    const validationSchema = joi.object(schema);
    const validationObject = {};
    ['params', 'body', 'query']
      .forEach(key => {
        if (schema[key]) validationObject[key] = input[key];
      });

    const validated = await validationSchema.validateAsync(validationObject, { abortEarly: true });

    Object.assign(input, validated);
    next();
  } catch (error) {
    const messages = error.details.map(item => {
      return {
        field: item.path.join('.'),
        message: item.message,
      };
    });
    next(boom.badRequest('Validation conditions unmet', { messages }));
  }
};
