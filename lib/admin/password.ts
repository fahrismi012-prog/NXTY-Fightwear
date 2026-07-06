import { timingSafeEqual } from "node:crypto";

export type AdminPasswordResult = "valid" | "invalid" | "unconfigured";

export function verifyAdminPassword(password: unknown): AdminPasswordResult {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return "unconfigured";
  if (typeof password !== "string" || password.length === 0) return "invalid";

  const suppliedBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);

  if (suppliedBuffer.length !== expectedBuffer.length) return "invalid";
  return timingSafeEqual(suppliedBuffer, expectedBuffer) ? "valid" : "invalid";
}
