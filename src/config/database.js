const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST || '66.29.151.34',
    user: process.env.DB_USER || 'cipherox_filemagic',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'cipherox_filemagic',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0,
  });

  module.exports=pool