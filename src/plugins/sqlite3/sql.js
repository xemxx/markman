export default {
  article: `CREATE TABLE IF NOT EXISTS article (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER,
  type INTEGER,
  state INTEGER,
  dateAdd INTEGER,
  dateModif INTEGER,
  dateArt INTEGER
)`,
  floder: `
  CREATE TABLE IF NOT EXISTS floder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER,
  name TEXT,
  sort INTEGER,--目录排序--
  sortType INTEGER --文章排序--
)`,
  floder_article: `CREATE TABLE IF NOT EXISTS floder_article (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fid INTEGER,
  aid INTEGER
)`,
  tag: `CREATE TABLE IF NOT EXISTS tag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER,
  name TEXT
)`,
  tag_article: `CREATE TABLE IF NOT EXISTS tag_article (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tid INTEGER,
  aid INTEGER
)`,
  user: `CREATE TABLE IF NOT EXISTS "user" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "username" TEXT,
  "token" TEXT,
  "state" integer,
  "server" TEXT
)
  `,
  user_username_idx: `CREATE UNIQUE INDEX IF NOT EXISTS user_username_idx ON user (username)`,
  article_uuid_idx: `CREATE UNIQUE INDEX IF NOT EXISTS article_uuid_idx ON article(uuid)`,
  floder_uuid_idx: `CREATE UNIQUE INDEX IF NOT EXISTS floder_uuid_idx ON floder(uuid)`
}
