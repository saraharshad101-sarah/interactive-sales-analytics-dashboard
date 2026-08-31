const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
     origin: 'https://interactive-sales-analytics-dashboard-production-7f07.up.railway.app'
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Sales Analytics API is running'
    });
});

// Get all sales
app.get('/api/sales', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                id,
                order_date,
                product_name,
                category,
                region,
                quantity,
                unit_price,
                quantity * unit_price AS revenue
            FROM sales
            ORDER BY order_date;
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve sales data'
        });
    }
});

// Dashboard summary
app.get('/api/summary', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                SUM(quantity * unit_price) AS total_revenue,
                COUNT(*) AS total_orders,
                SUM(quantity) AS total_units_sold
            FROM sales;
        `);

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve summary'
        });
    }
});

// Monthly revenue
app.get('/api/revenue-trends', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                DATE_FORMAT(order_date, '%Y-%m') AS month,
                SUM(quantity * unit_price) AS revenue
            FROM sales
            GROUP BY DATE_FORMAT(order_date, '%Y-%m')
            ORDER BY month;
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve revenue trends'
        });
    }
});

// Top products
app.get('/api/top-products', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                product_name,
                SUM(quantity) AS units_sold,
                SUM(quantity * unit_price) AS revenue
            FROM sales
            GROUP BY product_name
            ORDER BY revenue DESC;
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve top products'
        });
    }
});

// Regional performance
app.get('/api/regional-performance', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                region,
                SUM(quantity) AS units_sold,
                SUM(quantity * unit_price) AS revenue
            FROM sales
            GROUP BY region
            ORDER BY revenue DESC;
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve regional performance'
        });
    }
});

// Filtered dashboard data
app.get('/api/dashboard', async (req, res) => {
    try {
        const { region, category } = req.query;

        let query = `
            SELECT
                SUM(quantity * unit_price) AS total_revenue,
                COUNT(*) AS total_orders,
                SUM(quantity) AS total_units_sold,
                AVG(quantity * unit_price) AS average_sale_value
            FROM sales
            WHERE 1 = 1
        `;

        const params = [];

        if (region) {
            query += ` AND region = ?`;
            params.push(region);
        }

        if (category) {
            query += ` AND category = ?`;
            params.push(category);
        }

        const [rows] = await pool.query(query, params);

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve filtered dashboard data'
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});