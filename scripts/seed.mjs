/**
 * Seeds the `links` collection with the starter set.
 *
 * Run with:  npm run seed
 *
 * Safe to re-run: it matches on `title`, so existing links keep their _id and
 * anything you have edited in the dashboard is left alone.
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "damanvirtual";

if (!uri) {
  console.error("MONGODB_URI is not set. Is .env.local present?");
  process.exit(1);
}

const starterLinks = [
  {
    title: "Website",
    url: "https://damanvirtual.com",
    icon: "globe",
    order: 0,
    featured: true,
  },
  {
    title: "Company Profile",
    url: "https://damanvirtual.com",
    icon: "file-text",
    order: 1,
    featured: false,
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/company/damanvirtual",
    icon: "linkedin",
    order: 2,
    featured: false,
  },
  {
    title: "Contact Us",
    url: "mailto:info@damanvirtual.com",
    icon: "mail",
    order: 3,
    featured: false,
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const links = client.db(dbName).collection("links");

  for (const link of starterLinks) {
    const result = await links.updateOne(
      { title: link.title },
      { $setOnInsert: link },
      { upsert: true },
    );
    console.log(
      result.upsertedCount ? `added   ${link.title}` : `kept    ${link.title}`,
    );
  }

  const total = await links.countDocuments();
  console.log(`\nDone. ${total} link(s) in "${dbName}".links`);
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
