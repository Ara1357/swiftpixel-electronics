import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyStripeSignature(rawBody: Buffer, signature: string, secret: string, nowSeconds = Date.now() / 1000): boolean {
  const values = new Map(signature.split(",").map(part => part.split("=", 2) as [string, string]));
  const timestamp = values.get("t");
  const provided = values.get("v1");
  if (!timestamp || !provided) return false;
  const age = Math.abs(nowSeconds - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody.toString("utf8")}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(provided, "utf8");
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}
