const express = require("express");
const Bus = require("../models/Buses");
const { createDemoBus } = require("../services/demoBus");

const router = express.Router();

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/cities", async (req, res, next) => {
    try {
        const [origins, destinations] = await Promise.all([
            Bus.distinct("startCity"),
            Bus.distinct("destination")
        ]);
        const cityMap = new Map();

        [...origins, ...destinations].forEach((city) => {
            if (typeof city === "string" && city.trim()) {
                const normalizedCity = city.trim();
                const key = normalizedCity.toLowerCase();
                if (!cityMap.has(key)) {
                    cityMap.set(key, normalizedCity);
                }
            }
        });

        return res.json({ cities: Array.from(cityMap.values()).sort() });
    } catch (error) {
        return next(error);
    }
});

async function searchBuses(req, res, next) {
    const startCity = typeof req.body.startCity === "string" ? req.body.startCity.trim() : "";
    const destination = typeof req.body.destination === "string" ? req.body.destination.trim() : "";

    if (!startCity || !destination || startCity.toLowerCase() === destination.toLowerCase()) {
        return res.status(400).json({ message: "Choose two different cities." });
    }

    try {
        const buses = await Bus.find({
            startCity: new RegExp(`^${escapeRegex(startCity)}$`, "i"),
            destination: new RegExp(`^${escapeRegex(destination)}$`, "i")
        }).lean();
        return res.json({ bus: buses.length ? buses : [createDemoBus(startCity, destination)] });
    } catch (error) {
        return next(error);
    }
}

router.post("/", searchBuses);
router.post("/search", searchBuses);

module.exports = router;
