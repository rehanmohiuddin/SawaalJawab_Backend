const sendErrorResponse = (res, e, code = 500) => {
  res.status(code).send({
    message: e.toString(),
  });
};

module.exports = { sendErrorResponse };
