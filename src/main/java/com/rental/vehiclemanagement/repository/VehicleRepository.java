
package com.rental.vehiclemanagement.repository;

import com.rental.vehiclemanagement.entity.Vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // Find vehicle by registration number
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    // Check duplicate registration number
    boolean existsByRegistrationNumber(String registrationNumber);

    // Day 14 - Search and Filter Vehicles
    @Query("""
           SELECT v FROM Vehicle v
           WHERE (:brand IS NULL OR
                  LOWER(v.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
             AND (:category IS NULL OR
                  LOWER(v.category) = LOWER(:category))
             AND (:available IS NULL OR
                  v.available = :available)
           """)
    List<Vehicle> searchVehicles(
            @Param("brand") String brand,
            @Param("category") String category,
            @Param("available") Boolean available
    );

    // Day 17 - Vehicle Statistics
    long countByAvailable(boolean available);
}
