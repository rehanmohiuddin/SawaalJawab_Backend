const sendErrorResponse = (res, e, code = 500) => {
  res.status(code).send({
    error: e.toString(),
  });
};

module.exports = { sendErrorResponse };
