const mysql = require('mysql2/promise')

let pool = null

async function init() {
  if (process.env.USE_MOCK === 'true') return
  if (pool) return
  pool = await mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'cms_user',
    password: process.env.MYSQL_PASSWORD || 'cms_pass',
    database: process.env.MYSQL_DATABASE || 'cms_db',
    waitForConnections: true,
    connectionLimit: 5,
    namedPlaceholders: true,
  })
  console.log('MySQL connection pool created')
}

async function execute(sql, params = {}) {
  if (!pool) await init()
  const [rows] = await pool.execute(sql, params)
  return { rows }
}

module.exports = { execute }
