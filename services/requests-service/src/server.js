import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { MongoRequestsRepository } from "./repositories/mongo.js";

const config = loadConfig();
const repository = new MongoRequestsRepository(config.mongoUri, config.mongoDbName);

async function start() {
    await repository.connect();
    const app = createApp({ repository });

    const server = app.listen(config.port, config.host, () => {
        console.log(
            `requests-service escuchando en http://${config.host}:${config.port} (DB: ${config.mongoDbName})`,
        );
    });

    const shutdown = async (signal) => {
        console.log(`Recibida señal ${signal}, cerrando requests-service...`);
        server.close(async () => {
            await repository.close();
            process.exit(0);
        });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((error) => {
    console.error("Error fatal iniciando requests-service:", error);
    process.exit(1);
});