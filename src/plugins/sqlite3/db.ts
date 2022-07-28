import path from 'path'
const { app } = require('@electron/remote')
import Sqlite from './sqlite'

let dbPath = path.join(app.getPath('userData'), 'data.db')

export const db = Sqlite.getInstance(dbPath)
