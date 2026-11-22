export const CITIES = [
    "Agra",
    "Ahmedabad",
    "Ajmer",
    "Amritsar",
    "Bangalore",
    "Bhopal",
    "Bhubaneswar",
    "Chandigarh",
    "Chennai",
    "Coimbatore",
    "Dehradun",
    "Delhi",
    "Dharamshala",
    "Goa",
    "Guntur",
    "Gurugram",
    "Guwahati",
    "Gwalior",
    "Hyderabad",
    "Indore",
    "Jaipur",
    "Jaisalmer",
    "Jodhpur",
    "Kakinada",
    "Kanpur",
    "Kochi",
    "Kolkata",
    "Kozhikode",
    "Lucknow",
    "Ludhiana",
    "Madurai",
    "Mangaluru",
    "Mumbai",
    "Mysuru",
    "Nagpur",
    "Nashik",
    "Ooty",
    "Patna",
    "Prayagraj",
    "Pune",
    "Raipur",
    "Ranchi",
    "Rishikesh",
    "Salem",
    "Shimla",
    "Surat",
    "Thiruvananthapuram",
    "Tiruchirappalli",
    "Tirunelveli",
    "Udaipur",
    "Vadodara",
    "Varanasi",
    "Vijayawada",
    "Visakhapatnam"
];

const DEMO_BUS_FARE = 500;

export function getBusesForRoute(startCity, destination) {
    if (
        !CITIES.includes(startCity) ||
        !CITIES.includes(destination) ||
        startCity.toLowerCase() === destination.toLowerCase()
    ) {
        return [];
    }

    return [{
        _id: `demo-${startCity}-${destination}`,
        busName: "Wayfare Sample Coach",
        busType: "Sample AC coach",
        busNumber: "DEMO-001",
        startCity,
        destination,
        totalSeats: "40",
        availableSeats: "40",
        seatsBooked: [],
        price: String(DEMO_BUS_FARE),
        isDemo: true
    }];
}
