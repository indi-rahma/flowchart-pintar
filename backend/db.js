require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection(
  process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL
);

db.connect((err) => {
  if (err) {
    console.log("Database gagal terkoneksi:", err);
  } else {
    console.log("Database MySQL Railway terkoneksi 🚀");
  }
});

module.exports = db;