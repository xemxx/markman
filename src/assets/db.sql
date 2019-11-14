CREATE TABLE IF NOT EXISTS "user" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "username" TEXT,
  "password" TEXT,
  "state" integer
);
CREATE UNIQUE INDEX IF NOT EXISTS user_username_idx ON user (username);
CREATE TABLE IF NOT EXISTS article (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  username TEXT,
  type INTEGER,
  state INTEGER,
  dateAdd INTEGER,
  dateModif INTEGER,
  dateArt INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS article_uuid_idx ON article (uuid);
CREATE TABLE IF NOT EXISTS floder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  username TEXT,
  name TEXT,
  sort INTEGER,--目录排序--
  sortType INTEGER --文章排序--
);
CREATE UNIQUE INDEX IF NOT EXISTS floder_uuid_idx ON floder (uuid);
CREATE TABLE IF NOT EXISTS floder_article (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fid TEXT,
  aid TEXT
);
CREATE TABLE IF NOT EXISTS tag_article (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tid TEXT,
  aid TEXT
);
CREATE TABLE IF NOT EXISTS tag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  name TEXT
);