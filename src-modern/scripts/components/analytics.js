// src-modern/scripts/components/analytics.js
import ApexCharts from 'apexcharts';
import { AnalyticsService } from '../utils/services/analytics.service.js';

/**
 * Analytics Manager - Quản lý trang Analytics
 */
export class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.data = {
            totalRevenue: 0,
            todayRevenue: 0,
            todayOrders: 0,
            todayCustomers: 0,
            growth: 0,
            paymentBreakdown: { cod: 0, momo: 0 },
            recentOrders: [],
            topCategories: []
        };
        
        if (this.isAnalyticsPage()) {
            this.init();
        }
    }

    isAnalyticsPage() {
        return window.location.pathname.includes('analytics');
    }

    async init() {
        console.log('🚀 Analytics Manager Initialized');
        
        try {
            await Promise.all([
                this.loadSummaryData(),
                this.loadRevenueChart()
            ]);
            
            this.renderUI();
            this.setupRefreshButton();
            console.log('✅ Analytics loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
        }
    }

    // ========== LOAD DATA ==========
    async loadSummaryData() {
        try {
            const summary = await AnalyticsService.getSummary();
            this.data = { ...this.data, ...summary };
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    }

    async loadRevenueChart() {
        try {
            const revenueData = await AnalyticsService.getRevenueDailyData(30);
            this.renderRevenueChart(revenueData);
        } catch (error) {
            console.error('Error loading revenue chart:', error);
        }
    }

    // ========== RENDER UI ==========
    renderUI() {
        this.renderSummaryStats();
        this.renderRecentOrders();
        this.renderPaymentBreakdown();
        this.renderTopCategories();
    }

    renderSummaryStats() {
        // Tổng doanh thu
        const totalRevEl = document.querySelector('[x-text="formatCurrency(totalRevenue)"]');
        if (totalRevEl) {
            totalRevEl.textContent = this.formatCurrency(this.data.totalRevenue);
        }

        // Doanh thu hôm nay
        const todayRevElements = document.querySelectorAll('[x-text="formatCurrency(todayRevenue)"]');
        todayRevElements.forEach(el => {
            el.textContent = this.formatCurrency(this.data.todayRevenue);
        });

        // Đơn hàng
        const ordersEl = document.querySelector('[x-text="todayOrders"]');
        if (ordersEl) ordersEl.textContent = this.data.todayOrders;

        // Khách hàng
        const customersEl = document.querySelector('[x-text="todayCustomers"]');
        if (customersEl) customersEl.textContent = this.data.todayCustomers;

        // Tăng trưởng
        this.renderGrowth();
    }

    renderGrowth() {
        const growthElements = document.querySelectorAll('[x-text*="growth"]');
        growthElements.forEach(el => {
            const isPositive = this.data.growth >= 0;
            el.textContent = `${isPositive ? '+' : ''}${this.data.growth}%`;
            el.className = isPositive ? 'small fw-bold text-success' : 'small fw-bold text-danger';
        });

        // Icon
        const iconElements = document.querySelectorAll('i[class*="bi-caret"]');
        iconElements.forEach(icon => {
            icon.className = this.data.growth >= 0 ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill';
        });
    }

    renderRevenueChart(data) {
        const chartEl = document.getElementById('revenueChart');
        if (!chartEl) return;

        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        const options = {
            series: [{
                name: 'Doanh thu',
                data: data.map(d => d.revenue)
            }],
            chart: {
                type: 'area',
                height: 350,
                toolbar: { show: false },
                zoom: { enabled: false }
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            colors: ['#007bff'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.1
                }
            },
            xaxis: {
                categories: data.map(d => new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })),
                labels: {
                    rotate: -45,
                    style: { fontSize: '11px' }
                }
            },
            yaxis: {
                labels: {
                    formatter: (val) => `${(val / 1000000).toFixed(1)}M`
                }
            },
            tooltip: {
                y: {
                    formatter: (val) => this.formatCurrency(val)
                }
            }
        };

        this.charts.revenue = new ApexCharts(chartEl, options);
        this.charts.revenue.render();
    }

    renderRecentOrders() {
        const container = document.querySelector('template[x-for="order in recentOrders"]');
        if (!container || !container.parentElement) return;

        const tbody = container.parentElement;
        tbody.innerHTML = '';

        this.data.recentOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4">
                    <span class="fw-bold font-monospace text-primary">#${order._id.slice(-6).toUpperCase()}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle sm bg-soft-primary text-primary me-2">
                            <span>${(order.user?.name || 'K').charAt(0).toUpperCase()}</span>
                        </div>
                        <span class="fw-medium">${order.user?.name || 'Khách lẻ'}</span>
                    </div>
                </td>
                <td class="text-muted">${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                    <span class="badge bg-light text-dark border">
                        <i class="bi bi-box-seam me-1"></i>${order.items.length} món
                    </span>
                </td>
                <td class="fw-bold">${this.formatCurrency(order.total)}</td>
                <td class="pe-4 text-end">
                    <span class="badge rounded-pill ${this.getStatusBadge(order.status)}">
                        ${this.getStatusText(order.status)}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderPaymentBreakdown() {
        const { cod, momo } = this.data.paymentBreakdown;
        const total = cod + momo;

        // COD
        const codAmountEl = document.querySelector('[x-text="formatCurrency(paymentBreakdown.cod)"]');
        if (codAmountEl) codAmountEl.textContent = this.formatCurrency(cod);

        const codPercentEl = document.querySelector('[x-text*="paymentBreakdown.cod/totalRevenue"]');
        if (codPercentEl) {
            const percent = total > 0 ? ((cod / total) * 100).toFixed(1) : 0;
            codPercentEl.textContent = `${percent}% tổng DT`;
        }

        const codProgressEl = document.querySelector('[\\:style*="paymentBreakdown.cod"]');
        if (codProgressEl) {
            const percent = total > 0 ? ((cod / total) * 100) : 0;
            codProgressEl.style.width = `${percent}%`;
        }

        // MoMo
        const momoAmountEl = document.querySelector('[x-text="formatCurrency(paymentBreakdown.momo)"]');
        if (momoAmountEl) momoAmountEl.textContent = this.formatCurrency(momo);

        const momoPercentEl = document.querySelector('[x-text*="paymentBreakdown.momo/totalRevenue"]');
        if (momoPercentEl) {
            const percent = total > 0 ? ((momo / total) * 100).toFixed(1) : 0;
            momoPercentEl.textContent = `${percent}% tổng DT`;
        }

        const momoProgressEl = document.querySelector('[\\:style*="paymentBreakdown.momo"]');
        if (momoProgressEl) {
            const percent = total > 0 ? ((momo / total) * 100) : 0;
            momoProgressEl.style.width = `${percent}%`;
        }
    }

    renderTopCategories() {
        const container = document.querySelector('template[x-for="cat in topCategories"]');
        if (!container || !container.parentElement) return;

        const listGroup = container.parentElement;
        listGroup.innerHTML = '';

        this.data.topCategories.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'list-group-item d-flex justify-content-between align-items-center p-3 border-bottom-0';
            div.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="avatar-circle bg-light text-secondary me-3">
                        <i class="bi bi-tag-fill"></i>
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${cat._id}</div>
                        <small class="text-muted">Danh mục sản phẩm</small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="h6 fw-bold mb-0">${this.formatCurrency(cat.revenue)}</div>
                    <small class="text-success fw-medium">${this.formatPercentage((cat.revenue / this.data.totalRevenue) * 100)} đóng góp</small>
                </div>
            `;
            listGroup.appendChild(div);
        });
    }

    // ========== UTILITIES ==========
    getStatusBadge(status) {
        const badges = {
            'delivered': 'bg-soft-success text-success',
            'processing': 'bg-soft-warning text-warning',
            'shipping': 'bg-soft-info text-info',
            'arrived': 'bg-soft-primary text-primary',
            'cancelled': 'bg-soft-danger text-danger'
        };
        return badges[status] || 'bg-secondary';
    }

    getStatusText(status) {
        const texts = {
            'delivered': 'Hoàn thành',
            'processing': 'Đang xử lý',
            'shipping': 'Đang giao',
            'arrived': 'Đã đến',
            'cancelled': 'Đã hủy'
        };
        return texts[status] || status;
    }

    formatCurrency(value) {
        if (!value) return '0đ';
        return `${value.toLocaleString('vi-VN')}đ`;
    }

    formatPercentage(value) {
        return `${value.toFixed(1)}%`;
    }

    setupRefreshButton() {
        const btn = document.querySelector('button[\\@click="refreshData"]');
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('🔄 Refreshing analytics...');
                this.init();
            });
        }
    }
}
