// Analytics Dashboard Manager
class AnalyticsManager {
  constructor() {
    console.log('📈 AnalyticsManager initialized');
    this.charts = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    console.log('🚀 Initializing analytics dashboard...');
    
    try {
      // Initialize Alpine.js components
      await this.initAlpineComponents();
      
      // Initialize charts
      await this.initCharts();
      
      // Start real-time updates
      this.startRealTimeUpdates();
      
      this.initialized = true;
      console.log('✅ Analytics dashboard initialized');
    } catch (error) {
      console.error('❌ Error initializing analytics:', error);
    }
  }

  async initAlpineComponents() {
    // Wait for Alpine.js to be available
    if (!window.Alpine) {
      console.warn('Alpine.js not loaded, waiting...');
      await new Promise(resolve => {
        const checkAlpine = setInterval(() => {
          if (window.Alpine) {
            clearInterval(checkAlpine);
            resolve();
          }
        }, 100);
      });
    }

    // Initialize Alpine.js data
    window.Alpine.data('analyticsComponent', () => ({
      // Core data
      metrics: {
        revenue: 124592,
        visitors: 45672,
        conversionRate: 3.45,
        bounceRate: 24.8
      },
      
      // Real-time data
      realTimeUsers: 1247,
      pageViews: 8452,
      sessions: 2931,
      
      // Chart instances
      charts: {},
      
      // Traffic sources data
      trafficSources: [
        { name: 'Organic Search', percentage: 42.3, visitors: 19314, color: '#007bff' },
        { name: 'Direct', percentage: 31.8, visitors: 14519, color: '#28a745' },
        { name: 'Social Media', percentage: 16.4, visitors: 7490, color: '#fd7e14' },
        { name: 'Referral', percentage: 9.5, visitors: 4349, color: '#e74c3c' }
      ],
      
      // Top pages data
      topPages: [
        { path: '/dashboard', title: 'Main Dashboard', views: 12847, uniqueViews: 8921, avgTime: '4m 32s', bounceRate: 22.1, conversion: 8.4 },
        { path: '/analytics', title: 'Analytics Page', views: 9234, uniqueViews: 7156, avgTime: '6m 18s', bounceRate: 18.7, conversion: 12.3 },
        { path: '/products', title: 'Product Catalog', views: 7892, uniqueViews: 5467, avgTime: '3m 45s', bounceRate: 45.2, conversion: 6.7 },
        { path: '/checkout', title: 'Checkout Process', views: 4567, uniqueViews: 3891, avgTime: '2m 23s', bounceRate: 15.6, conversion: 67.8 },
        { path: '/contact', title: 'Contact Form', views: 3421, uniqueViews: 2876, avgTime: '1m 54s', bounceRate: 68.4, conversion: 3.2 }
      ],
      
      // Geographic data
      geographicData: [
        { name: 'United States', code: 'US', percentage: 38.2, visitors: 17446 },
        { name: 'United Kingdom', code: 'GB', percentage: 22.7, visitors: 10367 },
        { name: 'Canada', code: 'CA', percentage: 15.8, visitors: 7215 },
        { name: 'Germany', code: 'DE', percentage: 12.4, visitors: 5663 },
        { name: 'Australia', code: 'AU', percentage: 10.9, visitors: 4981 }
      ],
      
      // Device data
      deviceData: [
        { type: 'Desktop', percentage: 68.4, users: 31247, icon: 'laptop', color: 'primary' },
        { type: 'Mobile', percentage: 24.8, users: 11327, icon: 'phone', color: 'success' },
        { type: 'Tablet', percentage: 6.8, users: 3098, icon: 'tablet', color: 'warning' }
      ],
      
      // Initialize component
      init() {
        this.$nextTick(() => {
          this.initCharts();
          this.startRealTimeUpdates();
        });
      },
      
      // Clear existing charts to prevent duplicates
      clearExistingCharts() {
        Object.keys(this.charts).forEach(chartKey => {
          if (this.charts[chartKey] && this.charts[chartKey].destroy) {
            this.charts[chartKey].destroy();
          }
        });
        this.charts = {};
      },
      
      // Initialize all charts
      initCharts() {
        this.clearExistingCharts();
        
        this.initRevenueChart();
        this.initTrafficSourcesChart();
        this.initBehaviorChart();
        this.initRealTimeChart();
        this.initBrowserChart();
      },
      
      // Revenue analytics chart
      initRevenueChart() {
        const chartElement = document.querySelector("#revenueChart");
        if (!chartElement) return;

        const revenueOptions = {
          series: [{
            name: 'Revenue',
            data: [8200, 9100, 7800, 10200, 11500, 9800, 12400, 11200, 10800, 13200, 12100, 14200, 13800, 15100]
          }, {
            name: 'Profit',
            data: [3100, 3800, 2900, 4200, 4800, 3900, 5200, 4600, 4200, 5800, 5100, 6200, 5900, 6800]
          }],
          chart: {
            height: 350,
            type: 'area',
            toolbar: { show: false }
          },
          colors: ['#007bff', '#28a745'],
          stroke: { curve: 'smooth', width: 2 },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.4,
              opacityTo: 0.1
            }
          },
          xaxis: {
            categories: ['Jan 1', 'Jan 3', 'Jan 5', 'Jan 7', 'Jan 9', 'Jan 11', 'Jan 13', 'Jan 15', 'Jan 17', 'Jan 19', 'Jan 21', 'Jan 23', 'Jan 25', 'Jan 27']
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return '$' + (val / 1000).toFixed(0) + 'K';
              }
            }
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return '$' + val.toLocaleString();
              }
            }
          }
        };

        this.charts.revenue = new ApexCharts(chartElement, revenueOptions);
        this.charts.revenue.render();
      },
      
      // Traffic sources pie chart
      initTrafficSourcesChart() {
        const chartElement = document.querySelector("#trafficSourcesChart");
        if (!chartElement) return;

        const trafficOptions = {
          series: this.trafficSources.map(source => source.percentage),
          chart: {
            width: '100%',
            height: 200,
            type: 'donut'
          },
          labels: this.trafficSources.map(source => source.name),
          colors: this.trafficSources.map(source => source.color),
          plotOptions: {
            pie: {
              donut: { size: '60%' }
            }
          },
          legend: { show: false },
          dataLabels: { enabled: false }
        };
        
        this.charts.trafficSources = new ApexCharts(chartElement, trafficOptions);
        this.charts.trafficSources.render();
      },
      
      // User behavior funnel chart
      initBehaviorChart() {
        const chartElement = document.querySelector("#behaviorChart");
        if (!chartElement) return;

        const behaviorOptions = {
          series: [{
            name: 'Users',
            data: [45672, 32148, 18934, 12567, 8234, 4512]
          }],
          chart: {
            type: 'bar',
            height: 300,
            toolbar: { show: false }
          },
          plotOptions: {
            bar: {
              horizontal: true,
              distributed: true,
              barHeight: '60%'
            }
          },
          colors: ['#007bff', '#0056b3', '#004085', '#003066', '#002752', '#001e3d'],
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val.toLocaleString();
            }
          },
          xaxis: {
            categories: ['Page Views', 'Unique Visitors', 'Engaged Users', 'Add to Cart', 'Checkout Started', 'Purchase']
          }
        };
        
        this.charts.behavior = new ApexCharts(chartElement, behaviorOptions);
        this.charts.behavior.render();
      },
      
      // Real time visitors chart
      initRealTimeChart() {
        const chartElement = document.querySelector("#realTimeChart");
        if (!chartElement) return;

        const realTimeOptions = {
          series: [{
            name: 'Users',
            data: this.generateRealTimeData(30, 1200, 1300)
          }],
          chart: {
            height: 150,
            type: 'line',
            animations: {
              enabled: true,
              easing: 'linear',
              dynamicAnimation: { speed: 1000 }
            },
            toolbar: { show: false }
          },
          colors: ['#fd7e14'],
          stroke: { curve: 'smooth', width: 2 },
          xaxis: {
            type: 'datetime',
            range: 30000,
            labels: { show: false }
          },
          yaxis: {
            min: 1000,
            max: 1500,
            labels: { show: false }
          }
        };
        
        this.charts.realTime = new ApexCharts(chartElement, realTimeOptions);
        this.charts.realTime.render();
      },

      // Browser usage chart
      initBrowserChart() {
        const chartElement = document.querySelector("#browserChart");
        if (!chartElement) return;

        const browserOptions = {
          series: [58.6, 22.3, 8.1, 5.4, 5.6],
          chart: {
            type: 'polarArea',
            height: 350
          },
          labels: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'],
          stroke: { colors: ['#fff'] },
          fill: { opacity: 0.85 },
          legend: { position: 'bottom' }
        };

        this.charts.browser = new ApexCharts(chartElement, browserOptions);
        this.charts.browser.render();
      },
      
      // Generate data for real-time chart
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
      
      // Start real time updates
      startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
          this.updateRealTimeData();
          this.updateRealTimeMetrics();
        }, 1000);
      },
      
      // Update real time chart data
      updateRealTimeData() {
        if (this.charts.realTime) {
          const x = new Date().getTime();
          const y = Math.floor(Math.random() * (1300 - 1200 + 1)) + 1200;
          
          let series = this.charts.realTime.w.config.series[0].data.slice();
          series.push([x, y]);
          series.shift();
          
          this.charts.realTime.updateSeries([{ data: series }]);
        }
      },
      
      // Update real time metrics
      updateRealTimeMetrics() {
        this.realTimeUsers += Math.floor(Math.random() * 21) - 10;
        this.pageViews += Math.floor(Math.random() * 5) + 1;
        if (Math.random() > 0.95) {
          this.sessions += 1;
        }
      },
      
      // Formatters
      formatCurrency(value) {
        return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      
      formatNumber(value) {
        return value.toLocaleString();
      },
      
      formatPercentage(value) {
        return value.toFixed(2) + '%';
      },

      // Export data function
      exportData() {
        const dataToExport = {
          metrics: this.metrics,
          trafficSources: this.trafficSources,
          topPages: this.topPages,
          geographicData: this.geographicData,
          deviceData: this.deviceData,
          exportDate: new Date().toISOString(),
          totalRevenue: 124592.00,
          totalOrders: 1567,
          averageOrderValue: 79.50
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
        const a = document.createElement('a');
        a.setAttribute("href", dataStr);
        a.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Show success message
        this.showToast('Analytics data exported successfully!', 'success');
      },

      // Toast notification
      showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
          <div class="d-flex">
            <div class="toast-body">
              <i class="bi bi-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        `;
        
        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
          toast.remove();
        });
      },

      // Cleanup on destroy
      destroy() {
        if (this.updateInterval) {
          clearInterval(this.updateInterval);
        }
        Object.values(this.charts).forEach(chart => {
          if (chart && chart.destroy) {
            chart.destroy();
          }
        });
      }
    }));
  }

  async initCharts() {
    // Check if ApexCharts is available
    if (!window.ApexCharts) {
      console.warn('ApexCharts not loaded, waiting...');
      await new Promise(resolve => {
        const checkApexCharts = setInterval(() => {
          if (window.ApexCharts) {
            clearInterval(checkApexCharts);
            resolve();
          }
        }, 100);
      });
    }
  }

  startRealTimeUpdates() {
    // Additional real-time updates if needed
    setInterval(() => {
      this.updateRevenueMetrics();
    }, 5000);
  }

  updateRevenueMetrics() {
    // Update revenue display with random fluctuation
    const revenueElement = document.querySelector('.revenue-summary .display-3');
    if (revenueElement) {
      const current = parseFloat(revenueElement.textContent.replace(/[^0-9.]/g, ''));
      const change = (Math.random() * 100 - 50); // Random change between -50 and +50
      const newValue = Math.max(0, current + change);
      revenueElement.textContent = `$${newValue.toFixed(2)}`;
    }
  }

  destroy() {
    console.log('🧹 Cleaning up AnalyticsManager');
    this.initialized = false;
  }
}

// Initialize analytics when page loads
function initializeAnalytics() {
  console.log('📊 Initializing analytics page...');
  
  // Create and initialize analytics manager
  const analyticsManager = new AnalyticsManager();
  window.analyticsManager = analyticsManager;
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => analyticsManager.init());
  } else {
    analyticsManager.init();
  }
  
  // Setup export button
  const exportBtn = document.querySelector('[onclick*="exportData"]');
  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // This will be handled by Alpine.js component
    });
  }
  
  console.log('✅ Analytics page setup complete');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnalyticsManager, initializeAnalytics };
}