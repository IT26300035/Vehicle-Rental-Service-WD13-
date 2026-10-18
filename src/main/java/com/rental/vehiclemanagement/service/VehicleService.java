package com.rental.vehiclemanagement.service;
import java.util.List;
import com.rental.vehiclemanagement.dto.VehicleRequest;
import com.rental.vehiclemanagement.dto.VehicleResponse;
import com.rental.vehiclemanagement.entity.Vehicle;
import com.rental.vehiclemanagement.repository.VehicleRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
@Validated
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public VehicleResponse addVehicle(@Valid VehicleRequest request) {

        String registrationNumber = request.registrationNumber()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (vehicleRepository.existsByRegistrationNumber(registrationNumber)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A vehicle with this registration number already exists"
            );
        }

        Vehicle vehicle = new Vehicle();

        vehicle.setRegistrationNumber(registrationNumber);
        vehicle.setBrand(request.brand().trim());
        vehicle.setModel(request.model().trim());
        vehicle.setCategory(request.category().trim());
        vehicle.setDailyRate(request.dailyRate());
        vehicle.setAvailable(request.available());

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        return new VehicleResponse(
                savedVehicle.getId(),
                savedVehicle.getRegistrationNumber(),
                savedVehicle.getBrand(),
                savedVehicle.getModel(),
                savedVehicle.getCategory(),
                savedVehicle.getDailyRate(),
                savedVehicle.isAvailable()
        );

        @Transactional(readOnly = true)
        public List<VehicleResponse> getAllVehicles() {

            return vehicleRepository.findAll()
                    .stream()
                    .map(vehicle -> new VehicleResponse(
                            vehicle.getId(),
                            vehicle.getRegistrationNumber(),
                            vehicle.getBrand(),
                            vehicle.getModel(),
                            vehicle.getCategory(),
                            vehicle.getDailyRate(),
                            vehicle.isAvailable()
                    ))
                    .toList();
        }
    }
}