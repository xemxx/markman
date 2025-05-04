import sqlite3 from 'sqlite3'

const sqlite = sqlite3.verbose()

class Sqlite {
  db!: sqlite3.Database
  static instance: Sqlite | undefined
  constructor(dbPath: string) {
    this.connect(dbPath)
  }
  // 连接数据库
  connect(path: string) {
    return new Promise<void>((resolve, reject) => {
      this.db = new sqlite.Database(path, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // 运行sql
  run(sql: string, params: any) {
    return new Promise<void>((resolve, reject) => {
      this.db.run(sql, params, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // 运行多条sql
  exec(sql: string) {
    return new Promise<void>((resolve, reject) => {
      this.db.exec(sql, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // 查询一条数据
  get<T>(sql: string, params: any) {
    return new Promise<T>((resolve, reject) => {
      this.db.get(sql, params, (err, data: T) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
  // 查询所有数据
  all<T>(sql: string, params: any) {
    return new Promise<T[]>((resolve, reject) => {
      this.db.all(sql, params, (err, data: T[]) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
  // 关闭数据库
  close() {
    this.db.close()
  }

  // 单例
  static getInstance(dbPath: string) {
    if (!this.instance) {
      this.instance = new Sqlite(dbPath)
    }
    return this.instance
  }
}

export default Sqlite
