const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASS,
    port: process.env.MYSQL_DB_PORT,
    database: process.env.MYSQL_DB_DATABASE
})

const verifiNumber = async (number) => {
    
    
    const [rows] = await pool.query(`SHOW TABLES LIKE 'a${number}'`);
  
    if (rows.length === 0) {
      try {
        await pool.query(`create table a${number} (id INT AUTO_INCREMENT PRIMARY KEY, pushName varchar(255), role varchar(25), content varchar(255), date varchar(255))`);
        console.log(`El nuevo numero '${number}' se creó correctamente.`);
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log(`El numero '${number}' ya existe.`);
    }
}

const saveMessagesUser = async (ctx) => {

    const {pushName, body, from} = ctx
    const data = new Date()
    await verifiNumber(from)
    
      try {
          await pool.query(`insert into a${from} (id, pushName, role, content, date) values (?,?,?,?,?)`, [null, pushName, 'user', body, data])
      } catch (error) {
          console.log("OCUURRIO UN ERROR AL INTENTAR INSERTAR EL DATO" + error)
      }
    


}

const saveMessagesBot = async (ctx, send) => {
    const {pushName, from} = ctx
    
    const data = new Date()
    try {
        await pool.query(`insert into a${from} (id, pushName, role, content, date) values (?,?,?,?,?)`, [null, pushName, 'system', send, data])
    } catch (error) {
        console.log("OCUURRIO UN ERROR AL INTENTAR INSERTAR EL DATO" + error)
    }
}

const getConversation = async (ctx) => {
    const {from} = ctx
    // let contenido = []
    
    try {
        const [rows]=await pool.query(`select role, content from a${from}`)
        return rows
    } catch (error) {
        console.log("OCUURRIO UN ERROR EN LA CONSULTA" + error)
    }
    // return contenido
}

var dbHelper = {
    saveMessagesBot,
    saveMessagesUser,
    getConversation
}

module.exports = dbHelper