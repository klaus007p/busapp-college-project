import React, { useState } from "react";
import { FaArrowRight, FaCalendarAlt, FaExchangeAlt, FaMapMarkerAlt, FaSearch, FaUsers } from "react-icons/fa";
import "./Routeselector.css";

function getToday() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
}

export default function Routeselector({ cities, initialTrip, isLoading, onSearch }) {
    const [form, setForm] = useState({
        startCity: initialTrip.startCity || "",
        destination: initialTrip.destination || "",
        travelDate: initialTrip.travelDate || getToday(),
        departureTime: initialTrip.departureTime || "09:00",
        passengers: initialTrip.passengers || "1"
    });
    const [formError, setFormError] = useState("");

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((currentForm) => ({ ...currentForm, [name]: value }));
        setFormError("");
    };

    const swapCities = () => {
        setForm((currentForm) => ({
            ...currentForm,
            startCity: currentForm.destination,
            destination: currentForm.startCity
        }));
    };

    const submitSearch = (event) => {
        event.preventDefault();
        if (!form.startCity || !form.destination) {
            setFormError("Choose a departure city and destination.");
            return;
        }
        if (form.startCity.toLowerCase() === form.destination.toLowerCase()) {
            setFormError("Your destination must be different from your departure city.");
            return;
        }
        onSearch({ ...form, passengers: Number(form.passengers) });
    };

    return (
        <form className="trip-search" onSubmit={submitSearch}>
            <div className="trip-search-heading">
                <div>
                    <p className="booking-eyebrow">PLAN YOUR JOURNEY</p>
                    <h2>Where would you like to go?</h2>
                    <p className="booking-muted">Choose your route and travel details to see available buses.</p>
                </div>
                <span className="search-icon"><FaSearch aria-hidden="true" /></span>
            </div>

            <div className="trip-fields">
                <label className="trip-field">
                    <span><FaMapMarkerAlt aria-hidden="true" /> FROM</span>
                    <select name="startCity" value={form.startCity} onChange={updateField} required>
                        <option value="">Select departure city</option>
                        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                    </select>
                </label>

                <button className="swap-cities" type="button" onClick={swapCities} aria-label="Swap departure and destination">
                    <FaExchangeAlt aria-hidden="true" />
                </button>

                <label className="trip-field">
                    <span><FaMapMarkerAlt aria-hidden="true" /> TO</span>
                    <select name="destination" value={form.destination} onChange={updateField} required>
                        <option value="">Select destination city</option>
                        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                    </select>
                </label>

                <label className="trip-field">
                    <span><FaCalendarAlt aria-hidden="true" /> TRAVEL DATE</span>
                    <input type="date" name="travelDate" min={getToday()} value={form.travelDate} onChange={updateField} required />
                </label>

                <label className="trip-field">
                    <span><FaUsers aria-hidden="true" /> PASSENGERS</span>
                    <select name="passengers" value={form.passengers} onChange={updateField}>
                        {[1, 2, 3, 4, 5, 6].map((count) => (
                            <option key={count} value={count}>{count} {count === 1 ? "passenger" : "passengers"}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="trip-search-footer">
                <div className="time-field">
                    <label htmlFor="departureTime">Preferred departure time</label>
                    <input id="departureTime" name="departureTime" type="time" value={form.departureTime} onChange={updateField} required />
                    <small>Displayed as your requested time; live schedules are not available for these sample buses.</small>
                </div>
                <button className="booking-primary search-submit" type="submit" disabled={isLoading || cities.length === 0}>
                    <span>{isLoading ? "Searching..." : "Find buses"}</span>
                    {!isLoading && <FaArrowRight aria-hidden="true" />}
                </button>
            </div>

            {formError && <p className="booking-inline-error" role="alert">{formError}</p>}
        </form>
    );
}
