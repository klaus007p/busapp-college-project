import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaBus, FaCheckCircle, FaLock, FaMoneyBillWave, FaRegCalendarAlt } from "react-icons/fa";
import { getBusName, getBusPrice, getBusType } from "../bookingUtils";
import { confirmCashOnDelivery, createPaymentOrder, verifyPayment } from "./paymentApi";
import "./PaymentTab.css";

function loadRazorpayCheckout() {
    if (window.Razorpay) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () => {
            script.remove();
            reject(new Error("Razorpay Checkout could not be loaded. Check your connection and try again."));
        };
        document.body.appendChild(script);
    });
}

function getErrorMessage(error) {
    return error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || "Payment could not be started. Please try again.";
}

function formatDate(value) {
    if (!value) {
        return "Date not selected";
    }
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function PaymentTab({ trip, bus, seats, passengers, onBack, onComplete }) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("razorpay");
    const pricePerSeat = getBusPrice(bus);
    const subtotal = pricePerSeat * seats.length;
    const serviceFee = 150;
    const total = subtotal + serviceFee;

    const confirmBooking = async () => {
        setIsCompleting(true);
        setPaymentError("");

        try {
            if (paymentMethod === "cod") {
                const response = await confirmCashOnDelivery({
                    busId: bus._id,
                    startCity: trip.startCity,
                    destination: trip.destination,
                    seats
                });
                const confirmation = response.data;
                if (!confirmation.confirmed) {
                    throw new Error("Cash on delivery could not be confirmed. Please try again.");
                }
                if (Math.round(confirmation.total * 100) !== Math.round(total * 100)) {
                    throw new Error("The fare changed. Please start a new booking and review the updated price.");
                }
                onComplete({
                    paymentProvider: "Cash on delivery",
                    orderId: confirmation.reference,
                    paymentId: "",
                    paymentMode: "cash",
                    total: confirmation.total
                });
                return;
            }

            await loadRazorpayCheckout();
            const response = await createPaymentOrder({
                busId: bus._id,
                startCity: trip.startCity,
                destination: trip.destination,
                seats
            });
            const order = response.data;
            if (order.amount !== Math.round(total * 100)) {
                throw new Error("The fare changed. Please start a new booking and review the updated price.");
            }
            if (typeof window.Razorpay !== "function") {
                throw new Error("Razorpay Checkout is unavailable. Please try again.");
            }

            const checkout = new window.Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "Wayfare",
                description: `${trip.startCity} to ${trip.destination}`,
                order_id: order.orderId,
                prefill: {
                    name: passengers[seats[0]] ? passengers[seats[0]].name : ""
                },
                theme: { color: "#1d5b48" },
                modal: {
                    ondismiss: () => setIsCompleting(false)
                },
                handler: async (paymentResponse) => {
                    try {
                        const verificationResponse = await verifyPayment(paymentResponse);
                        const verification = verificationResponse.data;
                        if (!verification.verified) {
                            throw new Error("The payment could not be verified. No ticket was issued.");
                        }
                        onComplete({
                            paymentProvider: "Razorpay",
                            orderId: verification.orderId,
                            paymentId: verification.paymentId,
                            paymentMode: verification.paymentMode,
                            total: verification.total
                        });
                    } catch (error) {
                        setPaymentError(getErrorMessage(error));
                        setIsCompleting(false);
                    }
                }
            });

            checkout.on("payment.failed", (paymentFailure) => {
                const description = paymentFailure.error && paymentFailure.error.description;
                setPaymentError(description || "Payment failed. Please try again.");
                setIsCompleting(false);
            });
            checkout.open();
        } catch (error) {
            setPaymentError(getErrorMessage(error));
            setIsCompleting(false);
        }
    };

    return (
        <section className="payment-stage">
            <div className="payment-heading">
                <div>
                    <p className="booking-eyebrow">STEP 3 OF 3</p>
                    <h2>Review and pay</h2>
                    <p>One last look at your trip before it is yours.</p>
                </div>
                <div className="payment-secure"><FaLock aria-hidden="true" /> Secure checkout</div>
            </div>

            <div className="payment-grid">
                <div className="payment-main">
                    <article className="payment-trip-card">
                        <div className="payment-card-top">
                            <span><FaBus aria-hidden="true" /> WAYFARE TRIP</span>
                            <span className="trip-date"><FaRegCalendarAlt aria-hidden="true" /> {formatDate(trip.travelDate)}</span>
                        </div>
                        <div className="payment-route">
                            <div><strong>{trip.startCity}</strong><small>{bus.departureTime || trip.departureTime || "Time not listed"}</small></div>
                            <div className="payment-route-line"><span /><FaBus aria-hidden="true" /><span /></div>
                            <div><strong>{trip.destination}</strong><small>{bus.arrivalTime || "Arrival time not listed"}</small></div>
                        </div>
                        <div className="payment-bus-name">{getBusName(bus)} · {getBusType(bus)}</div>
                    </article>

                    <section className="payment-methods">
                        <div className="section-title-row">
                            <div><h3>Choose payment method</h3><p>Select how you want to pay for this ticket.</p></div>
                            <FaLock aria-hidden="true" />
                        </div>
                        <div className="payment-method-options" role="radiogroup" aria-label="Payment method">
                            <label className={`payment-method-option${paymentMethod === "razorpay" ? " is-selected" : ""}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="razorpay"
                                    checked={paymentMethod === "razorpay"}
                                    onChange={() => setPaymentMethod("razorpay")}
                                />
                                <span className="payment-method-icon"><FaLock aria-hidden="true" /></span>
                                <span><strong>Pay online with Razorpay</strong><small>Card, UPI, or supported checkout methods</small></span>
                            </label>
                            <label className={`payment-method-option${paymentMethod === "cod" ? " is-selected" : ""}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === "cod"}
                                    onChange={() => setPaymentMethod("cod")}
                                />
                                <span className="payment-method-icon"><FaMoneyBillWave aria-hidden="true" /></span>
                                <span><strong>Cash on delivery</strong><small>Pay ₹{total.toLocaleString("en-IN")} when you receive the ticket</small></span>
                            </label>
                        </div>
                        {paymentMethod === "razorpay" ? (
                            <div className="razorpay-payment-note">
                                <FaCheckCircle aria-hidden="true" />
                                <p><strong>Razorpay test mode</strong><span>Test credentials do not charge real money. Wayfare never receives or stores your card details.</span></p>
                            </div>
                        ) : (
                            <div className="razorpay-payment-note cod-payment-note">
                                <FaCheckCircle aria-hidden="true" />
                                <p><strong>Cash is payable at pickup</strong><span>Keep the exact amount ready. This demo does not collect or store card or bank details.</span></p>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="payment-summary">
                    <h3>Booking summary</h3>
                    <div className="summary-bus">
                        <span className="summary-bus-icon"><FaBus aria-hidden="true" /></span>
                        <div><strong>{getBusName(bus)}</strong><small>{seats.length} {seats.length === 1 ? "seat" : "seats"} · {seats.join(", ")}</small></div>
                    </div>
                    <div className="summary-passengers">
                        <span>PASSENGERS</span>
                        {seats.map((seat) => (
                            <p key={seat}><strong>{passengers[seat].name}</strong><small>Seat {seat}</small></p>
                        ))}
                    </div>
                    <div className="summary-costs">
                        <p><span>Seat fare × {seats.length}</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></p>
                        <p><span>Service fee</span><strong>₹{serviceFee.toLocaleString("en-IN")}</strong></p>
                        <p className="summary-total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></p>
                    </div>
                    {paymentError && <p className="booking-inline-error" role="alert">{paymentError}</p>}
                    <div className="payment-actions">
                        <button className="booking-primary" type="button" disabled={isCompleting} onClick={confirmBooking}>
                            {isCompleting
                                ? (paymentMethod === "cod" ? "Confirming cash booking..." : "Opening secure checkout...")
                                : (paymentMethod === "cod"
                                    ? `Confirm booking · Pay ₹${total.toLocaleString("en-IN")} at pickup`
                                    : `Pay ₹${total.toLocaleString("en-IN")} with Razorpay`)}
                            {!isCompleting && <FaArrowRight aria-hidden="true" />}
                        </button>
                        <button className="booking-secondary" type="button" onClick={onBack}>
                            <FaArrowLeft aria-hidden="true" /> Back to seats
                        </button>
                    </div>
                    <p className="payment-fine-print">
                        {paymentMethod === "cod"
                            ? "Your demo ticket is confirmed now and the fare is due on delivery."
                            : "Your ticket is issued only after the server verifies a successful Razorpay test payment."}
                    </p>
                </aside>
            </div>
        </section>
    );
}

export default PaymentTab;
