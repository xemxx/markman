import db from './db.js'
import sql from './sql.js'
import Vue from 'vue'

db.build = function () {
    this.exec(sql.user);
    this.exec(sql.article);
    this.exec(sql.floder);
    this.exec(sql.tag);
    this.exec(sql.floder_article);
    this.exec(sql.tag_article);
    this.exec(sql.article_uuid_idx);
    this.exec(sql.floder_uuid_idx);
    this.exec(sql.user_username_idx);
}
db.build();
Vue.prototype.$db = db;