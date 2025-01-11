import ErrorCode from "../constants/errorCode.js";
import { HttpStatusCode } from "../constants/http.js";

class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public errorCode?: ErrorCode
  ) {
    super(message);
  }
}

export default AppError;
