// src-modern/scripts/utils/services/orders.service.js
import { apiClient } from '../api.client.js';
import { ENDPOINTS } from '../api.js';

export const OrdersService = {
    /**
     * Lấy thống kê tổng quan đơn hàng
     */
    async getStats() {
        return await apiClient.get(ENDPOINTS.ORDERS.STATS);
    },

    /**
     * Lấy xu hướng đơn hàng 7 ngày
     */
    async getTrends() {
        return await apiClient.get(ENDPOINTS.ORDERS.TRENDS);
    },

    /**
     * Lấy phân bố trạng thái đơn hàng
     */
    async getStatusDistribution() {
        return await apiClient.get(ENDPOINTS.ORDERS.STATUS_DISTRIBUTION);
    },

    /**
     * Lấy danh sách đơn hàng với filter
     */
    async getOrdersList(params = {}) {
        return await apiClient.get(ENDPOINTS.ORDERS.LIST, params);
    },

    /**
     * Lấy chi tiết đơn hàng
     */
    async getOrderDetail(orderId) {
        const endpoint = ENDPOINTS.ORDERS.DETAIL.replace(':id', orderId);
        return await apiClient.get(endpoint);
    },

    /**
     * Cập nhật trạng thái đơn hàng
     */
    async updateOrderStatus(orderId, status) {
        const endpoint = ENDPOINTS.ORDERS.UPDATE_STATUS.replace(':id', orderId);
        return await apiClient.put(endpoint, { status });
    },

    /**
     * Cập nhật hàng loạt
     */
    async bulkUpdateStatus(orderIds, status) {
        return await apiClient.post(ENDPOINTS.ORDERS.BULK_UPDATE, { orderIds, status });
    }
};
