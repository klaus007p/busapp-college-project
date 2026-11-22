export function getBusName(bus) {
    return bus.companyName || bus.CompanyName || bus.busName || "Intercity bus";
}

export function getBusType(bus) {
    return bus.busType || "Intercity coach";
}

export function getBusPrice(bus) {
    return Number.parseFloat(bus.pricePerSeat || bus.price) || 0;
}

export function getSeatCapacity(bus) {
    const totalSeats = Number.parseInt(bus.totalSeats, 10);
    const availableSeats = Number.parseInt(bus.availableSeats, 10);
    return Math.max(1, totalSeats || availableSeats || 40);
}

export function getAvailableSeatCount(bus) {
    const capacity = getSeatCapacity(bus);
    if (Array.isArray(bus.seatsBooked)) {
        return Math.max(0, capacity - new Set(bus.seatsBooked.map(String)).size);
    }

    const availableSeats = Number.parseInt(bus.availableSeats, 10);
    return Number.isNaN(availableSeats)
        ? capacity
        : Math.max(0, Math.min(availableSeats, capacity));
}

export function getBookedSeatIds(bus) {
    return Array.isArray(bus.seatsBooked) ? bus.seatsBooked.map(String) : null;
}
