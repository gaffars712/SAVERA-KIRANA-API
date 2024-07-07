const sendResponse = (res, status, data, err = null) => {
  if (!res.headersSent) {
    res.status(status).json({
      code: status,
      status: status >= 200 && status < 300,
      data: err || data,
    });
  }
};

module.exports = { sendResponse };
