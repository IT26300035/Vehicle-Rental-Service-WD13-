package com.rental.vehiclemanagement.repository;

import com.rental.vehiclemanagement.entity.Vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    boolean existsByRegistrationNumber(String registrationNumber);

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
}