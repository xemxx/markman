import { db } from './db'
import sql from './sql'

db.build = function () {
  for (const row of sql) {
    this.exec(row)
  }
}
db.build()
