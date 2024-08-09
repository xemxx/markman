import path from 'path'
import { app } from '@electron/remote'
import Sqlite from './sqlite'

let dbPath = path.join(app.getPath('userData'), 'data.db')

export const db = Sqlite.getInstance(dbPath)
