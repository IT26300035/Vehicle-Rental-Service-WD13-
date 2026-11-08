
package com.rental.vehiclemanagement.service;

import com.rental.vehiclemanagement.dto.*;
import com.rental.vehiclemanagement.entity.Vehicle;
import com.rental.vehiclemanagement.exception.VehicleNotFoundException;
import com.rental.vehiclemanagement.repository.VehicleRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle vehicle;

    @BeforeEach
    void setUp() {

        vehicle = new Vehicle();
        vehicle.setRegistrationNumber("ABC-1234");
        vehicle.setBrand("Toyota");
        vehicle.setModel("Corolla");
        vehicle.setCategory("Sedan");
        vehicle.setDailyRate(new BigDecimal("8500.00"));
        vehicle.setAvailable(true);
    }

    // Test 1 - Add Vehicle
    @Test
    void testAddVehicle() {

        VehicleRequest request = new VehicleRequest(
                "ABC-1234", "Toyota", "Corolla",
                "Sedan", new BigDecimal("8500.00"), true
        );

        when(vehicleRepository.save(any(Vehicle.class)))
                .thenReturn(vehicle);

        VehicleResponse response = vehicleService.addVehicle(request);

        assertEquals("Toyota", response.brand());
        assertEquals("ABC-1234", response.registrationNumber());

        verify(vehicleRepository).save(any(Vehicle.class));
    }

    // Test 2 - Duplicate Registration
    @Test
    void testDuplicateRegistration() {

        VehicleRequest request = new VehicleRequest(
                "ABC-1234", "Toyota", "Corolla",
                "Sedan", new BigDecimal("8500.00"), true
        );

        when(vehicleRepository.existsByRegistrationNumber("ABC-1234"))
                .thenReturn(true);

        assertThrows(
                ResponseStatusException.class,
                () -> vehicleService.addVehicle(request)
        );

        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    // Test 3 - Get Vehicle By ID
    @Test
    void testGetVehicleById() {

        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        VehicleResponse response = vehicleService.getVehicleById(1L);

        assertEquals("Toyota", response.brand());
        assertEquals("Corolla", response.model());
    }

    // Test 4 - Vehicle Not Found
    @Test
    void testVehicleNotFound() {

        when(vehicleRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                VehicleNotFoundException.class,
                () -> vehicleService.getVehicleById(99L)
        );
    }

    // Test 5 - Update Vehicle
    @Test
    void testUpdateVehicle() {

        VehicleRequest request = new VehicleRequest(
                "ABC-1234", "Honda", "Civic",
                "Sedan", new BigDecimal("9000.00"), true
        );

        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        when(vehicleRepository.save(any(Vehicle.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        VehicleResponse response = vehicleService.updateVehicle(1L, request);

        assertEquals("Honda", response.brand());
        assertEquals("Civic", response.model());

        verify(vehicleRepository).save(vehicle);
    }

    // Test 6 - Delete Vehicle
    @Test
    void testDeleteVehicle() {

        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        vehicleService.deleteVehicle(1L);

        verify(vehicleRepository).delete(vehicle);
    }

    // Test 7 - Update Availability
    @Test
    void testUpdateAvailability() {

        VehicleAvailabilityRequest request =
                new VehicleAvailabilityRequest(false);

        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        when(vehicleRepository.save(any(Vehicle.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        VehicleResponse response =
                vehicleService.updateVehicleAvailability(1L, request);

        assertFalse(response.available());

        verify(vehicleRepository).save(vehicle);
    }

    // Test 8 - Vehicle Statistics
    @Test
    void testVehicleStatistics() {

        when(vehicleRepository.count()).thenReturn(10L);
        when(vehicleRepository.countByAvailable(true)).thenReturn(7L);
        when(vehicleRepository.countByAvailable(false)).thenReturn(3L);

        VehicleStatisticsResponse response =
                vehicleService.getVehicleStatistics();

        assertEquals(10L, response.totalVehicles());
        assertEquals(7L, response.availableVehicles());
        assertEquals(3L, response.unavailableVehicles());
    }
}
