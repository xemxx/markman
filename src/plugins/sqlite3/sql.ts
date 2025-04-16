export default [
  // 本地user表
  `CREATE TABLE IF NOT EXISTS "user" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "username" TEXT,
  "token" TEXT,
  "state" integer,
  "server" TEXT,
  "lastSC" INTEGER,
  "lastST" INTEGER,
  "uuid" TEXT
)`,
  // 统一的node表，替代note和notebook
  `CREATE TABLE IF NOT EXISTS node (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER,
  guid TEXT,
  parentId TEXT, -- 父节点的guid，根节点为'root' --
  title TEXT, -- 对应note的title和notebook的name --
  content TEXT, -- 笔记内容，笔记本为空 --
  type TEXT, -- 节点类型：'note'或'folder' --
  sort INTEGER, -- 排序 --
  sortType INTEGER, -- 排序类型 --
  modifyState INTEGER, -- 0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据 --
  SC INTEGER,
  addDate INTEGER,
  modifyDate INTEGER
)`,
  // 保留旧表以便迁移
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
]
