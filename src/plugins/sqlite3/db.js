import path from 'path';
import { remote } from 'electron';
import Vue from 'vue'
import SqliteDB from './orm.js'
import sql from './sql.js'

let dbPath = path.join(remote.app.getPath('userData'), 'data.db');

let sqlite = new SqliteDB(dbPath);

sqlite.build = function () {
    sqlite.createTable(sql.user);
    sqlite.createTable(sql.article);
    sqlite.createTable(sql.floder);
    sqlite.createTable(sql.tag);
    sqlite.createTable(sql.floder_article);
    sqlite.createTable(sql.tag_article);
    sqlite.executeSql(sql.article_uuid_idx);
    sqlite.executeSql(sql.floder_uuid_idx);
    sqlite.executeSql(sql.user_username_idx);
}
sqlite.build();

Vue.prototype.$db = sqlite;