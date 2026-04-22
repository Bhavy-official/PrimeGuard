import crypto from "node:crypto";

export const hashToken = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};
