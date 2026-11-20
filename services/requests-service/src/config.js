export function loadConfig(env = process.env) {
    const port = Number(env.PORT || 8003);
    const host = String(env.HOST || "127.0.0.1").trim();
    const mongoUri = String(env.MONGO_URI || "").trim();
    const mongoDbName = String(env.MONGO_DB_NAME || "ecored_requests").trim();

    if (!Number.isInteger(port) || port <= 0) {
        throw new Error("PORT debe ser un número entero positivo.");
    }
    if (!mongoUri) {
        throw new Error("Falta MONGO_URI en las variables de entorno.");
    }

    return { port, host, mongoUri, mongoDbName };
}