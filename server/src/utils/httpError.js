/** An Error that carries an HTTP status code; the error handler turns it into a JSON response. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Copies only the allowed keys from an object (protects against mass-assignment). */
export const pick = (source, keys) =>
  Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));
