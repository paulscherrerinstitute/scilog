// Error body produced by the backend's LoopBack strong-error-handler. statusCode and message
// are always present; name and code only for some errors (e.g. 5xx bodies are redacted to just
// statusCode + message).
export interface LoopBackError {
  error: {
    statusCode: number;
    message: string;
    name?: string;
    code?: string;
  };
}
