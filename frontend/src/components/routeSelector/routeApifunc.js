import api from "../API/api";

export function getCitiesFromApi() {
    return api.get("/booking/cities");
}

export function getRoutesFromApi(startCity, destination) {
    return api.post("/booking/search", { startCity, destination });
}