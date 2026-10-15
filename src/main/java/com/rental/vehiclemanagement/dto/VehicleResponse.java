package com.rental.vehiclemanagement.dto;

import java.math.BigDecimal;

public record VehicleResponse(
        Long id,
        String registrationNumber,
        String brand,
        String model,
        String category,
        BigDecimal dailyRate,
        boolean available
) {
}