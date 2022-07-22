import db from './db.js'
import sql from './sql.js'

db.build = function () {
  for (const row of sql) {
    this.exec(row)
  }
}
db.build()
