class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  static send(res, statusCode, data, message = 'Success', meta = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, meta));
  }
}

module.exports = ApiResponse;
