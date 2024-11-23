import { TokenPayload } from "@/domain/jwt";

import { PayloadMissing, TokenMissing } from "./errors";

/**
 * Cookie name for the JWT token.
 */
const TOKEN_COOKIE_NAME = "token";

/**
 * Retrieves subject token.
 * @returns Token.
 * @throws {TokenMissing} When the token is not found.
 */
export function getToken(): string {
  // Get individual name=value cookies.
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (TOKEN_COOKIE_NAME == cookieName.trim()) {
      return decodeURIComponent(cookieValue);
    }
  }

  throw new TokenMissing();
}

/**
 * Decodes payload from token.
 * @param token JWT token.
 * @returns Decoded payload.
 * @throws {PayloadMissing} When payload is not found within the token.
 */
export function decodeTokenPayload(token: string): TokenPayload {
  const [, payloadBase64] = token.split(".");

  if (!payloadBase64) {
    throw new PayloadMissing();
  }

  const decodedPayloadStr = atob(payloadBase64);
  const payload = JSON.parse(decodedPayloadStr) as TokenPayload;

  return payload;
}

/**
 * Stores token in cookies.
 * @param token JWT token.
 * @param expirationTime JWT expiration time.
 */
export function storeToken(token: string, expirationTime: number) {
  const expireTimeInMs = expirationTime * 1000;
  const expireDate = new Date(expireTimeInMs).toUTCString();

  document.cookie = `token=${token}; Path=/; Expires=${expireDate}; SameSite=Strict; Secure`;
}

/**
 * Clears token in cookies.
 */
export function clearToken() {
  document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}
