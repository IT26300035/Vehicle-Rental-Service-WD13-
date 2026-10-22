package com.rental.vehiclemanagement.controller;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import com.rental.vehiclemanagement.dto.VehicleRequest;
import com.rental.vehiclemanagement.dto.VehicleResponse;
import com.rental.vehiclemanagement.service.VehicleService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> addVehicle(
            @Valid @RequestBody VehicleRequest request) {

        VehicleResponse response = vehicleService.addVehicle(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

        @GetMapping
        public ResponseEntity<List<VehicleResponse>> getAllVehicles() {

            return ResponseEntity.ok(vehicleService.getAllVehicles());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    import org.springframework.web.bind.annotation.PutMapping;

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable("id") Long id,
            @Valid @RequestBody VehicleRequest request) {

        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }
}