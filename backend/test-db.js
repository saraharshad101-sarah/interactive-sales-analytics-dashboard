const pool = require('./db');

async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 AS result');

        console.log('MySQL connection successful!');
        console.log(rows);

        process.exit(0);
    } catch (error) {
        console.error('MySQL connection failed:');
        console.error(error.message);

        process.exit(1);
    }
}

testConnection();