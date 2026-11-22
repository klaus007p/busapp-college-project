import api from "../API/api";

export function logUserIn(userCredentials) {
    return api.post("/login", userCredentials);
}


export function loadRoutes() {
    return api.get("/user/profile");
}

export function getCurrentUserDetails() {
    return api.get("/user/profile");
}