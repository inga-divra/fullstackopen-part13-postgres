const { ValidationError } = require('sequelize');

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: error.errors.map((error) => error.message),
    });
  }

  return res.status(400).json({
    error: error.message,
  });
};

module.exports = { errorHandler };
