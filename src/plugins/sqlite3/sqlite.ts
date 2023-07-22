import sqlite3 from 'sqlite3'

const sqlite = sqlite3.verbose()

class Sqlite {
  db!: sqlite3.Database
  static instance: any
  constructor(dbPath: string) {
    this.connect(dbPath)
  }
  // 连接数据库
  connect(path: string) {
    return new Promise((resolve, reject) => {
      this.db = new sqlite.Database(path, err => {
        if (err === null) {
          resolve(err)
        } else {
          reject(err)
        }
      })
    })
  }
  // 运行sql
  run(sql: string, params: any) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, err => {
        if (err === null) {
          resolve(err)
        } else {
          reject(err)
        }
      })
    })
  }
  // 运行多条sql
  exec(sql: string) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, err => {
        if (err === null) {
          resolve(err)
        } else {
          reject(err)
        }
      })
    })
  }
  // 查询一条数据
  get<T>(sql: string, params: any) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, data: T) => {
        if (err) {
          console.log('run:' + err)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
  // 查询所有数据
  all(sql: string, params: any) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, data) => {
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
    this.instance = this.instance ? this.instance : new Sqlite(dbPath)
    return this.instance
  }
}

export default Sqlite
