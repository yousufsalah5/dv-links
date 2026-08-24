import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "damanvirtual";

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to .env.local");
}

// In development Next.js reloads modules on every edit, which would open a new
// connection pool each time. Stashing the client on globalThis keeps a single
// pool alive across reloads.
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

// Each Cloudflare Worker isolate is short-lived and handles few concurrent
// requests, so a large connection pool just wastes Atlas connections. The
// short server-selection timeout means a database problem surfaces as a quick
// error rather than hanging the page for 30 seconds.
const clientPromise =
  globalForMongo._mongoClientPromise ??
  new MongoClient(uri, {
    maxPoolSize: 1,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
  }).connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClientPromise = clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
