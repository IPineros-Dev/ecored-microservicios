import express from "express";
import { gatewayIdentity } from "./auth.js";
import {
    ALLOWED_STATUSES,
    validateCreateRequest,
    validateStatusUpdate,
} from "./validation.js";

export function createApp({ repository }) {
    const app = express();
    app.use(express.json());

    // Factor XI (Logs): emitir eventos estructurados a stdout.
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            console.log(
                JSON.stringify({
                    service: "requests-service",
                    method: req.method,
                    path: req.originalUrl,
                    status: res.statusCode,
                    durationMs: Date.now() - start,
                }),
            );
        });
        next();
    });

    // Endpoint público de salud para Docker healthcheck y pruebas de humo.
    app.get("/health", async (_req, res) => {
        try {
            await repository.ping();
            return res.status(200).json({
                service: "requests-service",
                status: "ok",
                database: "connected",
            });
        } catch {
            return res.status(503).json({
                service: "requests-service",
                status: "degraded",
                database: "disconnected",
            });
        }
    });

    // Todas las rutas de negocio exigen identidad validada por el API Gateway.
    app.use("/api/requests", gatewayIdentity);

    app.get("/api/requests", async (req, res, next) => {
        try {
            const rawStatus = String(req.query.status || "").trim().toUpperCase();
            if (rawStatus && !ALLOWED_STATUSES.includes(rawStatus)) {
                return res.status(400).json({ detail: "Filtro de estado inválido." });
            }
            const items = await repository.list({ status: rawStatus || undefined });
            return res.status(200).json({ items });
        } catch (error) {
            return next(error);
        }
    });

    app.post("/api/requests", async (req, res, next) => {
        try {
            const result = validateCreateRequest(req.body);
            if (!result.valid) {
                return res.status(400).json({ detail: result.errors.join(" ") });
            }
            const created = await repository.create({
                ...result.data,
                createdByUid: req.identity.uid,
                createdByEmail: req.identity.email,
            });
            return res.status(201).json(created);
        } catch (error) {
            return next(error);
        }
    });

    app.patch("/api/requests/:id/status", async (req, res, next) => {
        try {
            const result = validateStatusUpdate(req.body);
            if (!result.valid) {
                return res.status(400).json({ detail: result.errors.join(" ") });
            }
            const updated = await repository.updateStatus(req.params.id, result.data.status);
            if (!updated) {
                return res.status(404).json({ detail: "Solicitud no encontrada." });
            }
            return res.status(200).json(updated);
        } catch (error) {
            return next(error);
        }
    });

    app.delete("/api/requests/:id", async (req, res, next) => {
        try {
            const deleted = await repository.remove(req.params.id);
            if (!deleted) {
                return res.status(404).json({ detail: "Solicitud no encontrada." });
            }
            return res.status(204).end();
        } catch (error) {
            return next(error);
        }
    });

    app.use((error, _req, res, _next) => {
        console.error(error);
        return res.status(500).json({ detail: "Error interno en requests-service." });
    });

    return app;
}