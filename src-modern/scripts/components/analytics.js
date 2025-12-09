// src/components/analytics.js
import { getJSON } from '../utils/api.js';

console.log('📊 Loading Analytics module...');

// ============================================================
// ALPINE COMPONENT
// ============================================================
const analyticsComponent = () => ({
  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  loading: true,
  error: null,

  // Metrics (khớp với HTML x-text)
  totalRevenue: 0,
  todayRevenue: 0,
  todayOrders: 0,
  todayCustomers: 0,
  growth: 0,

  // Payment breakdown
  paymentBreakdown: {
    cod: 0,
    momo: 0,
    codCount: 0,
    momoCount: 0
  },

  // Data arrays
  recentOrders: [],
  topCategories: [],
  revenueDaily: [],

  // Chart instance
  revenueChart: null,

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  async init() {
    console.log('🚀 Analytics Component Initialized');

    try {
      await this.loadData();

      // Đợi DOM render xong mới vẽ chart
      this.$nextTick(() => {
        this.initRevenueChart();
      });

    } catch (err) {
      console.error('❌ Init Error:', err);
      this.error = 'Không thể khởi tạo component';
    }
  },

  // ------------------------------------------------------------
  // DATA LOADING
  // ------------------------------------------------------------
  async loadData() {
    this.loading = true;
    this.error = null;

    try {
      console.log('🔄 Fetching analytics data...');

      // Gọi song song 2 API
      const [summary, revenueDaily] = await Promise.all([
        getJSON('/api/analytics/summary'),
        getJSON('/api/analytics/revenue-daily?days=30')
      ]);

      // Gán dữ liệu vào state
      this.totalRevenue = summary.totalRevenue || 0;
      this.todayRevenue = summary.todayRevenue || 0;
      this.todayOrders = summary.todayOrders || 0;
      this.todayCustomers = summary.todayCustomers || 0;
      this.growth = summary.growth || 0;
      this.paymentBreakdown = summary.paymentBreakdown || { cod: 0, momo: 0 };
      this.recentOrders = summary.recentOrders || [];
      this.topCategories = summary.topCategories || [];
      this.revenueDaily = revenueDaily || [];

      console.log('✅ Analytics Data Loaded Successfully');
      console.log('📊 Summary:', { 
        totalRevenue: this.totalRevenue,
        todayOrders: this.todayOrders,
        recentOrders: this.recentOrders.length
      });

    } catch (err) {
      console.error('❌ Load Data Error:', err);
      this.error = err.message || 'Không thể tải dữ liệu từ server';
    } finally {
      this.loading = false;
    }
  },

  // ------------------------------------------------------------
  // CHART: Revenue Daily (30 ngày)
  // ------------------------------------------------------------
  initRevenueChart() {
    const el = document.querySelector('#revenueChart');
    if (!el) {
      console.warn('⚠️ Element #revenueChart not found');
      return;
    }

    if (!window.ApexCharts) {
      console.warn('⚠️ ApexCharts not loaded');
      return;
    }

    // Destroy chart cũ nếu có
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const options = {
      series: [{
        name: 'Doanh thu',
        data: this.revenueDaily.map(x => x.revenue || 0)
      }],
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#4f46e5'],
      dataLabels: { enabled: false },
      stroke: { 
        curve: 'smooth', 
        width: 2 
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1
        }
      },
      xaxis: {
        categories: this.revenueDaily.map(x => {
          const date = new Date(x._id);
          return date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit' 
          });
        }),
        labels: {
          rotate: -45,
          style: { fontSize: '11px' }
        }
      },
      yaxis: {
        labels: {
          formatter: val => this.formatShortCurrency(val)
        }
      },
      tooltip: {
        y: {
          formatter: val => this.formatCurrency(val)
        }
      }
    };

    this.revenueChart = new ApexCharts(el, options);
    this.revenueChart.render();
    console.log('📈 Revenue chart rendered');
  },

  // ------------------------------------------------------------
  // FORMATTERS
  // ------------------------------------------------------------
  formatCurrency(val) {
    if (!val) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(val);
  },

  formatNumber(val) {
    return new Intl.NumberFormat('vi-VN').format(val || 0);
  },

  formatPercentage(val) {
    return (val || 0).toFixed(1) + '%';
  },

  formatShortCurrency(val) {
    if (!val) return '0';
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' tỷ';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + ' tr';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  },

  // Helper: Hiển thị status badge
  getStatusText(status) {
    const map = {
      delivered: 'Hoàn thành',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      arrived: 'Đã đến',
      cancelled: 'Đã hủy',
      refund_pending: 'Hoàn tiền',
      refunded: 'Đã hoàn tiền'
    };
    return map[status] || status;
  }
});

// ============================================================
// EXPORT & REGISTER
// ============================================================
export default function registerAnalyticsComponent() {
  console.log('📦 Registering Analytics Component...');

  if (window.Alpine) {
    window.Alpine.data('analyticsComponent', analyticsComponent);
    console.log('✅ Analytics Component Registered');
  } else {
    document.addEventListener('alpine:init', () => {
      window.Alpine.data('analyticsComponent', analyticsComponent);
      console.log('✅ Analytics Component Registered (via alpine:init)');
    });
  }
}
