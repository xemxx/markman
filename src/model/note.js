import db from '../plugins/sqlite3/db.js'

export default class Note {
    getList(uid) {
        return db.all(`select * from notebook where uid=?`, [uid])
    }
}