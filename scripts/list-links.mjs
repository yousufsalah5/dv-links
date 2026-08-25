/**
 * Prints whatever is currently in the links collection.
 *
 * Run with:  npm run links
 *
 * Handy for checking what the dashboard actually saved.
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "damanvirtual";

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

try {
  await client.connect();
  const docs = await client
    .db(dbName)
    .collection("links")
    .find({})
    .sort({ order: 1 })
    .toArray();

  if (docs.length === 0) {
    console.log("No links yet.");
  } else {
    console.log("order | featured | title                | url");
    console.log("------+----------+----------------------+--------------------");
    for (const d of docs) {
      console.log(
        String(d.order).padStart(5),
        "|",
        d.featured ? "  YES   " : "   -    ",
        "|",
        String(d.title ?? "").padEnd(20),
        "|",
        d.url,
      );
    }
    console.log(`\n${docs.length} link(s).`);
  }
} catch (error) {
  console.error("Could not read the database:", error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
