export default {
  article: `CREATE TABLE IF NOT EXISTS article(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid INTEGER,
  type INTEGER,
  state INTEGER,
  dateAdd INTEGER,
  dateModif INTEGER,
  dateArt INTEGER
  )`,
  floder: `
  CREATE TABLE IF NOT EXISTS floder(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid INTEGER,
    name TEXT,
    sort INTEGER, --目录排序--
    sortType INTEGER--文章排序--
  )`,
  floder_article: `CREATE TABLE IF NOT EXISTS floder_article(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fid INTEGER,
  aid INTEGER
)`,
  tag: `CREATE TABLE IF NOT EXISTS tag(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)`,
  tag_article: `CREATE TABLE IF NOT EXISTS tag_article(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rid INTEGER,
  aid INTEGER
)`,
  user: `CREATE TABLE IF NOT EXISTS "user"(
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "username" TEXT,
  "password" TEXT,
  "state" integer
)
  `,
  article_uuid_idx: `CREATE UNIQUE INDEX IF NOT EXISTS article_uuid_idx ON article(uuid)`,
  floder_uuid_idx: `CREATE UNIQUE INDEX IF NOT EXISTS floder_uuid_idx ON floder(uuid)`
}
