-- The links shown on /links, managed from /admin.
--
-- `sort_order` rather than `order` because ORDER is a reserved SQL word.
-- `featured` is 0 or 1; only one row is ever 1, enforced in application code.

CREATE TABLE IF NOT EXISTS links (
  id         TEXT PRIMARY KEY,
  title      TEXT    NOT NULL,
  url        TEXT    NOT NULL,
  icon       TEXT,
  image      TEXT,
  sort_order INTEGER NOT NULL,
  featured   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS links_sort_order ON links (sort_order);
