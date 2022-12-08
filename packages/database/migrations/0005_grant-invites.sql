-- Migration number: 0005 	 2022-12-08T20:16:24.406Z

ALTER TABLE members RENAME COLUMN invites TO invites_old;
ALTER TABLE members ADD COLUMN invites INTEGER NOT NULL DEFAULT 2;
UPDATE members SET invites = 2 WHERE invites_old IS NULL OR invites_old < 2;
ALTER TABLE members DROP COLUMN invites_old;