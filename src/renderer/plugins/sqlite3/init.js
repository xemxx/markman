import db from './db.js'
import sql from './sql.js'
import Vue from 'vue'

db.build = function () {
  for (const row of sql) {
    this.exec(row)
  }
}
db.build()
Vue.prototype.$db = db
