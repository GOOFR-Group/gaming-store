/**
 * Represents an API error response.
 */
abstract class ApiError extends Error {
  status: number;
  code: string;

  /**
   * Constructs a ApiError with a given status code, API code and API message.
   * @param status Status code.
   * @param code API code.
   * @param message API message.
   */
  constructor(status: number, code: string, message: string = "") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Represents an API Bad Request error response.
 */
export class BadRequest extends ApiError {
  /**
   * Constructs a BadRequest with a given API code and API message.
   * @param code API code.
   * @param message API message.
   */
  constructor(code: string, message: string = "") {
    super(400, code, message);
  }
}

/**
 * Represents an API Unauthorized error response.
 */
export class Unauthorized extends ApiError {
  /**
   * Constructs a Unauthorized with a given API code and API message.
   * @param code API code.
   * @param message API message.
   */
  constructor(code: string, message: string = "") {
    super(401, code, message);
  }
}

/**
 * Represents an API Forbidden error response.
 */
export class Forbidden extends ApiError {
  /**
   * Constructs a Forbidden with a given API code and API message.
   * @param code API code.
   * @param message API message.
   */
  constructor(code: string, message: string = "") {
    super(403, code, message);
  }
}

/**
 * Represents an API Not Found error response.
 */
export class NotFound extends ApiError {
  /**
   * Constructs a NotFound with a given API code and API message.
   * @param code API code.
   * @param message API message.
   */
  constructor(code: string, message: string = "") {
    super(404, code, message);
  }
}

/**
 * Represents an API Conflict error response.
 */
export class Conflict extends ApiError {
  /**
   * Constructs a Conflict with a given API code and API message.
   * @param code API code.
   * @param message API message.
   */
  constructor(code: string, message: string = "") {
    super(409, code, message);
  }
}

/**
 * Represents an API Content Too Large error response.
 */
export class ContentTooLarge extends ApiError {
  /**
   * Constructs a ContentTooLarge with a given API code and API message.
   * @param code API code.
   * @param message API message.
   */
  constructor(code: string, message: string = "") {
    super(413, code, message);
  }
}

/**
 * Represents an API Internal Server Error response.
 */
export class InternalServerError extends ApiError {
  /**
   * Constructs a InternalServerError.
   */
  constructor() {
    super(500, "internal_server_error", "");
  }
}

/**
 * Represents the error that the JWT is missing from the cookies of the browser.
 */
export class TokenMissing extends Error {}

/**
 * Represents the error that the JWT payload is missing from the JWT.
 */
export class TokenPayloadMissing extends Error {}

/**
 * Represents the error that the user's cart is empty when they are accessing the payment step.
 */
export class EmptyCart extends Error {}
