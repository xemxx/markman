import db from '../plugins/sqlite3/db.js'

export default class Notebook {
    getNotebooks(uid) {
        return db.all(`select * from notebook where uid=?`, [uid])
    }
    add({ uid, name, isModify, sort, sortType, SC, addDate, modifyDate }) {
        return db.run(`insert into notebook(uid,name,isModify,sort,sortType,SC,addDate,modifyDate)values(?,?,?,?,?,?,?,?)`, [uid, name, isModify, sort, sortType, SC, addDate, modifyDate])
    }
    change(id, data) {
        let keys = Object.keys(data);
        let sql = `update notebook set`;
        let arr = [];
        for (let key of keys) {
            sql += ` ${key}=?`;
            arr.push(data[key]);
        }
        sql += ` where id=?`
        arr.push(id)
        return db.run(sql, data)
    }
}