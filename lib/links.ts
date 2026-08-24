import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./mongodb";

/** Shape of a link as stored in MongoDB. */
export type LinkDoc = {
  _id: ObjectId;
  title: string;
  url: string;
  icon?: string;
  order: number;
  featured: boolean;
};

/** Shape of a link once handed to a React component (`_id` as a plain string). */
export type Link = {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order: number;
  featured: boolean;
};

export const LINKS_COLLECTION = "links";

export async function linksCollection(): Promise<Collection<LinkDoc>> {
  const db = await getDb();
  return db.collection<LinkDoc>(LINKS_COLLECTION);
}

function serialize(doc: LinkDoc): Link {
  return {
    id: doc._id.toString(),
    title: doc.title,
    url: doc.url,
    icon: doc.icon,
    order: doc.order,
    featured: doc.featured,
  };
}

/** All links, lowest `order` first. */
export async function getLinks(): Promise<Link[]> {
  const links = await linksCollection();
  const docs = await links.find({}).sort({ order: 1 }).toArray();
  return docs.map(serialize);
}
