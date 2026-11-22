const crypto = require("crypto");

const SERVICE_FEE_RUPEES = 150;
const MAX_SEATS_PER_ORDER = 8;

function calculateAmountInPaise(pricePerSeat, seatCount) {
    const priceInPaise = Math.round(Number(pricePerSeat) * 100);
    if (!Number.isSafeInteger(priceInPaise) || priceInPaise <= 0) {
        throw new RangeError("The fare must be a positive amount.");
    }
    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > MAX_SEATS_PER_ORDER) {
        throw new RangeError("Select between one and eight seats.");
    }

    const amount = priceInPaise * seatCount + SERVICE_FEE_RUPEES * 100;
    if (!Number.isSafeInteger(amount) || amount > 100000000) {
        throw new RangeError("The order amount is outside the permitted range.");
    }
    return amount;
}

function isValidSeatSelection(seats, capacity, seatsBooked, availableSeats) {
    if (!Array.isArray(seats) || seats.length < 1 || seats.length > MAX_SEATS_PER_ORDER) {
        return false;
    }
    if (!Number.isInteger(capacity) || capacity < 1 || new Set(seats).size !== seats.length) {
        return false;
    }

    const bookedSeatSet = Array.isArray(seatsBooked)
        ? new Set(seatsBooked.map(String))
        : null;
    const knownAvailableSeats = Number.parseInt(availableSeats, 10);
    if (!Number.isNaN(knownAvailableSeats) && seats.length > knownAvailableSeats) {
        return false;
    }

    return seats.every((seat) => {
        const match = /^([1-9]\d*)([A-D])$/.exec(seat);
        if (!match) {
            return false;
        }

        const seatIndex = (Number.parseInt(match[1], 10) - 1) * 4 + "ABCD".indexOf(match[2]);
        if (seatIndex >= capacity) {
            return false;
        }
        if (bookedSeatSet) {
            return !bookedSeatSet.has(seat);
        }
        return Number.isNaN(knownAvailableSeats) || seatIndex < knownAvailableSeats;
    });
}

function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
    if (
        typeof orderId !== "string" ||
        typeof paymentId !== "string" ||
        typeof signature !== "string" ||
        typeof secret !== "string" ||
        !/^[a-f\d]{64}$/i.test(signature)
    ) {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest();
    const actual = Buffer.from(signature, "hex");
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

module.exports = {
    MAX_SEATS_PER_ORDER,
    SERVICE_FEE_RUPEES,
    calculateAmountInPaise,
    isValidSeatSelection,
    verifyRazorpaySignature
};
