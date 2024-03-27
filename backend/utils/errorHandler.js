//childe and paratent

class ErrorHandler extends Error {
  constructor(message, statuscode) {
    super(message);
    this.statuscode = statuscode;
    Error.captureStackTrace(this, this.constructor); //stack prpertiy wt kind of error shwing
  }
}

module.exports = ErrorHandler;
