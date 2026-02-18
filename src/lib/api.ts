// lib/api.ts — Axios instance with auth interceptor
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    timeout: 60000, // 60s — Render free-tier cold starts can take ~30-50s
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
