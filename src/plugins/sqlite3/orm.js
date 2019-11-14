import {
    existsSync,
    openSync
} from "fs";
let sqlite3 = require("sqlite3").verbose();

export default class SqliteDB {
    constructor(file) {
        this.db = new sqlite3.Database(file);

        this.exist = existsSync(file);
        if (!this.exist) {
            console.log("Creating db file!");
            openSync(file, "w");
        }
    }
    createTable(sql) {
        this.db.serialize(() => {
            this.db.run(sql, (err) => {
                if (null != err) {
                    this.printErrorInfo(err);
                    return;
                }
            });
        });
    }
    insertData(sql, objects) {
        this.db.serialize(() => {
            let stmt = this.db.prepare(sql);
            for (let i = 0; i < objects.length; ++i) {
                stmt.run(objects[i]);
            }
            stmt.finalize();
        });

    }
    queryData(sql, callback) {
        this.db.all(sql, (err, rows) => {
            if (null != err) {
                this.printErrorInfo(err);
                return;
            }

            /// deal query data.
            if (callback) {
                callback(rows);
            }
        });
    }
    executeSql(sql) {
        this.db.run(sql, (err) => {
            if (null != err) {
                this.printErrorInfo(err);
            }
        });
    }
    close() {
        this.db.close();
    }
    printErrorInfo(err) {
        console.log("Error Message:" + err.message + " ErrorNumber:" + err);
    }
}

// let DB = DB || {};
// DB.SqliteDB = function (file) {
//     DB.db = new sqlite3.Database(file);

//     DB.exist = existsSync(file);
//     if (!DB.exist) {
//         console.log("Creating db file!");
//         openSync(file, "w");
//     }
// };

// DB.printErrorInfo = function (err) {
//     console.log("Error Message:" + err.message + " ErrorNumber:" + err);
// }

// DB.SqliteDB.prototype.createTable = function (sql) {
//     DB.db.serialize(function () {
//         DB.db.run(sql, function (err) {
//             if (null != err) {
//                 DB.printErrorInfo(err);
//                 return;
//             }
//         });
//     });
// };

// /// tilesData format; [[level, column, row, content], [level, column, row, content]]
// DB.SqliteDB.prototype.insertData = function (sql, objects) {
//     DB.db.serialize(function () {
//         let stmt = DB.db.prepare(sql);
//         for (let i = 0; i < objects.length; ++i) {
//             stmt.run(objects[i]);
//         }

//         stmt.finalize();
//     });
// };

// DB.SqliteDB.prototype.queryData = function (sql, callback) {
//     DB.db.all(sql, function (err, rows) {
//         if (null != err) {
//             DB.printErrorInfo(err);
//             return;
//         }

//         /// deal query data.
//         if (callback) {
//             callback(rows);
//         }
//     });
// };

// DB.SqliteDB.prototype.executeSql = function (sql) {
//     DB.db.run(sql, function (err) {
//         if (null != err) {
//             DB.printErrorInfo(err);
//         }
//     });
// };

// DB.SqliteDB.prototype.close = function () {
//     DB.db.close();
// };