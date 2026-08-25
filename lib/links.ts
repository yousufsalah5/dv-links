import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Every database call in the project goes through this file. Swapping the
 * storage behind it — as we did moving off MongoDB — means changing this file
 * and nothing else.
 */

/** A link, as the rest of the app sees it. */
export type Link = {
  id: string;
  title: string;
  url: string;
  icon?: string;
  image?: string;
  order: number;
  featured: boolean;
};

export type LinkInput = {
  title: string;
  url: string;
  icon?: string;
  image?: string;
  featured: boolean;
};

/** The shape SQLite hands back. */
type Row = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  image: string | null;
  sort_order: number;
  featured: number;
};

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const binding = env.DB;
  if (!binding) {
    throw new Error(
      "The DB binding is missing. Check d1_databases in wrangler.jsonc.",
    );
  }
  return binding;
}

function toLink(row: Row): Link {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    icon: row.icon ?? undefined,
    image: row.image ?? undefined,
    order: row.sort_order,
    featured: row.featured === 1,
  };
}

/** All links, lowest order first. */
export async function getLinks(): Promise<Link[]> {
  const { results } = await (await db())
    .prepare("SELECT * FROM links ORDER BY sort_order ASC")
    .all<Row>();

  return results.map(toLink);
}

/** Adds a link to the bottom of the list. */
export async function createLink(input: LinkInput): Promise<void> {
  const conn = await db();

  const last = await conn
    .prepare("SELECT MAX(sort_order) AS max FROM links")
    .first<{ max: number | null }>();

  const id = crypto.randomUUID();

  await conn
    .prepare(
      `INSERT INTO links (id, title, url, icon, image, sort_order, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.title,
      input.url,
      input.icon ?? null,
      input.image ?? null,
      (last?.max ?? -1) + 1,
      input.featured ? 1 : 0,
    )
    .run();

  if (input.featured) await makeOnlyFeatured(id);
}

export async function updateLink(id: string, input: LinkInput): Promise<void> {
  await (await db())
    .prepare(
      `UPDATE links
          SET title = ?, url = ?, icon = ?, image = ?, featured = ?
        WHERE id = ?`,
    )
    .bind(
      input.title,
      input.url,
      input.icon ?? null,
      input.image ?? null,
      input.featured ? 1 : 0,
      id,
    )
    .run();

  if (input.featured) await makeOnlyFeatured(id);
}

export async function deleteLink(id: string): Promise<void> {
  await (await db()).prepare("DELETE FROM links WHERE id = ?").bind(id).run();
}

/**
 * Only one link is ever featured, so featuring one clears the rest.
 * Passing `null` simply clears every flag.
 */
export async function makeOnlyFeatured(id: string | null): Promise<void> {
  const conn = await db();

  const statements = [
    conn.prepare("UPDATE links SET featured = 0 WHERE id IS NOT ?").bind(id),
  ];

  if (id) {
    statements.push(
      conn.prepare("UPDATE links SET featured = 1 WHERE id = ?").bind(id),
    );
  }

  await conn.batch(statements);
}

export async function toggleFeatured(id: string): Promise<void> {
  const row = await (await db())
    .prepare("SELECT featured FROM links WHERE id = ?")
    .bind(id)
    .first<{ featured: number }>();

  if (!row) return;

  await makeOnlyFeatured(row.featured === 1 ? null : id);
}

/**
 * Moves a link one place up or down by swapping sort_order with its
 * neighbour. Does nothing when it is already at that end.
 */
export async function moveLink(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const conn = await db();

  const current = await conn
    .prepare("SELECT id, sort_order FROM links WHERE id = ?")
    .bind(id)
    .first<{ id: string; sort_order: number }>();

  if (!current) return;

  const neighbour = await conn
    .prepare(
      direction === "up"
        ? `SELECT id, sort_order FROM links
            WHERE sort_order < ? ORDER BY sort_order DESC LIMIT 1`
        : `SELECT id, sort_order FROM links
            WHERE sort_order > ? ORDER BY sort_order ASC LIMIT 1`,
    )
    .bind(current.sort_order)
    .first<{ id: string; sort_order: number }>();

  if (!neighbour) return;

  await conn.batch([
    conn
      .prepare("UPDATE links SET sort_order = ? WHERE id = ?")
      .bind(neighbour.sort_order, current.id),
    conn
      .prepare("UPDATE links SET sort_order = ? WHERE id = ?")
      .bind(current.sort_order, neighbour.id),
  ]);
}
