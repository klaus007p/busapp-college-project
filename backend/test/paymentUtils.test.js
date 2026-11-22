const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const {
    calculateAmountInPaise,
    isValidSeatSelection,
    verifyRazorpaySignature
} = require("../services/paymentUtils");

test("calculates an INR order total in paise including the service fee", () => {
    assert.equal(calculateAmountInPaise(500, 2), 115000);
});

test("rejects invalid seat counts and non-positive fares", () => {
    assert.throws(() => calculateAmountInPaise(500, 0), RangeError);
    assert.throws(() => calculateAmountInPaise(0, 1), RangeError);
});

test("rejects duplicate, booked, malformed, and out-of-range seats", () => {
    assert.equal(isValidSeatSelection(["1A", "1A"], 40, [], 40), false);
    assert.equal(isValidSeatSelection(["1A"], 40, ["1A"], 40), false);
    assert.equal(isValidSeatSelection(["11A"], 40, [], 40), false);
    assert.equal(isValidSeatSelection(["1Z"], 40, [], 40), false);
});

test("verifies Razorpay signatures and rejects tampering", () => {
    const secret = "local-test-secret";
    const orderId = "order_test";
    const paymentId = "payment_test";
    const signature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    assert.equal(verifyRazorpaySignature(orderId, paymentId, signature, secret), true);
    assert.equal(verifyRazorpaySignature(orderId, paymentId, "0".repeat(64), secret), false);
    assert.equal(verifyRazorpaySignature(orderId, paymentId, "not-a-signature", secret), false);
});
