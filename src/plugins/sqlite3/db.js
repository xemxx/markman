import path from 'path'
const { app } = require('@electron/remote')
import Sqlite from './sqlite.js'

let dbPath = path.join(app.getPath('userData'), 'data.db')

const db = Sqlite.getInstance()

db.connect(dbPath)

export default db
