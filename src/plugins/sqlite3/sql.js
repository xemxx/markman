export default [
  `CREATE TABLE IF NOT EXISTS note (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guid integer,
  bid integer,
  uid INTEGER,
  title text,
  content text,
  modifyState integer,
  SC integer,
  addDate integer,
  modifyDate integer
)`,
  `
  CREATE TABLE IF NOT EXISTS notebook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER,
  guid integer,
  name TEXT,
  sort INTEGER,--目录排序--
  sortType INTEGER, --文章排序--
  modifyState integer,
  SC integer,
  addDate integer,
  modifyDate integer
)`,
  `CREATE TABLE IF NOT EXISTS tag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER,
  guid integer,
  name TEXT,
  modifyState integer, 
  SC integer,
  addDate integer,
  modifyDate integer
  )`,
  `CREATE TABLE IF NOT EXISTS note_tag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tid INTEGER,
  aid INTEGER
)`,
  `CREATE TABLE IF NOT EXISTS "user" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "username" TEXT,
  "token" TEXT,
  "state" integer,
  "server" TEXT,
  "lastSC" INTEGER,
  "lastST" INTEGER
)`
];
