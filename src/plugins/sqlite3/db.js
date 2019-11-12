import path from 'path';
import { remote } from 'electron';
import Vue from 'vue'
import SqliteDB from './orm.js'
import sql from './sql.js'

let dbPath = path.join(remote.app.getPath('userData'), 'data.db');

let sqlite = new SqliteDB(dbPath);

// let dbsql = fs.readFileSync('src/assets/db.sql', (err, data) => {
//     if (err) {
//         console.log(err);
//     }
//     dbsql = data;
// })
// sqlite.db.run(dbsql.toString(), function (err) {
//     if (err)
//         console.log(err);
// });
function build() {
    sqlite.createTable(sql.user);
    sqlite.createTable(sql.article);
    sqlite.createTable(sql.floder);
    sqlite.createTable(sql.tag);
    sqlite.createTable(sql.floder_article);
    sqlite.createTable(sql.tag_article);
    sqlite.executeSql(sql.article_uuid_idx);
    sqlite.executeSql(sql.floder_uuid_idx);
}
build();

//TODO: sync

Vue.prototype.$db = sqlite;