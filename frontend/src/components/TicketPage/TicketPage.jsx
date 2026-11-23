import React, { useState } from "react";
import { FaArrowRight, FaBus, FaCalendarAlt, FaCheck, FaMapMarkerAlt, FaPrint, FaTicketAlt } from "react-icons/fa";
import { getBusName } from "../bookingUtils";
import "./TicketPage.css";

function readBooking() {
    const storedBooking = sessionStorage.getItem("bookingData");
    if (!storedBooking) {
        return { booking: null, error: "No confirmed trip was found in this session." };
    }

    try {
        return { booking: JSON.parse(storedBooking), error: "" };
    } catch {
        return { booking: null, error: "This ticket could not be loaded. Please start a new booking." };
    }
}

function formatDate(value) {
    if (!value) {
        return "Date not selected";
    }
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function TicketPage({ history }) {
    const [ticketData] = useState(readBooking);
    const booking = ticketData.booking;

    const startNewBooking = () => {
        sessionStorage.removeItem("bookingData");
        history.push("/routes");
    };

    if (!booking) {
        return (
            <main className="ticket-page">
                <section className="ticket-empty">
                    <span><FaTicketAlt aria-hidden="true" /></span>
                    <h1>Ticket unavailable</h1>
                    <p>{ticketData.error}</p>
                    <button className="booking-primary" type="button" onClick={startNewBooking}>Start a new booking <FaArrowRight aria-hidden="true" /></button>
                </section>
            </main>
        );
    }

    const passengers = booking.seats.map((seat) => ({
        seat,
        ...(booking.passengers[seat] || {})
    }));

    return (
        <main className="ticket-page">
            <header className="ticket-header">
                <button className="booking-brand" type="button" onClick={startNewBooking}>
                    <span><FaBus aria-hidden="true" /></span>
                    wayfare<span className="brand-period">.</span>
                </button>
                <span className="ticket-confirmed"><FaCheck aria-hidden="true" /> BOOKING CONFIRMED</span>
            </header>

            <div className="ticket-booked-alert" role="status">
                <FaCheck aria-hidden="true" />
                <span>Your ticket is booked! Your digital ticket is ready.</span>
            </div>

            <section className="ticket-success">
                <span className="success-check"><FaCheck aria-hidden="true" /></span>
                <p className="booking-eyebrow">YOU'RE ALL SET</p>
                <h1>Your journey is on the books.</h1>
                <p className="ticket-intro">Your demo booking summary is ready. Have a lovely trip.</p>
            </section>

            <article className="ticket-card">
                <div className="ticket-card-header">
                    <div className="ticket-card-brand"><span><FaBus aria-hidden="true" /></span><strong>wayfare</strong></div>
                    <div className="ticket-reference"><small>BOOKING REFERENCE</small><strong>{booking.reference}</strong></div>
                </div>

                <div className="ticket-route">
                    <div className="ticket-city">
                        <span><FaMapMarkerAlt aria-hidden="true" /></span>
                        <small>FROM</small>
                        <strong>{booking.trip.startCity}</strong>
                        <em>{booking.bus.departureTime || booking.trip.departureTime}</em>
                    </div>
                    <div className="ticket-route-art"><span /><FaBus aria-hidden="true" /><span /></div>
                    <div className="ticket-city ticket-city-end">
                        <span><FaMapMarkerAlt aria-hidden="true" /></span>
                        <small>TO</small>
                        <strong>{booking.trip.destination}</strong>
                        <em>{booking.bus.arrivalTime || "Arrival time not listed"}</em>
                    </div>
                </div>

                <div className="ticket-details-grid">
                    <div><small><FaCalendarAlt aria-hidden="true" /> TRAVEL DATE</small><strong>{formatDate(booking.trip.travelDate)}</strong></div>
                    <div><small><FaBus aria-hidden="true" /> OPERATOR</small><strong>{getBusName(booking.bus)}</strong></div>
                    <div><small><FaTicketAlt aria-hidden="true" /> SEATS</small><strong>{booking.seats.join(", ")}</strong></div>
                    <div>
                        <small><FaCheck aria-hidden="true" /> PAYMENT</small>
                        <strong>
                            {booking.paymentProvider}
                            {booking.paymentMode === "test" ? " · Test mode" : booking.paymentMode === "cash" ? " · Pay at pickup" : " · Verified"}
                        </strong>
                    </div>
                </div>

                <div className="ticket-passengers">
                    <div className="ticket-section-heading"><h2>Passenger details</h2><span>{passengers.length} {passengers.length === 1 ? "passenger" : "passengers"}</span></div>
                    {passengers.map((passenger) => (
                        <div className="ticket-passenger-row" key={passenger.seat}>
                            <span className="passenger-initial">{passenger.name ? passenger.name.charAt(0).toUpperCase() : "P"}</span>
                            <strong>{passenger.name || "Passenger"}</strong>
                            <small>Seat {passenger.seat}</small>
                        </div>
                    ))}
                </div>

                <div className="ticket-total">
                    <span>Total · demo only</span>
                    <strong>₹{Number(booking.total || 0).toLocaleString("en-IN")}</strong>
                </div>
                <p className="ticket-demo-note">
                    {booking.paymentMode === "cash"
                        ? "Cash on delivery selected. Keep the exact ticket amount ready and pay when the ticket is delivered."
                        : "Razorpay test payment verified; no real money was charged."}
                    {" "}This is not a confirmed real-world bus reservation.
                    {booking.bus.isDemo && " The sample bus listing is not a scheduled service."}
                </p>
            </article>

            <div className="ticket-actions">
                <button className="booking-primary" type="button" onClick={startNewBooking}>Book another trip <FaArrowRight aria-hidden="true" /></button>
                <button className="ticket-print" type="button" onClick={() => window.print()}>
                    <FaPrint aria-hidden="true" /> Save ticket as PDF
                </button>
            </div>
            <p className="ticket-save-hint">Use the print dialog to save a PDF, or take a screenshot of this digital ticket.</p>
        </main>
    );
}

export default TicketPage;
