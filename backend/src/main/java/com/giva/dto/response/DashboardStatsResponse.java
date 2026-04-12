package com.giva.dto.response;

public record DashboardStatsResponse(
    long totalRevenue,
    long ordersToday,
    long activeUsers,
    long lowStockProducts
) {
}
