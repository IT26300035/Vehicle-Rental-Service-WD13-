
package com.rental.vehiclemanagement.dto;

import jakarta.validation.constraints.NotNull;

public record VehicleAvailabilityRequest(

        @NotNull(message = "Availability is required")
        Boolean available

) {
}
