import axios from "axios";

const localApiUrl = "http://localhost:8080";
const api = axios.create({
    baseURL: process.env.VITE_API_BASE_URL ||
        (process.env.NODE_ENV === "production" ? "" : localApiUrl)
});

api.interceptors.request.use((config) => {
    const authToken = sessionStorage.getItem("authToken");
    if (authToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

export default api;
