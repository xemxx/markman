import { db } from '../plugins/sqlite3/index'

export class Model {
  async insert(table: any, data: { [x: string]: string }) {
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

    try {
      await db.run(sql, arr)
      return this.getId(table)
    } catch (err) {
      console.log('insert:' + err)
    }
  }

  async update(id: any, table: any, data: { [x: string]: string }) {
    let keys = Object.keys(data)
    let sql = `update ${table} set `
    let arr: string[] = []
    for (let key of keys) {
      sql += `${key}=?,`
      arr.push(data[key])
    }
    sql = sql.substring(0, sql.length - 1) + ` where id=?`
    arr.push(id)

    try {
      await db.run(sql, arr)
    } catch (err) {
      console.log('update:' + err)
    }
  }

  async delete(id: any, table: any) {
    const sql = `delete from ${table} where id=?`

    try {
      await db.run(sql, [id])
    } catch (err) {
      console.log('delete:' + err)
    }
  }

  async getId(table: string) {
    const sql = 'select last_insert_rowid() as id from ' + table
    const data = await db.get(sql, [])
    return (data as { id: any }).id
  }
}
