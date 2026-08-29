export class AttemptStateError extends Error {
  status = 400 as const;
  constructor(message: string) {
    super(message);
    this.name = "AttemptStateError";
  }
}
