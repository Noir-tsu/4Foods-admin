// src-modern/scripts/managers/DashboardManager.js
import { getJSON } from '../utils/api.js';

class DashboardManager {
  constructor() {
    this.charts = {};
  }

  async loadDashboardData() {
    try {
      this.showLoading();

      const [usersRes, shopsRes, productsRes, ordersRes, statsRes] = await Promise.all([
        getJSON('/api/users'),
        getJSON('/api/shops'),
        getJSON('/api/products'),
        getJSON('/api/orders'),
        getJSON('/api/orders/stats')
      ]);

      const users = usersRes.users || [];
      const shops = shopsRes.shops || [];
      const orders = ordersRes.orders || [];
      const stats = statsRes || { totalRevenue: 0, totalOrders: 0, previousRevenue: 0, previousOrders: 0 };

      // Cập nhật cards
      this.updateOverview({
        revenue: stats.totalRevenue || 0,
        revenueChange: this.calcChange(stats.totalRevenue, stats.previousRevenue),
        orders: stats.totalOrders || 0,
        ordersChange: this.calcChange(stats.totalOrders, stats.previousOrders),
        users: users.length,
        usersChange: '+12.5%', // tạm tính hoặc thêm API riêng
        shops: shops.length,
        shopsChange: '+8.3%'
      });

      // Cập nhật bảng, biểu đồ...
      this.updateRecentOrders(orders.slice(0, 5));
      this.updateRecentActivity(orders.slice(0, 5));
      this.renderCharts(orders);

      this.hideLoading();
    } catch (err) {
      console.error('Load dashboard failed:', err);
      this.showToast('Không tải được dữ liệu dashboard', 'error');
      this.hideLoading();
    }
  }

  calcChange(current, prev) {
    if (!prev || prev === 0) return '+0%';
    const change = ((current - prev) / prev * 100).toFixed(1);
    return change > 0 ? `+${change}%` : `${change}%`;
  }

  updateOverview(data) {
    document.getElementById('revenue-current').textContent = `$${data.revenue.toFixed(2)}`;
    document.getElementById('revenue-change').textContent = data.revenueChange;
    document.getElementById('orders-current').textContent = data.orders;
    document.getElementById('orders-change').textContent = data.ordersChange;
    document.getElementById('users-current').textContent = data.users;
    document.getElementById('users-change').textContent = data.usersChange;
    document.getElementById('shops-current').textContent = data.shops;
    document.getElementById('shops-change').textContent = data.shopsChange;
  }

  updateRecentOrders(orders) {
    const tbody = document.getElementById('recent-orders-table');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted">Chưa có đơn hàng</td></tr>';
      return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>${o._id}</td>
        <td>${o.user?.name || 'Khách lẻ'}</td>
        <td>$${o.total.toFixed(2)}</td>
        <td><span class="badge bg-${o.status === 'delivered' ? 'success' : 'warning'}">${o.status}</span></td>
        <td>${new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
      </tr>
    `).join('');
  }

  updateRecentActivity(orders) {
    const container = document.getElementById('recent-activity');
    if (orders.length === 0) {
      container.innerHTML = '<div class="text-center text-muted py-5"><p>Chưa có hoạt động</p></div>';
      return;
    }
    container.innerHTML = orders.map(o => `
      <div class="d-flex align-items-start mb-3">
        <div class="me-3"><i class="bi bi-bag-check text-success"></i></div>
        <div>
          <div>Đơn hàng mới <strong>#${o._id}</strong></div>
          <small class="text-muted">${new Date(o.createdAt).toLocaleString('vi-VN')}</small>
        </div>
      </div>
    `).join('');
  }

  renderCharts(orders) {
    // Biểu đồ doanh thu (7 ngày gần nhất)
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
      new Chart(revenueCtx, {
        type: 'line',
        data: { labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], datasets: [{ label: 'Doanh thu', data: [1200, 1900, 3000, 2500, 2200, 3200, 2800], borderColor: '#6366f1', tension: 0.4 }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    }

    // Trạng thái đơn hàng
    const statusCtx = document.getElementById('orderStatusChart');
    if (statusCtx) {
      new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'],
          datasets: [{ data: [30, 20, 45, 5], backgroundColor: ['#ffc107', '#0dcaf0', '#198754', '#dc3545'] }]
        },
        options: { responsive: true }
      });
    }

    // Tăng trưởng người dùng
    const growthCtx = document.getElementById('accountGrowthChart');
    if (growthCtx) {
      new Chart(growthCtx, {
        type: 'bar',
        data: { labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], datasets: [{ label: 'Người dùng mới', data: [12, 19, 15, 25, 22, 30, 28], backgroundColor: '#6366f1' }] },
        options: { responsive: true }
      });
    }
  }

  showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
  }

  showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : 'success'} border-0`;
    toast.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    document.getElementById('toast-container').appendChild(toast);
    new bootstrap.Toast(toast, { delay: 3000 }).show();
  }

  async refreshData() {
    const btn = document.getElementById('refresh-btn');
    const icon = btn.querySelector('i');
    icon.classList.add('icon-spin');
    await this.loadDashboardData();
    icon.classList.remove('icon-spin');
  }
}

function initializeDashboard() {
  window.dashboard = new DashboardManager();
  window.dashboard.loadDashboardData();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DashboardManager, initializeDashboard };
} else {
  document.addEventListener('DOMContentLoaded', initializeDashboard);
}
window.initializeDashboard = initializeDashboard;
window.dashboard = null;


