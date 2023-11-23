export default class InfoError extends Error {
  errorType: string;

  constructor(message: string, errorType?: "info" | "error") {
    super(message);
    this.errorType = errorType || "info";
    Object.setPrototypeOf(this, InfoError.prototype);
  }
}
