import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import './App.css';
const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [summary, setSummary] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [regionalPerformance, setRegionalPerformance] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/dashboard`),
fetch(`${API_URL}/api/revenue-trends`),
fetch(`${API_URL}/api/top-products`),
fetch(`${API_URL}/api/regional-performance`),
fetch(`${API_URL}/api/sales`)
    ])
      .then(async ([summaryResponse, revenueResponse, productsResponse, regionalResponse, salesResponse]) => {
        if (
          !summaryResponse.ok ||
          !revenueResponse.ok ||
          !productsResponse.ok ||
          !regionalResponse.ok ||
          !salesResponse.ok
        ) {
          throw new Error('Failed to fetch dashboard data');
        }

        const summaryData = await summaryResponse.json();
        const revenueData = await revenueResponse.json();
        const productsData = await productsResponse.json();
        const regionalData = await regionalResponse.json();
        const salesData = await salesResponse.json();

        return {
          summaryData,
          revenueData,
          productsData,
          regionalData,
          salesData
        };
      })
      .then(({ summaryData, revenueData, productsData, regionalData, salesData }) => {
        setSummary(summaryData);
        setRevenueTrends(revenueData);
        setTopProducts(productsData);
        setRegionalPerformance(regionalData);
        setSales(salesData);
      })
      .catch((error) => {
        console.error(error);
        setError('Unable to load dashboard data');
      });
  }, []);

  useEffect(() => {
    if (!sales.length) {
      return;
    }

    const params = new URLSearchParams();

    if (selectedRegion) {
      params.set('region', selectedRegion);
    }

    if (selectedCategory) {
      params.set('category', selectedCategory);
    }

    fetch(`${API_URL}/api/dashboard?${params.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch filtered dashboard data');
        }

        return response.json();
      })
      .then((summaryData) => setSummary(summaryData))
      .catch((error) => {
        console.error(error);
        setError('Unable to load filtered dashboard data');
      });

    const filteredSales = sales.filter((sale) => (
      (!selectedRegion || sale.region === selectedRegion) &&
      (!selectedCategory || sale.category === selectedCategory)
    ));

    const revenueByMonth = {};
    const productsByName = {};
    const regionsByName = {};

    filteredSales.forEach((sale) => {
      const revenue = Number(sale.revenue);
      const quantity = Number(sale.quantity);
      const month = String(sale.order_date).slice(0, 7);

      revenueByMonth[month] = (revenueByMonth[month] || 0) + revenue;

      if (!productsByName[sale.product_name]) {
        productsByName[sale.product_name] = { product_name: sale.product_name, units_sold: 0, revenue: 0 };
      }

      productsByName[sale.product_name].units_sold += quantity;
      productsByName[sale.product_name].revenue += revenue;

      if (!regionsByName[sale.region]) {
        regionsByName[sale.region] = { region: sale.region, units_sold: 0, revenue: 0 };
      }

      regionsByName[sale.region].units_sold += quantity;
      regionsByName[sale.region].revenue += revenue;
    });

    setRevenueTrends(Object.entries(revenueByMonth)
      .sort(([firstMonth], [secondMonth]) => firstMonth.localeCompare(secondMonth))
      .map(([month, revenue]) => ({ month, revenue })));
    setTopProducts(Object.values(productsByName).sort((firstProduct, secondProduct) => secondProduct.revenue - firstProduct.revenue));
    setRegionalPerformance(Object.values(regionsByName).sort((firstRegion, secondRegion) => secondRegion.revenue - firstRegion.revenue));
  }, [sales, selectedRegion, selectedCategory]);

  const regions = [...new Set(sales.map((sale) => sale.region))].sort();
  const categories = [...new Set(sales.map((sale) => sale.category))].sort();

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!summary) {
    return <div className="loading-message">Loading dashboard...</div>;
  }
 const topRegion = regionalPerformance.length > 0
  ? regionalPerformance[0].region
  : '—';
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Sales Analytics Dashboard</h1>
          <p>Interactive overview of sales performance</p>
        </div>
        <div className="filter-controls" aria-label="Dashboard filters">
          <label>
            <span>Region</span>
            <select value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)}>
              <option value="">All Regions</option>
              {regions.map((region) => <option key={region} value={region}>{region}</option>)}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="">All Categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
        </div>
      </header>

      <main>
        {/* KPI CARDS */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <span>Total Revenue</span>
            <h2>
              ${Number(summary.total_revenue).toLocaleString()}
            </h2>
          </div>

          <div className="kpi-card">
            <span>Total Orders</span>
            <h2>
              {Number(summary.total_orders).toLocaleString()}
            </h2>
          </div>

          <div className="kpi-card">
            <span>Units Sold</span>
            <h2>
              {Number(summary.total_units_sold).toLocaleString()}
            </h2>
          </div>

          <div className="kpi-card">
           <span>Top Region</span>
           <h2>{topRegion}</h2>
          </div>
        </section>

        {/* CHARTS */}
        <section className="charts-grid">

          {/* REVENUE TRENDS */}
          <div className="chart-card">
            <h2>Revenue Trends</h2>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      'Revenue'
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TOP PRODUCTS */}
          <div className="chart-card">
            <h2>Top Products</h2>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="product_name"
                    angle={-20}
                    textAnchor="end"
                    height={70}
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      'Revenue'
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REGIONAL PERFORMANCE */}
          <div className="chart-card full-width">
  <h2>Regional Performance</h2>

  <div className="chart-container">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={regionalPerformance}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="region" />

        <YAxis />

        <Tooltip
          formatter={(value) => [
            `$${Number(value).toLocaleString()}`,
            'Revenue'
          ]}
        />

        <Bar
          dataKey="revenue"
          name="Revenue"
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

        </section>
      </main>
    </div>
  );
}

export default App;