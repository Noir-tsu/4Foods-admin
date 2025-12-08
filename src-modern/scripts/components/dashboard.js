// src/components/dashboard.js
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
  DoughnutController
} from 'chart.js';
import { getJSON } from '../utils/api.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
  DoughnutController
);

export class DashboardManager {
  constructor() {
    this.charts = new Map();
    this.init();
  }

  async init() {
    const loading = document.getElementById('loading-screen');
    if (loading) loading.classList.remove('d-none');

    try {
      const [statsRes, ordersRes, usersRes, shopsRes] = await Promise.all([
        getJSON('/api/orders/stats'),
        getJSON('/api/orders'),
        getJSON('/api/users'),
        getJSON('/api/shops')
      ]);

      const orders = (ordersRes.orders || []).reverse();
      const users  = usersRes.users  || [];
      const shops  = shopsRes.shops  || [];

      this.updateStatsCards(statsRes, users.length, shops.length);
      this.revenueData      = this.aggregateRevenue(orders);
      this.userGrowthData   = this.aggregateUserGrowth(users);
      this.orderStatusData  = this.countOrderStatuses(orders);
      this.recentOrdersData = orders;
      this.recentActivities = this.generateRecentActivities(orders, users, shops);

    } catch (err) {
      console.error('Lỗi load dữ liệu → dùng mẫu', err);
      this.loadSampleData();
    } finally {
      if (loading) loading.classList.add('d-none');
    }

    this.renderRevenueChart();
    this.renderUserGrowthChart();
    this.renderOrderStatusChart();
    this.renderRecentOrdersTable();
    this.renderRecentActivity(); // HOẠT ĐỘNG GẦN ĐÂY ĐẸP + NHIỀU DỮ LIỆU
  }

  updateStatsCards(stats, userCount, shopCount) {
    const fmt = n => Number(n || 0).toLocaleString('vi-VN');
    document.getElementById('revenue-current').textContent = fmt(stats.totalRevenue);
    document.getElementById('orders-current').textContent   = fmt(stats.totalOrders);
    document.getElementById('users-current').textContent   = fmt(userCount);
    document.getElementById('shops-current').textContent   = fmt(shopCount);

    const revenueChange = stats.previousRevenue ? ((stats.totalRevenue - stats.previousRevenue) / stats.previousRevenue * 100).toFixed(1) : 0;
    const ordersChange = stats.previousOrders ? ((stats.totalOrders - stats.previousOrders) / stats.previousOrders * 100).toFixed(1) : 0;

    const revEl = document.getElementById('revenue-change');
    revEl.textContent = revenueChange >= 0 ? `+${revenueChange}%` : `${revenueChange}%`;
    revEl.className = revenueChange >= 0 ? 'text-success' : 'text-danger';

    const ordEl = document.getElementById('orders-change');
    ordEl.textContent = ordersChange >= 0 ? `+${ordersChange}%` : `${ordersChange}%`;
    ordEl.className = ordersChange >= 0 ? 'text-success' : 'text-danger';
  }

