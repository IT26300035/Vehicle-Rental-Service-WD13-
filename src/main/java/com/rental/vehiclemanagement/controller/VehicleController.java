
package com.rental.vehiclemanagement.controller;

import com.rental.vehiclemanagement.dto.VehicleRequest;
import com.rental.vehiclemanagement.dto.VehicleResponse;
import com.rental.vehiclemanagement.service.VehicleService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // Day 8 - Add Vehicle
    @PostMapping
    public ResponseEntity<VehicleResponse> addVehicle(
            @Valid @RequestBody VehicleRequest request) {

        VehicleResponse response = vehicleService.addVehicle(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Day 9 - Get All Vehicles
    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {

        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    // Day 10 - Get Vehicle By ID
    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    // Day 11 - Update Vehicle
    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable("id") Long id,
            @Valid @RequestBody VehicleRequest request) {

        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    // Day 12 - Delete Vehicle
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable("id") Long id) {

        vehicleService.deleteVehicle(id);

        return ResponseEntity.noContent().build();
    }

    // Day 14 - Search and Filter Vehicles
    @GetMapping("/search")
    public ResponseEntity<List<VehicleResponse>> searchVehicles(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available) {

        return ResponseEntity.ok(
                vehicleService.searchVehicles(brand, category, available)
        );
    }

    // Day 15 - Pagination and Sorting
    @GetMapping("/paged")
    public ResponseEntity<Page<VehicleResponse>> getPagedVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        return ResponseEntity.ok(
                vehicleService.getPagedVehicles(
                        page, size, sortBy, direction
                )
        );
    }
}
