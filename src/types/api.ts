export type ApiError = {
  error: string;
  details?: unknown;
};

export type ApiResponse<T> = T | ApiError;

export class SpriteGenerationError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = "SpriteGenerationError";
  }
}
