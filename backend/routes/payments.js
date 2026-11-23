const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Bus = require("../models/Buses");
const { DEMO_BUS_FARE, createDemoBus } = require("../services/demoBus");
const {
    SERVICE_FEE_RUPEES,
    calculateAmountInPaise,
    isValidSeatSelection,
    verifyRazorpaySignature
} = require("../services/paymentUtils");

const router = express.Router();

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isTestMode = (process.env.RAZORPAY_MODE || "test") === "test";
    if (!keyId || !keySecret || !isTestMode || !keyId.startsWith("rzp_test_")) {
        return null;
    }

    return {
        client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
        keyId
    };
}

async function findBusForOrder(busId, startCity, destination) {
    const routeFilter = {
        startCity: new RegExp(`^${escapeRegex(startCity)}$`, "i"),
        destination: new RegExp(`^${escapeRegex(destination)}$`, "i")
    };

    if (busId === createDemoBus(startCity, destination)._id) {
        const savedBus = await Bus.findOne(routeFilter).lean();
        return savedBus ? null : createDemoBus(startCity, destination);
    }

    if (!mongoose.Types.ObjectId.isValid(busId)) {
        return null;
    }
    return Bus.findOne({ _id: busId, ...routeFilter }).lean();
}

function getBusCapacity(bus) {
    const totalSeats = Number.parseInt(bus.totalSeats, 10);
    const availableSeats = Number.parseInt(bus.availableSeats, 10);
    return Math.max(1, totalSeats || availableSeats || 40);
}

router.post("/order", async (req, res, next) => {
    const body = req.body || {};
    const busId = typeof body.busId === "string" ? body.busId : "";
    const startCity = typeof body.startCity === "string" ? body.startCity.trim() : "";
    const destination = typeof body.destination === "string" ? body.destination.trim() : "";
    const seats = body.seats;

    if (!busId || !startCity || !destination || startCity.toLowerCase() === destination.toLowerCase()) {
        return res.status(400).json({ message: "Choose a valid bus route." });
    }
    if (!Array.isArray(seats) || seats.length < 1 || seats.length > 8) {
        return res.status(400).json({ message: "Select between one and eight seats." });
    }

    const gateway = getRazorpayClient();
    if (!gateway) {
        return res.status(503).json({ message: "Razorpay test keys are not configured on the server." });
    }

    try {
        const bus = await findBusForOrder(busId, startCity, destination);
        if (!bus) {
            return res.status(404).json({ message: "This bus is no longer available for that route." });
        }

        const capacity = getBusCapacity(bus);
        if (!isValidSeatSelection(seats, capacity, bus.seatsBooked, bus.availableSeats)) {
            return res.status(409).json({ message: "One or more selected seats are no longer available." });
        }

        const pricePerSeat = bus.isDemo
            ? DEMO_BUS_FARE
            : Number.parseFloat(bus.pricePerSeat || bus.price);
        let amount;
        try {
            amount = calculateAmountInPaise(pricePerSeat, seats.length);
        } catch (error) {
            if (error instanceof RangeError) {
                return res.status(400).json({ message: error.message });
            }
            throw error;
        }

        const receipt = `WF${crypto.randomBytes(12).toString("hex")}`;
        const order = await gateway.client.orders.create({
            amount,
            currency: "INR",
            receipt,
            notes: {
                userId: String(req.user._id),
                busId: String(bus._id),
                startCity,
                destination,
                seats: seats.join(",")
            }
        });

        return res.status(201).json({
            keyId: gateway.keyId,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            serviceFee: SERVICE_FEE_RUPEES,
            paymentMode: "test"
        });
    } catch (error) {
        return next(error);
    }
});

router.post("/verify", async (req, res, next) => {
    const body = req.body || {};
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;
    const gateway = getRazorpayClient();

    if (!gateway) {
        return res.status(503).json({ message: "Razorpay test keys are not configured on the server." });
    }
    if (!verifyRazorpaySignature(orderId, paymentId, signature, process.env.RAZORPAY_KEY_SECRET)) {
        return res.status(400).json({ message: "The payment signature could not be verified." });
    }

    try {
        const order = await gateway.client.orders.fetch(orderId);
        if (!order.notes || String(order.notes.userId) !== String(req.user._id)) {
            return res.status(403).json({ message: "This payment does not belong to the signed-in user." });
        }

        const payment = await gateway.client.payments.fetch(paymentId);
        if (
            payment.order_id !== orderId ||
            payment.status !== "captured" ||
            payment.amount !== order.amount ||
            payment.currency !== order.currency
        ) {
            return res.status(409).json({ message: "The payment has not been captured successfully." });
        }

        return res.json({
            verified: true,
            orderId,
            paymentId,
            amount: order.amount,
            total: order.amount / 100,
            currency: order.currency,
            paymentMode: "test"
        });
    } catch (error) {
        return next(error);
    }
});

router.post("/cod", async (req, res, next) => {
    const body = req.body || {};
    const busId = typeof body.busId === "string" ? body.busId : "";
    const startCity = typeof body.startCity === "string" ? body.startCity.trim() : "";
    const destination = typeof body.destination === "string" ? body.destination.trim() : "";
    const seats = body.seats;

    if (!busId || !startCity || !destination || startCity.toLowerCase() === destination.toLowerCase()) {
        return res.status(400).json({ message: "Choose a valid bus route." });
    }
    if (!Array.isArray(seats) || seats.length < 1 || seats.length > 8) {
        return res.status(400).json({ message: "Select between one and eight seats." });
    }

    try {
        const bus = await findBusForOrder(busId, startCity, destination);
        if (!bus) {
            return res.status(404).json({ message: "This bus is no longer available for that route." });
        }

        const capacity = getBusCapacity(bus);
        if (!isValidSeatSelection(seats, capacity, bus.seatsBooked, bus.availableSeats)) {
            return res.status(409).json({ message: "One or more selected seats are no longer available." });
        }

        const pricePerSeat = bus.isDemo
            ? DEMO_BUS_FARE
            : Number.parseFloat(bus.pricePerSeat || bus.price);
        let amount;
        try {
            amount = calculateAmountInPaise(pricePerSeat, seats.length);
        } catch (error) {
            if (error instanceof RangeError) {
                return res.status(400).json({ message: error.message });
            }
            throw error;
        }

        return res.status(201).json({
            confirmed: true,
            reference: `WF${crypto.randomBytes(12).toString("hex").toUpperCase()}`,
            amount,
            total: amount / 100,
            currency: "INR",
            paymentMode: "cash"
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
