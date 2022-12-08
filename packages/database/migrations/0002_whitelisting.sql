-- Migration number: 0002 	 2022-12-08T14:10:54.140Z

ALTER TABLE members ADD COLUMN whitelisted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE members ADD COLUMN whitelisted_by TEXT REFERENCES members(id);

UPDATE members SET whitelisted = TRUE;
UPDATE members SET whitelisted_by = (
  SELECT owner_id FROM invites WHERE id = invited_with
)

ALTER TABLE members DROP COLUMN invited_with;
DROP TABLE IF EXISTS invites;