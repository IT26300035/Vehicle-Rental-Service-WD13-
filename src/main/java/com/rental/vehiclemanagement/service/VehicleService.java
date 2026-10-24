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
import com.rental.vehiclemanagement.exception.VehicleNotFoundException;
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

        @Transactional(readOnly = true)
        public VehicleResponse getVehicleById(Long id) {

            Vehicle vehicle = vehicleRepository.findById(id)
                    .orElseThrow(() -> new VehicleNotFoundException(id));

            return new VehicleResponse(
                    vehicle.getId(),
                    vehicle.getRegistrationNumber(),
                    vehicle.getBrand(),
                    vehicle.getModel(),
                    vehicle.getCategory(),
                    vehicle.getDailyRate(),
                    vehicle.isAvailable()
            );

            @Transactional
            public VehicleResponse updateVehicle(Long id, @Valid VehicleRequest request) {

                Vehicle vehicle = vehicleRepository.findById(id)
                        .orElseThrow(() -> new VehicleNotFoundException(id));

                String registrationNumber = request.registrationNumber()
                        .trim()
                        .toUpperCase(Locale.ROOT);

                if (!vehicle.getRegistrationNumber().equals(registrationNumber)
                        && vehicleRepository.existsByRegistrationNumber(registrationNumber)) {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "A vehicle with this registration number already exists"
                    );
                }

                vehicle.setRegistrationNumber(registrationNumber);
                vehicle.setBrand(request.brand().trim());
                vehicle.setModel(request.model().trim());
                vehicle.setCategory(request.category().trim());
                vehicle.setDailyRate(request.dailyRate());
                vehicle.setAvailable(request.available());

                Vehicle updatedVehicle = vehicleRepository.save(vehicle);

                return new VehicleResponse(
                        updatedVehicle.getId(),
                        updatedVehicle.getRegistrationNumber(),
                        updatedVehicle.getBrand(),
                        updatedVehicle.getModel(),
                        updatedVehicle.getCategory(),
                        updatedVehicle.getDailyRate(),
                        updatedVehicle.isAvailable()
                );
            }
        }
    }
    @Transactional
    public void deleteVehicle(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException(id));

        vehicleRepository.delete(vehicle);
    }
}