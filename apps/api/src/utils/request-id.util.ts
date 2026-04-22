import crypto from "node:crypto";

export const createRequestId = (): string => {
  return crypto.randomUUID();
};
