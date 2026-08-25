import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./mongodb";

/** Shape of a link as stored in MongoDB. */
export type LinkDoc = {
  _id: ObjectId;
  title: string;
  url: string;
  icon?: string;
  /** An uploaded square image, held as a data URI. Takes priority over `icon`. */
  image?: string;
  order: number;
  featured: boolean;
};

/** Shape of a link once handed to a React component (`_id` as a plain string). */
export type Link = {
  id: string;
  title: string;
  url: string;
  icon?: string;
  image?: string;
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
    image: doc.image,
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

export type LinkInput = {
  title: string;
  url: string;
  icon?: string;
  image?: string;
  featured: boolean;
};

/** Adds a link to the bottom of the list. */
export async function createLink(input: LinkInput): Promise<void> {
  const links = await linksCollection();

  const last = await links.find({}).sort({ order: -1 }).limit(1).next();
  const order = last ? last.order + 1 : 0;

  const { insertedId } = await links.insertOne({
    ...input,
    order,
  } as LinkDoc);

  if (input.featured) await makeOnlyFeatured(insertedId.toString());
}

export async function updateLink(id: string, input: LinkInput): Promise<void> {
  const links = await linksCollection();

  // Optional fields are removed from the document when left blank, rather than
  // being stored as empty strings.
  const set: Record<string, unknown> = {
    title: input.title,
    url: input.url,
    featured: input.featured,
  };
  const unset: Record<string, ""> = {};

  for (const field of ["icon", "image"] as const) {
    if (input[field]) set[field] = input[field];
    else unset[field] = "";
  }

  await links.updateOne({ _id: new ObjectId(id) }, {
    $set: set,
    ...(Object.keys(unset).length ? { $unset: unset } : {}),
  });

  if (input.featured) await makeOnlyFeatured(id);
}

export async function deleteLink(id: string): Promise<void> {
  const links = await linksCollection();
  await links.deleteOne({ _id: new ObjectId(id) });
}

/**
 * Only one link is ever featured, so featuring one clears the flag on the
 * rest. Passing `null` simply clears every flag.
 */
export async function makeOnlyFeatured(id: string | null): Promise<void> {
  const links = await linksCollection();

  await links.updateMany(
    id ? { _id: { $ne: new ObjectId(id) } } : {},
    { $set: { featured: false } },
  );

  if (id) {
    await links.updateOne({ _id: new ObjectId(id) }, { $set: { featured: true } });
  }
}

export async function toggleFeatured(id: string): Promise<void> {
  const links = await linksCollection();
  const doc = await links.findOne({ _id: new ObjectId(id) });
  if (!doc) return;

  await makeOnlyFeatured(doc.featured ? null : id);
}

/**
 * Moves a link one place up or down by swapping `order` with its neighbour.
 * Does nothing when the link is already at the end it is moving towards.
 */
export async function moveLink(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const links = await linksCollection();
  const current = await links.findOne({ _id: new ObjectId(id) });
  if (!current) return;

  const neighbour = await links
    .find(
      direction === "up"
        ? { order: { $lt: current.order } }
        : { order: { $gt: current.order } },
    )
    .sort({ order: direction === "up" ? -1 : 1 })
    .limit(1)
    .next();

  if (!neighbour) return;

  await links.updateOne(
    { _id: current._id },
    { $set: { order: neighbour.order } },
  );
  await links.updateOne(
    { _id: neighbour._id },
    { $set: { order: current.order } },
  );
}
