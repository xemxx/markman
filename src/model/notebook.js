import db from "../plugins/sqlite3/db.js";
import Model from "./base.js";

export default class Notebook extends Model{
  getAll(uid) {
    return db.all(`select * from notebook where uid=?`, [uid]);
  }
  addOne(data) {
    return super.insert('notebook',data);
  }
  updateById(id, data) {
    return super.updateById(id,'notebook',data)
  }
}
