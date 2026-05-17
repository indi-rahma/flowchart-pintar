require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
  uri: process.env.MYSQL_PUBLIC_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Database gagal terkoneksi:", err);
    return;
  }

  console.log("Database MySQL Railway terkoneksi 🚀");
  connection.release();
});

module.exports = db;