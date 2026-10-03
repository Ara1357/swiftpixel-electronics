import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyStripeSignature } from "./_core/stripeWebhook";

describe("Stripe webhook signature verification", () => {
  it("accepts a valid timestamped signature", () => {
    const secret = "whsec_test";
    const body = Buffer.from(JSON.stringify({ id: "evt_1", type: "checkout.session.completed" }));
    const timestamp = 1_760_000_000;
    const digest = createHmac("sha256", secret).update(`${timestamp}.${body.toString()}`).digest("hex");
    expect(verifyStripeSignature(body, `t=${timestamp},v1=${digest}`, secret, timestamp + 20)).toBe(true);
  });

  it("rejects stale or tampered signatures", () => {
    const body = Buffer.from("{\"id\":\"evt_1\"}");
    const timestamp = 1_760_000_000;
    const digest = createHmac("sha256", "whsec_test").update(`${timestamp}.${body.toString()}`).digest("hex");
    expect(verifyStripeSignature(body, `t=${timestamp},v1=${digest}`, "whsec_test", timestamp + 301)).toBe(false);
    expect(verifyStripeSignature(Buffer.from("{\"id\":\"evt_2\"}"), `t=${timestamp},v1=${digest}`, "whsec_test", timestamp + 20)).toBe(false);
  });
});
