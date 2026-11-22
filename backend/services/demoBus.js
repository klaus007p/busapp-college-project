const DEMO_BUS_FARE = 500;

function createDemoBus(startCity, destination) {
    return {
        _id: `demo-${startCity}-${destination}`,
        busName: "Wayfare Sample Coach",
        companyName: "Wayfare Demo",
        busType: "Sample AC coach",
        busNumber: "DEMO-001",
        startCity,
        destination,
        totalSeats: "40",
        availableSeats: "40",
        seatsBooked: [],
        price: String(DEMO_BUS_FARE),
        isDemo: true
    };
}

module.exports = { DEMO_BUS_FARE, createDemoBus };
