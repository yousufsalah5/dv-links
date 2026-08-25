/**
 * Runs a real MongoDB on your own Mac, so the site can be worked on without
 * depending on MongoDB Atlas being reachable.
 *
 * Run with:  npm run db
 *
 * Leave it running in its own terminal tab. Data is kept in .local-db/, so it
 * survives restarts. Stop it with Ctrl-C.
 */
import { mkdirSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = 27018; // deliberately not 27017, to avoid clashing with anything else
const DB_PATH = new URL("../.local-db/", import.meta.url).pathname;

mkdirSync(DB_PATH, { recursive: true });

const server = await MongoMemoryServer.create({
  instance: {
    port: PORT,
    dbPath: DB_PATH,
    storageEngine: "wiredTiger", // persists to disk rather than vanishing
  },
});

console.log(`
  Local MongoDB is running.

    ${server.getUri()}

  Leave this window open while you work.
  Press Ctrl-C to stop it.
`);

const shutdown = async () => {
  await server.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
