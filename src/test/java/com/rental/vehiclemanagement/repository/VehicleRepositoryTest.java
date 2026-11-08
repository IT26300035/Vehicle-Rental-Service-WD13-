
package com.rental.vehiclemanagement.repository;

import com.rental.vehiclemanagement.entity.Vehicle;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class VehicleRepositoryTest {

    @Autowired
    private VehicleRepository vehicleRepository;

    // Create a sample vehicle for testing
    private Vehicle createVehicle(String registrationNumber) {

        Vehicle vehicle = new Vehicle();

        vehicle.setRegistrationNumber(registrationNumber);
        vehicle.setBrand("Toyota");
        vehicle.setModel("Corolla");
        vehicle.setCategory("Sedan");
        vehicle.setDailyRate(new BigDecimal("8500.00"));
        vehicle.setAvailable(true);

        return vehicle;
    }

    // Test 1 - Save Vehicle
    @Test
    void testSaveVehicle() {

        Vehicle vehicle = createVehicle("ABC-1234");

        Vehicle savedVehicle = vehicleRepository.saveAndFlush(vehicle);

        assertNotNull(savedVehicle.getId());
        assertEquals("Toyota", savedVehicle.getBrand());
    }

    // Test 2 - Find Vehicle by Registration Number
    @Test
    void testFindVehicleByRegistrationNumber() {

        Vehicle vehicle = createVehicle("ABC-5678");
        vehicleRepository.saveAndFlush(vehicle);

        Optional<Vehicle> result =
                vehicleRepository.findByRegistrationNumber("ABC-5678");

        assertTrue(result.isPresent());
        assertEquals("Corolla", result.get().getModel());
    }

    // Test 3 - Count Available Vehicles
    @Test
    void testCountAvailableVehicles() {

        Vehicle vehicle1 = createVehicle("ABC-1111");
        vehicle1.setAvailable(true);

        Vehicle vehicle2 = createVehicle("ABC-2222");
        vehicle2.setAvailable(false);

        vehicleRepository.saveAndFlush(vehicle1);
        vehicleRepository.saveAndFlush(vehicle2);

        long availableCount = vehicleRepository.countByAvailable(true);
        long unavailableCount = vehicleRepository.countByAvailable(false);

        assertEquals(1L, availableCount);
        assertEquals(1L, unavailableCount);
    }

    // Test 4 - Update Vehicle
    @Test
    void testUpdateVehicle() {

        Vehicle vehicle = createVehicle("ABC-3333");

        Vehicle savedVehicle = vehicleRepository.saveAndFlush(vehicle);
        Long vehicleId = savedVehicle.getId();

        savedVehicle.setBrand("Honda");
        vehicleRepository.saveAndFlush(savedVehicle);

        vehicleRepository.flush();
        vehicleRepository.findById(vehicleId)
                .ifPresent(updated -> {
                    assertEquals("Honda", updated.getBrand());
                });

        Vehicle updatedVehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow();

        assertEquals("Honda", updatedVehicle.getBrand());
    }

    // Test 5 - Delete Vehicle
    @Test
    void testDeleteVehicle() {

        Vehicle vehicle = createVehicle("ABC-4444");

        Vehicle savedVehicle = vehicleRepository.saveAndFlush(vehicle);
        Long vehicleId = savedVehicle.getId();

        vehicleRepository.delete(savedVehicle);
        vehicleRepository.flush();

        assertFalse(vehicleRepository.existsById(vehicleId));
    }
}