  aggregateRevenue(orders) {
    const map = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + (o.total || 0);
    });
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Object.entries(map)
      .sort(([a],[b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]) => {
        const m = parseInt(k.split('-')[1]) - 1;
        return { month: months[m], revenue: v, profit: v * 0.3 };
      });
  }

  aggregateUserGrowth(users) {
    const map = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      map[d.toISOString().slice(0,10)] = 0;
    }
    users.forEach(u => {
      const key = new Date(u.createdAt).toISOString().slice(0,10);
      if (map.hasOwnProperty(key)) map[key]++;
    });
    return Object.entries(map).map(([day, count]) => ({
      day: day.slice(5).replace('-', '/'),
      newUsers: count
    }));
  }

  countOrderStatuses(orders) {
    const s = { 
      delivered: 0, processing: 0, shipping: 0, arrived: 0, 
      cancelled: 0, refund_pending: 0, refunded: 0 
    };
    orders.forEach(o => {
      switch(o.status) {
        case 'delivered': s.delivered++; break;
        case 'processing': s.processing++; break;
        case 'shipping': s.shipping++; break;
        case 'arrived': s.arrived++; break;
        case 'cancelled': s.cancelled++; break;
        case 'refund_pending': s.refund_pending++; break;
        case 'refunded': s.refunded++; break;
      }
    });
    return s;
  }

  getStatusBadge(status) {
    const map = {
      delivered:      { text: 'Hoàn thành',     class: 'bg-success' },
      processing:     { text: 'Đang xử lý',     class: 'bg-warning' },
      shipping:       { text: 'Đang giao',      class: 'bg-info' },
      arrived:        { text: 'Đã đến',         class: 'bg-primary' },
      cancelled:      { text: 'Đã hủy',         class: 'bg-danger' },
      refund_pending: { text: 'Chờ hoàn tiền',  class: 'bg-secondary' },
      refunded:       { text: 'Đã hoàn tiền',   class: 'bg-dark' },
    };
    return map[status] || { text: status, class: 'bg-secondary' };
  }

  generateRecentActivities(orders, users, shops) {
    const activities = [];

    // Người dùng mới
    users.slice(0, 5).forEach(u => {
      activities.push({
        icon: 'bi-person-add',
        color: 'text-success',
        text: `Người dùng mới: ${u.name || 'Khách'}`,
        time: this.formatTime(u.createdAt)
      });
    });

    // Đơn hàng mới
    orders.slice(0, 8).forEach(o => {
      activities.push({
        icon: 'bi-bag-check',
        color: 'text-primary',
        text: `Đơn hàng mới #${o._id.slice(-6).toUpperCase()} - ${o.user?.name || 'Khách lẻ'}`,
        time: this.formatTime(o.createdAt)
      });
    });

    // Cửa hàng mới
    shops.slice(0, 3).forEach(s => {
      activities.push({
        icon: 'bi-shop',
        color: 'text-info',
        text: `Cửa hàng mới: ${s.name}`,
        time: this.formatTime(s.createdAt)
      });
    });

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);
  }

  formatTime(date) {
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  }

  renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.revenueData.map(x => x.month),
        datasets: [
          { label: 'Doanh thu', data: this.revenueData.map(x => x.revenue), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
          { label: 'Lợi nhuận', data: this.revenueData.map(x => x.profit), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
    });
  }

  renderUserGrowthChart() {
    const ctx = document.getElementById('accountGrowthChart');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.userGrowthData.map(x => x.day),
        datasets: [{
          label: 'Người dùng mới',
          data: this.userGrowthData.map(x => x.newUsers),
          backgroundColor: '#6366f1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 } // CHỈ HIỆN SỐ NGUYÊN
          }
        }
      }
    });
  }

  renderOrderStatusChart() {
    const ctx = document.getElementById('orderStatusChart');
    if (!ctx) return;
    const s = this.orderStatusData;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Hoàn thành', 'Đang xử lý', 'Đang giao', 'Đã đến', 'Đã hủy', 'Chờ hoàn tiền', 'Đã hoàn tiền'],
        datasets: [{
          data: [s.delivered, s.processing, s.shipping, s.arrived, s.cancelled, s.refund_pending, s.refunded],
          backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#6b7280', '#1f2937']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }

  renderRecentOrdersTable() {
    const tbody = document.getElementById('recent-orders-table');
    if (!tbody) return;
    tbody.innerHTML = this.recentOrdersData.length
      ? this.recentOrdersData.map(o => `
          <tr>
            <td><strong>${o._id.slice(-6).toUpperCase()}</strong></td>
            <td>${o.user?.name || 'Khách lẻ'}</td>
            <td>${(o.total || 0).toLocaleString('vi-VN')}₫</td>
            <td><span class="badge ${this.getStatusBadge(o.status).class}">${this.getStatusBadge(o.status).text}</span></td>
            <td>${new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="text-center py-5 text-muted">Chưa có đơn hàng</td></tr>';
  }

  renderRecentActivity() {
    const container = document.getElementById('recent-activity-list');
    if (!container) return;
    container.innerHTML = this.recentActivities.map(a => `
      <div class="d-flex align-items-center py-3 border-bottom px-3">
        <i class="bi ${a.icon} fs-4 ${a.color} me-3"></i>
        <div class="flex-grow-1">
          <p class="mb-1 small fw-medium">${a.text}</p>
          <small class="text-muted">${a.time}</small>
        </div>
      </div>
    `).join('');
  }

  loadSampleData() {
    this.revenueData = this.generateRevenueData();
    this.userGrowthData = this.generateUserGrowthData();
    this.orderStatusData = { delivered: 1245, processing: 156, shipping: 89, arrived: 45, cancelled: 23, refund_pending: 12, refunded: 8 };
    this.recentOrdersData = this.generateRecentOrders();
    this.recentActivities = this.generateRecentActivities(this.recentOrdersData, [], []);
  }

  generateRevenueData() { /* giữ nguyên */ }
  generateUserGrowthData() { /* giữ nguyên */ }
  generateRecentOrders() { /* giữ nguyên */ }

  destroy() {
    this.charts.forEach(c => c?.destroy());
    this.charts.clear();
  }
}