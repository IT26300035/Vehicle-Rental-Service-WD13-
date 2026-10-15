package com.rental.vehiclemanagement.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record VehicleRequest(

        @NotBlank(message = "Registration number is required")
        @Size(max = 20, message = "Registration number cannot exceed 20 characters")
        String registrationNumber,

        @NotBlank(message = "Brand is required")
        @Size(max = 50, message = "Brand cannot exceed 50 characters")
        String brand,

        @NotBlank(message = "Model is required")
        @Size(max = 50, message = "Model cannot exceed 50 characters")
        String model,

        @NotBlank(message = "Category is required")
        @Size(max = 30, message = "Category cannot exceed 30 characters")
        String category,

        @NotNull(message = "Daily rate is required")
        @DecimalMin(value = "0.01", message = "Daily rate must be at least 0.01")
        @Digits(integer = 10, fraction = 2,
                message = "Daily rate must have at most 10 integer digits and 2 decimal places")
        BigDecimal dailyRate,

        @NotNull(message = "Availability is required")
        Boolean available

) {
}