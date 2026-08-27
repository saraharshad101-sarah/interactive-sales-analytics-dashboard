# Interactive Sales Analytics Dashboard

A full-stack sales analytics dashboard for exploring revenue, orders, units sold, products, and regional performance. The project combines a MySQL data source with a Node.js/Express API and a React dashboard built with Recharts.

## Objectives

- Turn transactional sales data into an at-a-glance performance view.
- Provide aggregate API endpoints for dashboard metrics.
- Compare results by region and product category.
- Present trends and rankings in a responsive interface.

## Features

- KPI cards for total revenue, total orders, units sold, and top region.
- Monthly revenue trend line chart.
- Top-products revenue bar chart.
- Regional revenue performance bar chart.
- Interactive `Region` and `Category` dropdown filters.
- Filtered KPI requests through `/api/dashboard`.
- Filtered chart data derived from records returned by `/api/sales`.
- Loading and error states in the React client.

## Technology Stack

- **Database:** MySQL
- **Backend:** Node.js, Express, `mysql2/promise`, CORS, dotenv
- **Frontend:** React, Vite, Recharts
- **Quality and build tools:** Oxlint, Vite production build

## System Architecture

```text
MySQL `sales` table
	|
	v
Node.js + Express API (port 5000)
	|
	v
React + Vite client (port 5173)
	|
	v
Recharts visualizations and interactive filters
```

The frontend fetches dashboard aggregates and sales records from the API. Selecting filters sends the selected values to `/api/dashboard` for KPI aggregation and filters the loaded sales records to update the charts. `All Regions` and `All Categories` omit their respective query parameters.

## Database Structure

The backend reads from a MySQL table named `sales`. The columns used by the application are:

| Column | Usage |
| --- | --- |
| `id` | Sale identifier |
| `order_date` | Date used for monthly trends |
| `product_name` | Product grouping |
| `category` | Category filter |
| `region` | Regional filter and grouping |
| `quantity` | Units and order calculations |
| `unit_price` | Revenue calculation |

Revenue is calculated as `quantity * unit_price`; it is not stored as a separate column in the application queries.

## Data Analysis

- **Total revenue:** `SUM(quantity * unit_price)`
- **Total orders:** `COUNT(*)`
- **Units sold:** `SUM(quantity)`
- **Average sale value:** `AVG(quantity * unit_price)` from the filtered dashboard endpoint
- **Revenue trends:** monthly revenue grouped by `YYYY-MM`
- **Top products:** products ranked by total revenue
- **Regional performance:** regions ranked by total revenue

## API Endpoints

All endpoints are served from `http://localhost:5000`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API health message |
| `GET` | `/api/sales` | All sales records used by the dashboard and filters |
| `GET` | `/api/summary` | Unfiltered summary metrics |
| `GET` | `/api/revenue-trends` | Monthly revenue aggregates |
| `GET` | `/api/top-products` | Product revenue and units sold |
| `GET` | `/api/regional-performance` | Regional revenue and units sold |
| `GET` | `/api/dashboard` | Summary metrics with optional `region` and `category` filters |

Examples:

```text
/api/dashboard
/api/dashboard?region=East
/api/dashboard?category=Electronics
/api/dashboard?region=East&category=Electronics
```

## Interactive Filters

The dashboard provides `All Regions` and `All Categories` defaults. Choosing a region, category, or both updates the KPI cards using the parameterized dashboard endpoint. The existing charts remain visible and update from matching sales records; clearing a filter restores the complete dataset.

## Project Structure

```text
.
├── backend/
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   ├── server.js
│   └── test-db.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
	├── App.jsx
	├── App.css
	├── index.css
	└── main.jsx
```

## Setup and Installation

### Prerequisites

- Node.js and npm
- A running MySQL instance
- A populated `sales` table matching the columns above

### Configure the backend

From the project root:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and replace the placeholders with local MySQL settings:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306
```

### Install the frontend

In a second terminal:

```bash
cd frontend
npm install
```

## Running the Application

Start the backend:

```bash
cd backend
node server.js
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Testing and Build Commands

Backend database connectivity check:

```bash
cd backend
node test-db.js
```

Frontend lint and production build:

```bash
cd frontend
npm run lint
npm run build
```

The backend currently includes a connection test rather than an automated API test suite.

## Challenges Faced

- Translating transactional rows into consistent SQL aggregates for dashboard KPIs.
- Keeping filter values parameterized when combining optional region and category conditions.
- Updating chart datasets for filters while retaining the existing Recharts components.
- Maintaining readable charts and card layouts across desktop and mobile widths.
