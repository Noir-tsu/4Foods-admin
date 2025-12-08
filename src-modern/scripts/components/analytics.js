// analytics.js (Frontend script with updates to handle payment breakdown and formatting)
document.addEventListener('alpine:init', () => {
  Alpine.data('analyticsComponent', () => ({
    // Core metrics
    totalRevenue: 0,
    newUsers: 0,
    activeShops: 0,
    totalProducts: 0,
    revenueLast30: 0,
    ordersLast30: 0,
    avgOrderValue: 0,
    paymentBreakdown: { cod: 0, momo: 0 },
    
    // Real-time simulation (since no real-time backend, simulate)
    realTimeUsers: 0,
    
    // Chart data
    revenueData: [],
    ageData: [],
    genderData: [ // Mock since no gender in model
      { label: 'Nam', value: 55, color: '#007bff' },
      { label: 'Nữ', value: 40, color: '#ff69b4' },
      { label: 'Khác', value: 5, color: '#6c757d' }
    ],
    
    // Lists
    topShops: [],
    recentOrders: [],
    topCategories: [],
    
    // Daily summary
    todayRevenue: 0,
    todayOrders: 0,
    todayCustomers: 0,
    growth: 0,
    
    // Chart instances
    charts: {},
    
    async init() {
      await this.fetchAllData();
      this.initCharts();
      this.startRealTimeSimulation();
      this.updateDOM(); // New method to update static elements if not using x-text everywhere
    },
    
    async fetchAllData() {
      try {
        // Fetch summary
        const summaryRes = await fetch('/api/analytics/summary');
        const summary = await summaryRes.json();
        this.totalRevenue = summary.totalRevenueAllTime || 0;
        this.revenueLast30 = summary.revenueLast30Days || 0;
        this.ordersLast30 = summary.ordersLast30Days || 0;
        this.newUsers = summary.newUsersLast30Days || 0;
        this.totalProducts = summary.totalProducts || 0;
        this.avgOrderValue = summary.avgOrderValue || 0;
        this.activeShops = summary.activeShops || 0;
        this.todayRevenue = summary.todayRevenue || 0;
        this.todayOrders = summary.todayOrders || 0;
        this.todayCustomers = summary.todayCustomers || 0;
        this.growth = summary.growth || 0;
        this.paymentBreakdown = summary.paymentBreakdown || { cod: 0, momo: 0 };

        // Fetch revenue daily for chart
        const revenueRes = await fetch('/api/analytics/revenue-daily');
        this.revenueData = await revenueRes.json();

        // Fetch user ages
        const agesRes = await fetch('/api/analytics/user-ages');
        const ages = await agesRes.json();
        this.ageData = ages.map(group => ({
          label: group._id === 'Unknown' ? 'Không xác định' : `${group._id} - ${group._id + 9}`,
          value: group.count,
          color: this.getRandomColor()
        }));

        // Fetch top shops
        const shopsRes = await fetch('/api/analytics/top-shops');
        this.topShops = await shopsRes.json();

        // Fetch recent orders
        const ordersRes = await fetch('/api/orders?limit=10');
        this.recentOrders = (await ordersRes.json()).orders || [];

        // Fetch top categories
        const catsRes = await fetch('/api/analytics/top-categories');
        this.topCategories = await catsRes.json();

      } catch (err) {
        console.error('Error fetching analytics data:', err);
      }
    },
    
    // New method to update DOM elements (if HTML doesn't use x-text, but ideally use x-text in HTML)
    updateDOM() {
      // Update total revenue
      const totalRevElem = document.querySelector('.revenue-summary .display-4');
      if (totalRevElem) totalRevElem.textContent = this.formatCurrency(this.totalRevenue);

      // Update cash payment
      const cashElem = document.querySelector('.payment-method-card:nth-child(1) .display-5');
      if (cashElem) cashElem.textContent = this.formatCurrency(this.paymentBreakdown.cod);
      const cashPct = document.querySelector('.payment-method-card:nth-child(1) .text-success small');
      if (cashPct) cashPct.textContent = this.formatPercentage((this.paymentBreakdown.cod / this.totalRevenue) * 100) + ' tổng doanh thu';

      // Update transfer payment
      const transferElem = document.querySelector('.payment-method-card:nth-child(2) .display-5');
      if (transferElem) transferElem.textContent = this.formatCurrency(this.paymentBreakdown.momo);
      const transferPct = document.querySelector('.payment-method-card:nth-child(2) .text-success small');
      if (transferPct) transferPct.textContent = this.formatPercentage((this.paymentBreakdown.momo / this.totalRevenue) * 100) + ' tổng doanh thu';

      // Update today summary (assuming selectors match HTML structure)
      const todayRevElem = document.querySelector('.revenue-summary:last-child .display-3');
      if (todayRevElem) todayRevElem.textContent = this.formatCurrency(this.todayRevenue);
      const ordersElem = document.querySelector('.revenue-summary:last-child .col-md-4:nth-child(1) .h5');
      if (ordersElem) ordersElem.textContent = 'Đơn hàng: ' + this.formatNumber(this.todayOrders);
      const avgOrderElem = document.querySelector('.revenue-summary:last-child .col-md-4:nth-child(1) small');
      if (avgOrderElem) avgOrderElem.textContent = 'Trung bình ' + this.formatCurrency(this.todayRevenue / this.todayOrders || 0) + '/đơn';
      const customersElem = document.querySelector('.revenue-summary:last-child .col-md-4:nth-child(2) .h5');
      if (customersElem) customersElem.textContent = 'Khách hàng: ' + this.formatNumber(this.todayCustomers);
      const avgCustomerElem = document.querySelector('.revenue-summary:last-child .col-md-4:nth-child(2) small');
      if (avgCustomerElem) avgCustomerElem.textContent = 'Trung bình ' + this.formatCurrency(this.todayRevenue / this.todayCustomers || 0) + '/khách';
      const growthElem = document.querySelector('.revenue-summary:last-child .col-md-4:nth-child(3) .h5');
      if (growthElem) growthElem.textContent = 'Tăng trưởng: ' + (this.growth > 0 ? '+' : '') + this.formatPercentage(this.growth);
    },
    
    initCharts() {
      this.clearExistingCharts();
      this.initRevenueChart();
      this.initRealTimeChart();
      this.initAgeChart();
      this.initGenderChart();
    },
    
    clearExistingCharts() {
      Object.keys(this.charts).forEach(key => {
        if (this.charts[key] && this.charts[key].destroy) {
          this.charts[key].destroy();
        }
      });
      this.charts = {};
    },
    
    initRevenueChart() {
      const dates = this.revenueData.map(d => d._id);
      const revenues = this.revenueData.map(d => d.total);
      
      const options = {
        series: [{
          name: 'Doanh thu',
          data: revenues
        }],
        chart: {
          height: 350,
          type: 'area',
          toolbar: { show: false },
          zoom: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#007bff'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 90, 100]
          }
        },
        xaxis: {
          categories: dates,
          labels: { rotate: -45, style: { fontSize: '12px', colors: '#6c757d' } }
        },
        yaxis: {
          labels: {
            formatter: val => '$' + (val / 1000).toFixed(0) + 'K',
            style: { fontSize: '12px', colors: '#6c757d' }
          }
        },
        grid: { borderColor: '#e9ecef', strokeDashArray: 3 },
        tooltip: { y: { formatter: val => '$' + val.toLocaleString() } }
      };
      
      const chartElement = document.querySelector("#revenueChart");
      if (chartElement) {
        this.charts.revenue = new ApexCharts(chartElement, options);
        this.charts.revenue.render();
      }
    },
    
    initRealTimeChart() {
      const options = {
        series: [{
          data: this.generateRealTimeData(30, 100, 200)
        }],
        chart: {
          height: 150,
          type: 'line',
          animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
          toolbar: { show: false },
          zoom: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#fd7e14'],
        markers: { size: 0 },
        xaxis: { type: 'datetime', range: 30000, labels: { show: false }, axisBorder: { show: false } },
        yaxis: { min: 50, max: 250, labels: { show: false } },
        grid: { show: false },
        legend: { show: false }
      };
      
      const chartElement = document.querySelector("#realTimeChart");
      if (chartElement) {
        this.charts.realTime = new ApexCharts(chartElement, options);
        this.charts.realTime.render();
      }
    },
    
    initAgeChart() {
      const series = this.ageData.map(d => d.value);
      const labels = this.ageData.map(d => d.label);
      const colors = this.ageData.map(d => d.color);
      
      const options = {
        series,
        chart: { type: 'pie', height: 300 },
        labels,
        colors,
        legend: { position: 'bottom' },
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
      };
      
      const chartElement = document.querySelector("#ageChart");
      if (chartElement) {
        this.charts.age = new ApexCharts(chartElement, options);
        this.charts.age.render();
      }
    },
    
    initGenderChart() {
      const series = this.genderData.map(d => d.value);
      const labels = this.genderData.map(d => d.label);
      const colors = this.genderData.map(d => d.color);
      
      const options = {
        series,
        chart: { type: 'pie', height: 300 },
        labels,
        colors,
        legend: { position: 'bottom' },
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
      };
      
      const chartElement = document.querySelector("#genderChart");
      if (chartElement) {
        this.charts.gender = new ApexCharts(chartElement, options);
        this.charts.gender.render();
      }
    },
    
    startRealTimeSimulation() {
      setInterval(() => {
        this.updateRealTimeChart();
        this.realTimeUsers = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
      }, 2000);
    },
    
    updateRealTimeChart() {
      if (this.charts.realTime) {
        const x = new Date().getTime();
        const y = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
        let series = this.charts.realTime.w.config.series[0].data.slice();
        series.push([x, y]);
        if (series.length > 30) series.shift();
        this.charts.realTime.updateSeries([{ data: series }]);
      }
    },
    
    generateRealTimeData(count, min, max) {
      let i = 0;
      const series = [];
      const time = new Date().getTime();
      while (i < count) {
        const x = time - (count - 1 - i) * 1000;
        const y = Math.floor(Math.random() * (max - min + 1)) + min;
        series.push([x, y]);
        i++;
      }
      return series;
    },
    
    getRandomColor() {
      return '#' + Math.floor(Math.random()*16777215).toString(16);
    },
    
    formatCurrency(value) {
      return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    
    formatNumber(value) {
      return value.toLocaleString();
    },
    
    formatPercentage(value) {
      return value.toFixed(1) + '%';
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString();
    }
  }));
});