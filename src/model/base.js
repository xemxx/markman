import db from '../plugins/sqlite3/db.js'

export default class Model {

    updateById(id, table, data) {
        let keys = Object.keys(data);
        let sql = `update ${table} set`;
        let arr = [];
        for (let key of keys) {
            sql += ` ${key}=?`;
            arr.push(data[key]);
        }
        sql += ` where id=?`;
        arr.push(id);
        return db.run(sql, data);
    }
}