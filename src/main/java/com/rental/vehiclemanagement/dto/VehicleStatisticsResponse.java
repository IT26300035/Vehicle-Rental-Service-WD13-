package com.rental.vehiclemanagement.dto;

public record VehicleStatisticsResponse(
        long totalVehicles,
        long availableVehicles,
        long unavailableVehicles
) {
}