import db from "../plugins/sqlite3/db.js";

export default class Model {
  insert(table, data) {
    let keys = Object.keys(data);
    let fields = "";
    let values = "";
    let arr = [];
    for (let key of keys) {
      fields += `${key},`;
      values += `?,`;
      arr.push(data[key]);
    }
    let sql = `insert into ${table} (${fields.substr(
      0,
      fields.length - 1
    )}) values( ${values.substr(0, values.length - 1)} )`;

    return db.run(sql, arr);
  }
  updateById(id, table, data) {
    let keys = Object.keys(data);
    let sql = `update ${table} set `;
    let arr = [];
    for (let key of keys) {
      sql += `${key}=?,`;
      arr.push(data[key]);
    }
    sql = sql.substr(0, sql.length - 1) + ` where id=?`;
    arr.push(id);
    return db.run(sql, arr);
  }
}
