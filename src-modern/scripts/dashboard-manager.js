// API base URL
const API_BASE = '/api';

console.log('🔄 Dashboard script loaded');

// Dashboard data management
class DashboardManager {
  constructor() {
    console.log('📊 DashboardManager initialized');
    this.isLoading = false;
  }

  async loadDashboardData() {
    try {
      console.log('⏳ Loading dashboard data...');
      this.showLoading();
      
      // Debug: Log URLs
      console.log('API URLs:', {
        overview: `${API_BASE}/dashboard/overview`,
        activity: `${API_BASE}/dashboard/recent-activity`,
        orders: `${API_BASE}/dashboard/recent-orders`
      });
      
      const [overview, activities, orders] = await Promise.all([
        this.fetchOverview(),
        this.fetchRecentActivity(),
        this.fetchRecentOrders()
      ]);
      
      console.log('✅ Data loaded:', { overview, activities, orders });
      
      this.updateOverviewCards(overview);
      this.updateRecentActivity(activities);
      this.updateRecentOrders(orders);
      
      this.hideLoading();
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data');
      this.hideLoading();
      
      // Hiển thị dữ liệu mẫu khi API fail
      this.loadSampleData();
    }
  }

  async fetchOverview() {
    try {
      console.log('📥 Fetching overview...');
      const response = await fetch(`${API_BASE}/dashboard/overview`);
      console.log('📤 Overview response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Overview data:', data);
      return data;
    } catch (error) {
      console.error('❌ fetchOverview error:', error);
      throw error;
    }
  }

  async fetchRecentActivity() {
    try {
      console.log('📥 Fetching recent activity...');
      const response = await fetch(`${API_BASE}/dashboard/recent-activity`);
      console.log('📤 Activity response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Activity data:', data);
      return data;
    } catch (error) {
      console.error('❌ fetchRecentActivity error:', error);
      throw error;
    }
  }

  async fetchRecentOrders() {
    try {
      console.log('📥 Fetching recent orders...');
      const response = await fetch(`${API_BASE}/dashboard/recent-orders`);
      console.log('📤 Orders response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Orders data:', data);
      return data;
    } catch (error) {
      console.error('❌ fetchRecentOrders error:', error);
      throw error;
    }
  }

