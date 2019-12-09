import db from '../plugins/sqlite3/db.js'

export default class User {
    getActiver() {
        return db.get(`select * from user where state= ?`, [1])
    }

    existUser(username, server) {
        return db.get(`select id from user where username = ? and server =?`, [username, server]).then(data => {
            if (data != undefined) {
                return data.id
            } else {
                return ''
            }
        })
    }

    createUser(username, server, token) {
        return db.run(`insert into user(username,server,token,state)values(?,?,?,?)`, [username, server, token, 1])
    }

    updateState(state, id) {
        return db.run(`update user set state=? where id=?`, [state, id])
    }
    updateToken(token, id) {
        db.run(`update user set token = ? where id = ?`, [token, id])
    }



    // getId() {
    //     return getCookie('uid') ? getCookie('uid') : ''
    // }
    // getToken() {
    //     return getCookie('token') ? getCookie('token') : ''
    // }
    // getUsername() {
    //     return getCookie('username') ? getCookie('username') : ''
    // }
    // getServer() {
    //     return getCookie('server') ? getCookie('server') : ''
    // }
    // isOnline() {
    //     return navigator.onLine
    // }

    // updateId(value) {
    //     setCookie('uid', value)
    // }
    // updateToken(value, flag = true) {
    //     if (flag) {
    //         db.run(`update user set token = ? where id = ?`, [value, this.getId()])
    //     }
    //     setCookie('token', value)
    // }
    // updateUsername(value, flag = true) {
    //     if (flag) {
    //         db.run(`update user set username = ? where id = ?`, [value, this.getId()])
    //     }
    //     setCookie('username', value)
    // }
    // updateServer(value, flag = true) {
    //     if (flag) {
    //         db.run(`update user set username = ? where id = ?`, [value, this.getId()])
    //     }
    //     setCookie('server', value)
    // }
}