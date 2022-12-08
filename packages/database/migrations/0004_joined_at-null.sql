-- Migration number: 0004 	 2022-12-08T19:34:06.708Z

ALTER TABLE members RENAME COLUMN joined_at TO joined_at_old;
ALTER TABLE members ADD COLUMN joined_at TEXT;
UPDATE members SET joined_at = joined_at_old;
ALTER TABLE members DROP COLUMN joined_at_old;