  async refreshData() {
    try {
      const refreshBtn = document.querySelector('[title="Refresh data"]');
      const icon = refreshBtn.querySelector('i');
      icon.classList.add('icon-spin');
      
      const response = await fetch(`${API_BASE}/dashboard/refresh`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Refresh failed');
      
      await this.loadDashboardData();
      
      this.showToast('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      this.showToast('Failed to refresh data', 'error');
    } finally {
      const refreshBtn = document.querySelector('[title="Refresh data"]');
      const icon = refreshBtn.querySelector('i');
      if (icon) icon.classList.remove('icon-spin');
    }
  }

  updateOverviewCards(data) {
    console.log('🎨 Updating overview cards with:', data);
    
    // Cập nhật Revenue
    const revenueElement = document.querySelector('.stats-card:nth-child(1) h3');
    const revenuePercentage = document.querySelector('.stats-card:nth-child(1) small');
    if (revenueElement && revenuePercentage) {
      revenueElement.textContent = `$${data.revenue?.current?.toLocaleString() || '0'}`;
      revenuePercentage.innerHTML = this.formatPercentage(data.revenue?.percentage || 0);
    } else {
      console.warn('⚠️ Revenue elements not found');
    }
    
    // Cập nhật Orders
    const ordersElement = document.querySelector('.stats-card:nth-child(2) h3');
    const ordersPercentage = document.querySelector('.stats-card:nth-child(2) small');
    if (ordersElement && ordersPercentage) {
      ordersElement.textContent = (data.orders?.current || 0).toLocaleString();
      ordersPercentage.innerHTML = this.formatPercentage(data.orders?.percentage || 0);
    }
    
    // Cập nhật Users
    const usersElement = document.querySelector('.stats-card:nth-child(3) h3');
    const usersPercentage = document.querySelector('.stats-card:nth-child(3) small');
    if (usersElement && usersPercentage) {
      usersElement.textContent = (data.users?.current || 0).toLocaleString();
      usersPercentage.innerHTML = this.formatPercentage(data.users?.percentage || 0);
    }
    
    // Cập nhật Shops
    const shopsElement = document.querySelector('.stats-card:nth-child(4) h3');
    const shopsPercentage = document.querySelector('.stats-card:nth-child(4) small');
    if (shopsElement && shopsPercentage) {
      shopsElement.textContent = (data.shops?.current || 0).toLocaleString();
      shopsPercentage.innerHTML = this.formatPercentage(data.shops?.percentage || 0);
    }
    
    // Cập nhật Shippers
    const shippersElement = document.querySelector('.stats-card:nth-child(5) h3');
    const shippersPercentage = document.querySelector('.stats-card:nth-child(5) small');
    if (shippersElement && shippersPercentage) {
      shippersElement.textContent = (data.shippers?.current || 0).toLocaleString();
      shippersPercentage.innerHTML = this.formatPercentage(data.shippers?.percentage || 0);
    }
  }

  updateRecentActivity(activities) {
    console.log('🎨 Updating recent activity with:', activities);
    const activityFeed = document.querySelector('.activity-feed');
    
    if (!activityFeed) {
      console.warn('⚠️ Activity feed element not found');
      return;
    }
    
    if (!activities || !Array.isArray(activities)) {
      console.warn('⚠️ Invalid activities data:', activities);
      return;
    }
    
    activityFeed.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon bg-primary bg-opacity-10 text-primary">
          <i class="bi bi-${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <p class="mb-1">${activity.description}</p>
          <small class="text-muted">${this.formatTime(activity.createdAt)}</small>
        </div>
      </div>
    `).join('');
  }

  updateRecentOrders(orders) {
    console.log('🎨 Updating recent orders with:', orders);
    const ordersTable = document.querySelector('.table tbody');
    
    if (!ordersTable) {
      console.warn('⚠️ Orders table element not found');
      return;
    }
    
    if (!orders || !Array.isArray(orders)) {
      console.warn('⚠️ Invalid orders data:', orders);
      return;
    }

    ordersTable.innerHTML = orders.map(order => `
      <tr>
        <td>${order.orderId || 'N/A'}</td>
        <td>${order.customerId?.name || 'Unknown Customer'}</td>
        <td>$${order.amount || '0.00'}</td>
        <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'Pending'}</span></td>
        <td>${this.formatDate(order.createdAt)}</td>
      </tr>
    `).join('');
  }

  formatPercentage(percentage) {
    const isPositive = percentage >= 0;
    const arrow = isPositive ? 'arrow-up' : 'arrow-down';
    const colorClass = isPositive ? 'percentage-up' : 'percentage-down';
    return `<i class="bi bi-${arrow}"></i> ${Math.abs(percentage)}% from last month`;
  }

  getActivityIcon(type) {
    const icons = {
      user: 'person-plus',
      order: 'bag-check',
      system: 'gear',
      payment: 'currency-dollar',
      delivery: 'truck'
    };
    return icons[type] || 'circle';
  }

  formatTime(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch (e) {
      return 'Recently';
    }
  }

  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  }

  loadSampleData() {
    console.log('📋 Loading sample data...');
    const sampleData = {
      revenue: { current: 54320, percentage: 12.5 },
      orders: { current: 1852, percentage: -2.1 },
      users: { current: 426, percentage: 8.2 },
      shops: { current: 284, percentage: 5.4 },
      shippers: { current: 156, percentage: 3.7 }
    };
    
    this.updateOverviewCards(sampleData);
    
    // Sample activity
    const sampleActivities = [
      { type: "user", description: "New user registered", createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
      { type: "order", description: "Order #1234 completed", createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
      { type: "system", description: "Server maintenance scheduled", createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
      { type: "payment", description: "New payment received", createdAt: new Date(Date.now() - 120 * 60000).toISOString() },
      { type: "delivery", description: "Delivery status updated", createdAt: new Date(Date.now() - 180 * 60000).toISOString() }
    ];
    
    this.updateRecentActivity(sampleActivities);
    
    // Sample orders
    const sampleOrders = [
      { orderId: "#ORD-001", customerId: { name: "John Smith" }, amount: 120.00, status: "completed", createdAt: new Date(2023, 10, 12).toISOString() },
      { orderId: "#ORD-002", customerId: { name: "Jane Doe" }, amount: 85.50, status: "processing", createdAt: new Date(2023, 10, 11).toISOString() },
      { orderId: "#ORD-003", customerId: { name: "Robert Johnson" }, amount: 210.75, status: "pending", createdAt: new Date(2023, 10, 10).toISOString() }
    ];
    
    this.updateRecentOrders(sampleOrders);
  }

  showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'flex';
  }

  hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
  }

  showError(message) {
    console.error('❌ Error:', message);
    alert(`Error: ${message}`);
  }

  showToast(message, type = 'info') {
    // Tạo toast đơn giản
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
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
  }
}

// Initialize dashboard when page loads
function initializeDashboard() {
  console.log('🚀 DOM loaded, initializing dashboard...');

  // Khởi tạo dashboard
  const dashboard = new DashboardManager();
  window.dashboard = dashboard;
  
  // Tải dữ liệu ngay lập tức
  dashboard.loadDashboardData();
  
  // Setup refresh button
  const refreshBtn = document.querySelector('[title="Refresh data"]');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => dashboard.refreshData());
    console.log('🔄 Refresh button setup');
  }
  
  // Setup "Order Approval" button
  const newItemBtn = document.querySelector('.btn-primary');
  if (newItemBtn) {
    newItemBtn.innerHTML = '<i class="bi bi-list-check me-2"></i>Order Approval';
    newItemBtn.addEventListener('click', () => {
      alert('Redirect to Order Approval page');
    });
    console.log('✅ New Item button setup');
  }
  
  console.log('🎉 Dashboard initialization complete');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DashboardManager, initializeDashboard };
}