module.exports = function errorHandler(res, err = "error", code = 500) {
  try {
    return res.status(code).json({
      error: err,
    });
  } catch {}
};
