export default [
  // 本地user表
  `CREATE TABLE IF NOT EXISTS "user" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "username" TEXT,
  "token" TEXT,
  "state" integer,
  "server" TEXT,
  "lastSC" INTEGER,
  "lastST" INTEGER
)`,
  // notebook
  `CREATE TABLE IF NOT EXISTS notebook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER,
  guid TEXT,
  name TEXT,
  sort INTEGER,--目录排序--
  sortType INTEGER, --文章排序--
  modifyState integer, -- 0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据 --
  SC integer,
  addDate integer,
  modifyDate integer
)`,
  // note
  `CREATE TABLE IF NOT EXISTS note (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guid TEXT,
  bid TEXT, -- 文件夹guid，和服务端一致 --
  uid INTEGER,
  title text,
  content text,
  modifyState integer, -- 0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据 --
  SC integer,
  addDate integer,
  modifyDate integer
)`,
  `CREATE TABLE IF NOT EXISTS tag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER,
  guid TEXT,
  name TEXT,
  modifyState integer, -- 0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据 --
  SC integer,
  addDate integer,
  modifyDate integer
  )`,
  `CREATE TABLE IF NOT EXISTS note_tag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tid INTEGER,
  nid INTEGER
)`,
  // v0.3.0
  `ALTER TABLE user ADD COLUMN uuid TEXT;`,
  `DELETE FROM user
WHERE id NOT IN (
    select id from (SELECT max(lastSC),id,username
    FROM user
    GROUP BY username)
)`,
]
