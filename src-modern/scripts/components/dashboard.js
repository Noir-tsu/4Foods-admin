// src-modern/scripts/components/dashboard.js

import { Chart } from 'chart.js/auto';
import { DashboardService } from '../utils/services/dashboard.service.js';

export class DashboardManager {
    constructor() {
        this.charts = {};
        
        // Chỉ khởi tạo nếu đang ở trang dashboard
        if (this.isDashboardPage()) {
            this.init();
        }
    }

    /**
     * Kiểm tra xem có phải trang dashboard không
     */
    isDashboardPage() {
        return document.getElementById('revenue-today') !== null;
    }

    /**
     * Khởi tạo Dashboard
     */
    async init() {
        console.log('🚀 Dashboard Manager Initialized');
        
        try {
            // Load tất cả dữ liệu song song để tối ưu tốc độ
            await Promise.all([
                this.loadSummaryStats(),
                this.loadRevenueChart(),
                this.loadRecentActivities(),
                this.loadRecentOrders(),
                this.loadOrderStatusChart(),
                this.loadUserGrowthChart()
            ]);
            
            console.log('✅ Dashboard loaded successfully');
            this.setupRefreshButton();
            
        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
            this.showError('Không thể tải dữ liệu dashboard');
        }
    }

    // ========== HÀNG 1: THỐNG KÊ TỔNG QUAN ==========
    async loadSummaryStats() {
        try {
            const data = await DashboardService.getSummaryStats();
            
            this.updateStatCard('revenue', data.revenue.value, data.revenue.growth, 'đ');
            this.updateStatCard('orders', data.orders.value, data.orders.growth, '');
            this.updateStatCard('users', data.newUsers.value, data.newUsers.growth, '');
            this.updateStatCard('shops', data.newShops.value, data.newShops.growth, '');
            
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    }

    updateStatCard(type, value, growth, suffix) {
        const valueEl = document.getElementById(`${type}-today`);
        const changeEl = document.getElementById(`${type}-change`);
        
        if (valueEl) {
            const formattedValue = value.toLocaleString('vi-VN');
            valueEl.textContent = suffix ? `${formattedValue} ${suffix}` : formattedValue;
        }
        
        if (changeEl) {
            const isPositive = growth >= 0;
            const icon = isPositive ? 'bi-arrow-up' : 'bi-arrow-down';
            const colorClass = isPositive ? 'text-success' : 'text-danger';
            
            changeEl.className = `${colorClass} me-1`;
            changeEl.innerHTML = `<i class="bi ${icon}"></i> ${isPositive ? '+' : ''}${growth}%`;
        }
    }

    // ========== HÀNG 2: BIỂU ĐỒ DOANH THU ==========
    async loadRevenueChart() {
        const ctx = document.getElementById('monthlyRevenueChart');
        if (!ctx) return;

        try {
            const data = await DashboardService.getRevenueChartData();
            
            // Hủy chart cũ nếu có
            if (this.charts.revenue) {
                this.charts.revenue.destroy();
            }

            this.charts.revenue = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.months,
                    datasets: [{
                        label: 'Doanh thu',
                        data: data.values,
                        borderColor: '#4e73df',
                        backgroundColor: 'rgba(78, 115, 223, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#4e73df',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            callbacks: {
                                label: (context) => {
                                    return `Doanh thu: ${context.parsed.y.toLocaleString('vi-VN')}đ`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => `${(value / 1000000).toFixed(1)}M`
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading revenue chart:', error);
        }
    }

    // ========== HÀNG 2: HOẠT ĐỘNG GẦN ĐÂY ==========
    async loadRecentActivities() {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        try {
            const activities = await DashboardService.getRecentActivities(10);
            
            if (activities.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-3"></i>
                        <p class="mb-0 mt-2">Chưa có hoạt động</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = activities.map(activity => `
                <div class="activity-item border-bottom p-3">
                    <div class="d-flex align-items-start">
                        <div class="activity-icon me-3">
                            <i class="bi ${this.getActivityIcon(activity.type)} text-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-1">
                                <strong>${activity.user}</strong> ${activity.action}
                            </p>
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>
                                ${this.formatTime(activity.time)}
                            </small>
                        </div>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading activities:', error);
        }
    }

    getActivityIcon(type) {
        const icons = {
            'order': 'bi-cart-check',
            'user': 'bi-person-plus',
            'shop': 'bi-shop'
        };
        return icons[type] || 'bi-circle-fill';
    }

    formatTime(timeStr) {
        const date = new Date(timeStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return date.toLocaleDateString('vi-VN');
    }

    // ========== HÀNG 3: ĐƠN HÀNG GẦN ĐÂY ==========
    async loadRecentOrders() {
        const tbody = document.getElementById('recent-orders-table');
        if (!tbody) return;

        try {
            const orders = await DashboardService.getRecentOrders(7);
            
            if (orders.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-3"></i>
                            <p class="mb-0 mt-2">Chưa có đơn hàng</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td><strong>#${order.code}</strong></td>
                    <td>${order.customer}</td>
                    <td>${order.total.toLocaleString('vi-VN')}đ</td>
                    <td>
                        <span class="badge ${this.getStatusBadge(order.status)}">
                            ${this.getStatusText(order.status)}
                        </span>
                    </td>
                    <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    getStatusBadge(status) {
        const badges = {
            'processing': 'bg-warning',
            'shipping': 'bg-info',
            'arrived': 'bg-primary',
            'delivered': 'bg-success',
            'cancelled': 'bg-danger',
            'refunded': 'bg-secondary'
        };
        return badges[status] || 'bg-secondary';
    }

    getStatusText(status) {
        const texts = {
            'processing': 'Đang xử lý',
            'shipping': 'Đang giao',
            'arrived': 'Đã đến',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy',
            'refund_pending': 'Chờ hoàn',
            'refunded': 'Đã hoàn'
        };
        return texts[status] || status;
    }

    // ========== HÀNG 3: BIỂU ĐỒ TRẠNG THÁI ==========
    async loadOrderStatusChart() {
        const ctx = document.getElementById('orderStatusChart');
        if (!ctx) return;

        try {
            const data = await DashboardService.getOrderStatusDistribution();
            
            if (this.charts.status) {
                this.charts.status.destroy();
            }

            this.charts.status = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        data: data.values,
                        backgroundColor: [
                            '#4e73df',
                            '#1cc88a',
                            '#36b9cc',
                            '#f6c23e',
                            '#e74a3b',
                            '#858796'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error loading status chart:', error);
        }
    }

    // ========== HÀNG 4: TĂNG TRƯỞNG NGƯỜI DÙNG ==========
    async loadUserGrowthChart() {
        const ctx = document.getElementById('accountGrowthChart');
        if (!ctx) return;

        try {
            const data = await DashboardService.getUserGrowthData();
            
            if (this.charts.userGrowth) {
                this.charts.userGrowth.destroy();
            }

            this.charts.userGrowth = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.days,
                    datasets: [{
                        label: 'Người dùng mới',
                        data: data.values,
                        backgroundColor: '#36b9cc',
                        borderRadius: 4,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error loading user growth chart:', error);
        }
    }

    // ========== UTILITIES ==========
    setupRefreshButton() {
        const refreshBtn = document.querySelector('[title="Refresh data"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 Refreshing dashboard...');
                this.init();
            });
        }
    }

    showError(message) {
        console.error(message);
        // Có thể thêm toast notification ở đây
    }
}
