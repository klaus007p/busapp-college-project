import React from "react";
import { FaArrowRight, FaBus, FaClock, FaRegCalendarAlt, FaUsers } from "react-icons/fa";
import { getAvailableSeatCount, getBusName, getBusPrice, getBusType } from "../bookingUtils";
import "./busList.css";

function formatDate(value) {
    if (!value) {
        return "Date not selected";
    }
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}

function BusList({ buses, trip, hasSearched, onSelect }) {
    if (!hasSearched) {
        return (
            <section className="search-empty">
                <span className="empty-icon"><FaBus aria-hidden="true" /></span>
                <h3>Your next ride starts here</h3>
                <p>Enter your route and travel details above to find available buses.</p>
            </section>
        );
    }

    if (buses.length === 0) {
        return (
            <section className="search-empty">
                <span className="empty-icon"><FaBus aria-hidden="true" /></span>
                <h3>No buses found for this route</h3>
                <p>Try a different city pair or travel date.</p>
            </section>
        );
    }

    return (
        <section className="bus-results" aria-label="Available buses">
            <div className="results-heading">
                <div>
                    <p className="booking-eyebrow">YOUR OPTIONS</p>
                    <h2>{buses.length} {buses.length === 1 ? "bus" : "buses"} for your journey</h2>
                </div>
                <div className="results-trip-meta">
                    <span><FaRegCalendarAlt aria-hidden="true" /> {formatDate(trip.travelDate)}</span>
                    <span><FaUsers aria-hidden="true" /> {trip.passengers} {trip.passengers === 1 ? "passenger" : "passengers"}</span>
                </div>
            </div>

            <div className="bus-card-list">
                {buses.map((bus, index) => {
                    const availableSeats = Number.parseInt(bus.availableSeats, 10);
                    const actualDeparture = bus.departureTime;
                    const actualArrival = bus.arrivalTime;
                    const companyName = getBusName(bus);
                    const busType = getBusType(bus);
                    const price = getBusPrice(bus);
                    const seatsAvailable = getAvailableSeatCount(bus);
                    const isDemoBus = bus.isDemo === true;

                    return (
                        <article className="bus-card" key={bus._id || `${companyName}-${bus.busNumber}-${index}`}>
                            <div className="bus-card-main">
                                <div className="bus-operator">
                                    <span className="operator-icon"><FaBus aria-hidden="true" /></span>
                                    <div>
                                        <h3>{companyName}</h3>
                                        <p>
                                            {busType}{bus.busNumber ? ` · ${bus.busNumber}` : ""}
                                            {isDemoBus && <span className="demo-listing-badge">SAMPLE BUS</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="bus-time-grid">
                                    <div>
                                        <strong>{actualDeparture || trip.departureTime || "--:--"}</strong>
                                        <small>{bus.startCity || trip.startCity}</small>
                                        <span>{actualDeparture ? "Scheduled departure" : "Preferred time"}</span>
                                    </div>
                                    <div className="bus-duration"><span /><FaArrowRight aria-hidden="true" /><span /></div>
                                    <div>
                                        <strong>{actualArrival || "Arrival time unavailable"}</strong>
                                        <small>{bus.destination || trip.destination}</small>
                                        <span>{actualArrival ? "Arrival" : "Sample schedule"}</span>
                                    </div>
                                </div>

                                <div className="bus-availability">
                                    <FaClock aria-hidden="true" />
                                    <span>{Number.isNaN(availableSeats) ? "Seat count not provided" : `${seatsAvailable} seats listed as available`}</span>
                                </div>
                            </div>

                            <div className="bus-card-action">
                                <span className="price-label">{isDemoBus ? "SAMPLE FARE / SEAT" : "PRICE PER SEAT"}</span>
                                <strong>{price ? `₹${price.toLocaleString("en-IN")}` : "Price unavailable"}</strong>
                                <button
                                    className="booking-primary"
                                    type="button"
                                    disabled={seatsAvailable < trip.passengers}
                                    onClick={() => onSelect(bus)}
                                >
                                    Choose seats <FaArrowRight aria-hidden="true" />
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
            <p className="schedule-disclaimer">
                Sample listings are placeholders, not real services. Schedules and seat maps are not live; existing seat availability
                comes from stored records.
            </p>
        </section>
    );
}

export default BusList;
