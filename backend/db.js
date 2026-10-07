const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "0000",
    database: "student_manager"
});

module.exports = db;