import db from "../plugins/sqlite3/db.js";

export default class Note {
  getNotesByBook(uid, bid) {
    return db.all(`select * from note where uid=? and bid=?`, [uid, bid]);
  }
  getNotesByTag(uid, tid) {
    return db.all(
      `select b.* from note_tag as a left join note ad b on a.nid=b.id where a.tid=? and b.uid=?`,
      [tid, uid]
    );
  }
  getAllNotes(uid) {
    return db.all(`select * from note where uid=?`, [uid]);
  }
  update(id, data) {
    let keys = Object.keys(data);
    let sql = `update notebook set`;
    let arr = [];
    for (let key of keys) {
      sql += ` ${key}=?`;
      arr.push(data[key]);
    }
    sql += ` where id=?`;
    arr.push(id);
    return db.run(sql, data);
  }
  updateTag() {}
}
