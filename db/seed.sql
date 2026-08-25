-- Starter links. Safe to re-run: existing rows are left exactly as they are,
-- so anything edited in the dashboard survives.

INSERT OR IGNORE INTO links (id, title, url, icon, image, sort_order, featured) VALUES
  ('seed-website',  'Website',         'https://damanvirtual.com',                      'globe',     NULL, 0, 1),
  ('seed-profile',  'Company Profile', 'https://damanvirtual.com',                      'file-text', NULL, 1, 0),
  ('seed-linkedin', 'LinkedIn',        'https://www.linkedin.com/company/daman-virtual', 'linkedin',  NULL, 2, 0),
  ('seed-contact',  'Contact Us',      'https://damanvirtual.com/contact-v2/',           'mail',      NULL, 3, 0);
