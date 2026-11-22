import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { FaBus, FaCheck, FaRegUserCircle, FaSignOutAlt } from "react-icons/fa";
import { getBusPrice } from "../bookingUtils";
import RouteSelector from "../routeSelector/Routeselector";
import BusList from "../BusList/BusList";
import SeatSelection from "../SeatSelection/SeatSelection";
import PaymentTab from "../PaymentTab/PaymentTab";
import { getCitiesFromApi, getRoutesFromApi } from "../routeSelector/routeApifunc";
import "./RouteSelection.css";

const initialTrip = {
    startCity: "",
    destination: "",
    travelDate: "",
    departureTime: "09:00",
    passengers: 1
};

const steps = [
    { number: 1, title: "Route", caption: "Find your bus" },
    { number: 2, title: "Seats", caption: "Choose your seats" },
    { number: 3, title: "Payment", caption: "Review and confirm" }
];

function RouteSelection({ history }) {
    const [cities, setCities] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [step, setStep] = useState(1);
    const [trip, setTrip] = useState(initialTrip);
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengerDetails, setPassengerDetails] = useState({});

    useEffect(() => {
        let isMounted = true;
        getCitiesFromApi()
            .then((response) => {
                if (isMounted) {
                    setCities(response.data.cities || []);
                }
            })
            .catch((error) => {
                if (isMounted) {
                    setSearchError(
                        error.response && error.response.data && error.response.data.message
                            ? error.response.data.message
                            : "We could not load the available cities. Please try again."
                    );
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingCities(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSearch = async (search) => {
        setTrip(search);
        setSearchError("");
        setHasSearched(true);
        setIsSearching(true);
        setSelectedBus(null);
        setSelectedSeats([]);
        setPassengerDetails({});

        try {
            const response = await getRoutesFromApi(search.startCity, search.destination);
            setBuses(response.data.bus || []);
            setStep(1);
        } catch (error) {
            setBuses([]);
            setSearchError(
                error.response && error.response.data && error.response.data.message
                    ? error.response.data.message
                    : "We could not search this route. Please try again."
            );
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectBus = (bus) => {
        setSelectedBus(bus);
        setSelectedSeats([]);
        setPassengerDetails({});
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleSeatsContinue = (seats, passengers) => {
        setSelectedSeats(seats);
        setPassengerDetails(passengers);
        setStep(3);
        window.scrollTo(0, 0);
    };

    const handlePaymentComplete = (payment) => {
        const pricePerSeat = getBusPrice(selectedBus);
        const booking = {
            reference: `WF${Date.now().toString(36).toUpperCase()}`,
            trip,
            bus: selectedBus,
            seats: selectedSeats,
            passengers: passengerDetails,
            paymentProvider: payment.paymentProvider,
            paymentMode: payment.paymentMode,
            orderId: payment.orderId,
            paymentId: payment.paymentId,
            subtotal: pricePerSeat * selectedSeats.length,
            serviceFee: 150,
            total: payment.total,
            createdAt: new Date().toISOString()
        };
        sessionStorage.setItem("bookingData", JSON.stringify(booking));
        history.push("/getTicket");
    };

    const signOut = () => {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("bookingData");
        history.push("/");
    };

    if (!sessionStorage.getItem("authToken")) {
        return <Redirect to="/login" />;
    }

    return (
        <div className="booking-page">
            <header className="booking-header">
                <button className="booking-brand" type="button" onClick={() => history.push("/routes")}>
                    <span><FaBus aria-hidden="true" /></span>
                    wayfare<span className="brand-period">.</span>
                </button>
                <div className="booking-header-actions">
                    <button type="button" className="booking-profile" onClick={() => history.push("/profile")}>
                        <FaRegUserCircle aria-hidden="true" />
                        <span>My profile</span>
                    </button>
                    <button type="button" className="booking-signout" onClick={signOut}>
                        <FaSignOutAlt aria-hidden="true" />
                        <span>Sign out</span>
                    </button>
                </div>
            </header>

            <main className="booking-content">
                <div className="booking-welcome">
                    <div>
                        <p className="booking-eyebrow">YOUR NEXT JOURNEY</p>
                        <h1>Make a day of getting there.</h1>
                        <p>Thoughtful trips start with the right route, the right seat, and a little anticipation.</p>
                    </div>
                    <div className="welcome-stamp"><FaBus aria-hidden="true" /><span>TAKE<br />THE SCENIC<br />ROUTE</span></div>
                </div>

                <nav className="booking-stepper" aria-label="Booking steps">
                    {steps.map((item, index) => (
                        <React.Fragment key={item.number}>
                            <div className={`step-item${step === item.number ? " is-current" : ""}${step > item.number ? " is-complete" : ""}`}>
                                <span className="step-number">{step > item.number ? <FaCheck aria-hidden="true" /> : item.number}</span>
                                <span className="step-copy"><strong>{item.title}</strong><small>{item.caption}</small></span>
                            </div>
                            {index < steps.length - 1 && <span className={`step-connector${step > item.number ? " is-complete" : ""}`} />}
                        </React.Fragment>
                    ))}
                </nav>

                {searchError && <p className="booking-error" role="alert">{searchError}</p>}

                {step === 1 && (
                    <section className="booking-stage">
                        {isLoadingCities ? (
                            <div className="booking-loading" role="status">Loading available destinations...</div>
                        ) : (
                            <>
                                <RouteSelector
                                    cities={cities}
                                    initialTrip={trip}
                                    isLoading={isSearching}
                                    onSearch={handleSearch}
                                />
                                <BusList
                                    buses={buses}
                                    trip={trip}
                                    hasSearched={hasSearched}
                                    onSelect={handleSelectBus}
                                />
                            </>
                        )}
                    </section>
                )}

                {step === 2 && selectedBus && (
                    <SeatSelection
                        bus={selectedBus}
                        passengerCount={trip.passengers}
                        initialSeats={selectedSeats}
                        initialPassengers={passengerDetails}
                        onBack={() => setStep(1)}
                        onContinue={handleSeatsContinue}
                    />
                )}

                {step === 3 && selectedBus && (
                    <PaymentTab
                        trip={trip}
                        bus={selectedBus}
                        seats={selectedSeats}
                        passengers={passengerDetails}
                        onBack={() => setStep(2)}
                        onComplete={handlePaymentComplete}
                    />
                )}

                <footer className="booking-page-footer">
                    <span>Wayfare · made for the miles ahead</span>
                    <span>Need help? Your trip details stay here while you book.</span>
                </footer>
            </main>
        </div>
    );
}

export default RouteSelection;
