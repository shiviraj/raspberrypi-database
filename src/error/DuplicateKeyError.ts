class DuplicateKeyError extends Error {
  constructor(message: string = "Duplicate key error") {
    super(message);
  }
}

export {DuplicateKeyError}