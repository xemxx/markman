import path from 'path'
import { remote } from 'electron'
import Sqlite from './sqlite.js'

let dbPath = path.join(remote.app.getPath('userData'), 'data.db')

const db = Sqlite.getInstance()

db.connect(dbPath)

export default db
