import { db } from '../plugins/sqlite3/db'

export class Model {
  insert(table: any, data: { [x: string]: string }) {
    let keys = Object.keys(data)
    let fields = ''
    let values = ''
    let arr: string[] = []
    for (let key of keys) {
      fields += `${key},`
      values += `?,`
      arr.push(data[key])
    }
    let sql = `insert into ${table} (${fields.substring(
      0,
      fields.length - 1,
    )}) values( ${values.substring(0, values.length - 1)} )`

    return db.run(sql, arr).then(
      () => this.getId(table),
      (err: string) => console.log('isnet:' + err),
    )
  }

  update(id: any, table: any, data: { [x: string]: string }) {
    let keys = Object.keys(data)
    let sql = `update ${table} set `
    let arr: string[] = []
    for (let key of keys) {
      sql += `${key}=?,`
      arr.push(data[key])
    }
    sql = sql.substring(0, sql.length - 1) + ` where id=?`
    arr.push(id)
    console.log(sql, arr)
    return db.run(sql, arr)
  }

  delete(id: any, table: any) {
    const sql = `delete from ${table} where id=?`
    return db.run(sql, [id])
  }

  getId(table: string) {
    const sql = 'select last_insert_rowid() as id from ' + table
    return db.get(sql).then((data: { id: any }) => data.id)
  }
}
