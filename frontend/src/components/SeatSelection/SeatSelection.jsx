import React, { useMemo, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaBus, FaCheck, FaInfoCircle } from "react-icons/fa";
import { getAvailableSeatCount, getBookedSeatIds, getBusName, getBusType, getSeatCapacity } from "../bookingUtils";
import "./Tab.css";

const seatLetters = ["A", "B", "C", "D"];

function SeatSelection({ bus, passengerCount, initialSeats, initialPassengers, onBack, onContinue }) {
    const totalSeats = getSeatCapacity(bus);
    const availableCount = getAvailableSeatCount(bus);
    const bookedSeats = getBookedSeatIds(bus);

    const seats = useMemo(
        () => Array.from({ length: totalSeats }, (_, index) => ({
            id: `${Math.floor(index / seatLetters.length) + 1}${seatLetters[index % seatLetters.length]}`,
            index
        })),
        [totalSeats]
    );
    const [selectedSeats, setSelectedSeats] = useState(initialSeats);
    const [passengers, setPassengers] = useState(initialPassengers);
    const [error, setError] = useState("");

    const updatePassenger = (seat, field, value) => {
        setPassengers((currentPassengers) => ({
            ...currentPassengers,
            [seat]: { ...currentPassengers[seat], [field]: value }
        }));
        setError("");
    };

    const toggleSeat = (seat) => {
        setError("");
        if (selectedSeats.includes(seat)) {
            setSelectedSeats((currentSeats) => currentSeats.filter((item) => item !== seat));
            setPassengers((currentPassengers) => {
                const nextPassengers = { ...currentPassengers };
                delete nextPassengers[seat];
                return nextPassengers;
            });
            return;
        }

        if (selectedSeats.length >= passengerCount) {
            setError(`You selected ${passengerCount} ${passengerCount === 1 ? "passenger" : "passengers"}. Choose the same number of seats.`);
            return;
        }
        setSelectedSeats((currentSeats) => [...currentSeats, seat]);
    };

    const continueToPayment = () => {
        if (selectedSeats.length !== passengerCount) {
            setError(`Please choose ${passengerCount} ${passengerCount === 1 ? "seat" : "seats"} to match your passengers.`);
            return;
        }

        const missingPassenger = selectedSeats.find((seat) => !passengers[seat] || !passengers[seat].name.trim());
        if (missingPassenger) {
            setError(`Add a passenger name for seat ${missingPassenger}.`);
            return;
        }

        onContinue(selectedSeats, passengers);
    };

    return (
        <section className="seat-stage">
            <div className="seat-stage-heading">
                <div>
                    <p className="booking-eyebrow">STEP 2 OF 3</p>
                    <h2>Choose your seats</h2>
                    <p>Pick {passengerCount} {passengerCount === 1 ? "seat" : "seats"} and add passenger details.</p>
                </div>
                <div className="seat-bus-summary">
                    <span><FaBus aria-hidden="true" /></span>
                    <div><strong>{getBusName(bus)}</strong><small>{getBusType(bus)}</small></div>
                </div>
            </div>

            <div className="seat-stage-grid">
                <div className="seat-map-card">
                    <div className="seat-map-top">
                        <div>
                            <h3>Seat map</h3>
                            <p>{availableCount} seats listed as available</p>
                        </div>
                        <div className="seat-legend">
                            <span><i className="legend-seat legend-available" />Available</span>
                            <span><i className="legend-seat legend-selected" />Selected</span>
                            <span><i className="legend-seat legend-unavailable" />Unavailable</span>
                        </div>
                    </div>

                    <div className="bus-layout">
                        <div className="driver-cabin"><span>FRONT</span><FaBus aria-hidden="true" /></div>
                        <div className="seat-map">
                            {seats.map(({ id, index }) => {
                                const isUnavailable = bookedSeats
                                    ? bookedSeats.includes(id)
                                    : index >= availableCount;
                                const isSelected = selectedSeats.includes(id);
                                return (
                                    <button
                                        key={id}
                                        className={`seat-choice${isSelected ? " is-selected" : ""}${isUnavailable ? " is-unavailable" : ""}`}
                                        type="button"
                                        disabled={isUnavailable}
                                        aria-pressed={isSelected}
                                        aria-label={`Seat ${id}${isUnavailable ? ", unavailable" : isSelected ? ", selected" : ", available"}`}
                                        onClick={() => toggleSeat(id)}
                                    >
                                        {isSelected ? <FaCheck aria-hidden="true" /> : id}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <p className="seat-data-note"><FaInfoCircle aria-hidden="true" /> {bookedSeats ? "Booked seat numbers come from this bus record." : "This sample bus only provides an available-seat count; unavailable seat numbers are estimated."}</p>
                </div>

                <div className="passenger-card">
                    <div className="passenger-card-heading">
                        <h3>Passenger details</h3>
                        <span>{selectedSeats.length}/{passengerCount}</span>
                    </div>
                    {selectedSeats.length === 0 ? (
                        <div className="passenger-empty">Select a seat to add passenger details.</div>
                    ) : (
                        <div className="passenger-list">
                            {selectedSeats.map((seat) => (
                                <div className="passenger-entry" key={seat}>
                                    <div className="passenger-entry-title"><span>SEAT {seat}</span><FaCheck aria-hidden="true" /></div>
                                    <label htmlFor={`passenger-${seat}`}>Full name</label>
                                    <input
                                        id={`passenger-${seat}`}
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Passenger name"
                                        value={passengers[seat] ? passengers[seat].name || "" : ""}
                                        onChange={(event) => updatePassenger(seat, "name", event.target.value)}
                                        required
                                    />
                                    <label htmlFor={`gender-${seat}`}>Gender</label>
                                    <select
                                        id={`gender-${seat}`}
                                        value={passengers[seat] ? passengers[seat].gender || "Prefer not to say" : "Prefer not to say"}
                                        onChange={(event) => updatePassenger(seat, "gender", event.target.value)}
                                    >
                                        <option>Prefer not to say</option>
                                        <option>Female</option>
                                        <option>Male</option>
                                        <option>Non-binary</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                    {error && <p className="booking-inline-error" role="alert">{error}</p>}
                    <div className="seat-actions">
                        <button className="booking-secondary" type="button" onClick={onBack}><FaArrowLeft aria-hidden="true" /> Back to buses</button>
                        <button className="booking-primary" type="button" onClick={continueToPayment}>Continue <FaArrowRight aria-hidden="true" /></button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SeatSelection;
