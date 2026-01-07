const errorHandler = (err, req, res, next) => {
  console.error('❌ 錯誤:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || '伺服器內部錯誤';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
