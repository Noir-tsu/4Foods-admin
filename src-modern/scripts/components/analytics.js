// scripts/components/analytics.js
document.addEventListener('alpine:init', () => {
  Alpine.data('analyticsComponent', () => ({
    // Dữ liệu chính
    totalRevenue: 0,
    todayRevenue: 0,
    todayOrders: 0,
    todayCustomers: 0,
    growth: 0,
    paymentBreakdown: { cod: 0, momo: 0 },
    revenueData: [],
    recentOrders: [],
    topCategories: [],

    async init() {
      await this.loadAllData();
      this.initRevenueChart();
    },

    async loadAllData() {
      try {
        const [summary, daily, recentRes, cats] = await Promise.all([
          fetch('/api/analytics/summary').then(r => r.json()),
          fetch('/api/analytics/revenue-daily').then(r => r.json()),
          fetch('/api/orders?limit=10').then(r => r.json()),
          fetch('/api/analytics/top-categories').then(r => r.json())
        ]);

        // Summary
        this.totalRevenue = summary.totalRevenueAllTime || 0;
        this.todayRevenue = summary.todayRevenue || 0;
        this.todayOrders = summary.todayOrders || 0;
        this.todayCustomers = summary.todayCustomers || 0;
        this.growth = summary.growth || 0;
        this.paymentBreakdown = summary.paymentBreakdown || { cod: 0, momo: 0 };

        // Charts & lists
        this.revenueData = daily;
        this.recentOrders = recentRes.orders || [];
        this.topCategories = cats;
      } catch (err) {
        console.error("Analytics load error:", err);
      }
    },

    // Biểu đồ doanh thu 30 ngày
    initRevenueChart() {
      const dates = this.revenueData.map(d => d._id);
      const values = this.revenueData.map(d => d.revenue);

      const options = {
        series: [{ name: "Doanh thu", data: values }],
        chart: { type: "area", height: 350, toolbar: { show: false } },
        stroke: { curve: "smooth", width: 3 },
        fill: { type: "gradient", gradient: { opacityFrom: 0.6, opacityTo: 0 } },
        colors: ["#4361ee"],
        xaxis: { categories: dates, labels: { rotate: -45 } },
        yaxis: { labels: { formatter: v => v.toLocaleString() + "₫" } },
        tooltip: { y: { formatter: v => v.toLocaleString() + " ₫" } }
      };

      new ApexCharts(document.getElementById("revenueChart"), options).render();
    },

    formatCurrency(value) {
      return value.toLocaleString("vi-VN") + "₫";
    },

    formatPercentage(value) {
      return value.toFixed(1) + "%";
    }
  }));
});