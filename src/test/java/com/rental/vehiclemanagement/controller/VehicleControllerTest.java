
package com.rental.vehiclemanagement.controller;

import com.rental.vehiclemanagement.dto.VehicleResponse;
import com.rental.vehiclemanagement.dto.VehicleStatisticsResponse;
import com.rental.vehiclemanagement.service.VehicleService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    @Mock
    private VehicleService vehicleService;

    private MockMvc mockMvc;

    private VehicleResponse vehicleResponse;

    private String vehicleJson;

    @BeforeEach
    void setUp() {

        VehicleController controller =
                new VehicleController(vehicleService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .build();

        vehicleResponse = new VehicleResponse(
                1L,
                "ABC-1234",
                "Toyota",
                "Corolla",
                "Sedan",
                new BigDecimal("8500.00"),
                true
        );

        vehicleJson = """
                {
                    "registrationNumber": "ABC-1234",
                    "brand": "Toyota",
                    "model": "Corolla",
                    "category": "Sedan",
                    "dailyRate": 8500.00,
                    "available": true
                }
                """;
    }

    // Test 1 - Add Vehicle
    @Test
    void testAddVehicle() throws Exception {

        when(vehicleService.addVehicle(any()))
                .thenReturn(vehicleResponse);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vehicleJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.registrationNumber")
                        .value("ABC-1234"));

        verify(vehicleService).addVehicle(any());
    }

    // Test 2 - Get All Vehicles
    @Test
    void testGetAllVehicles() throws Exception {

        when(vehicleService.getAllVehicles())
                .thenReturn(List.of(vehicleResponse));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].brand").value("Toyota"))
                .andExpect(jsonPath("$[0].model").value("Corolla"));
    }

    // Test 3 - Get Vehicle By ID
    @Test
    void testGetVehicleById() throws Exception {

        when(vehicleService.getVehicleById(1L))
                .thenReturn(vehicleResponse);

        mockMvc.perform(get("/api/vehicles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.brand").value("Toyota"));
    }

    // Test 4 - Update Vehicle
    @Test
    void testUpdateVehicle() throws Exception {

        when(vehicleService.updateVehicle(eq(1L), any()))
                .thenReturn(vehicleResponse);

        mockMvc.perform(put("/api/vehicles/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vehicleJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Toyota"));

        verify(vehicleService).updateVehicle(eq(1L), any());
    }

    // Test 5 - Delete Vehicle
    @Test
    void testDeleteVehicle() throws Exception {

        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isNoContent());

        verify(vehicleService).deleteVehicle(1L);
    }

    // Test 6 - Search Vehicles
    @Test
    void testSearchVehicles() throws Exception {

        when(vehicleService.searchVehicles("Toyota", null, true))
                .thenReturn(List.of(vehicleResponse));

        mockMvc.perform(get("/api/vehicles/search")
                        .param("brand", "Toyota")
                        .param("available", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].brand").value("Toyota"))
                .andExpect(jsonPath("$[0].available").value(true));
    }

    // Test 7 - Pagination and Sorting
    @Test
    void testPagedVehicles() throws Exception {

        Page<VehicleResponse> page = new PageImpl<>(
                List.of(vehicleResponse),
                PageRequest.of(0, 2),
                1
        );

        when(vehicleService.getPagedVehicles(0, 2, "id", "asc"))
                .thenReturn(page);

        mockMvc.perform(get("/api/vehicles/paged")
                        .param("page", "0")
                        .param("size", "2")
                        .param("sortBy", "id")
                        .param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].brand")
                        .value("Toyota"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // Test 8 - Update Availability
    @Test
    void testUpdateAvailability() throws Exception {

        VehicleResponse unavailableVehicle = new VehicleResponse(
                1L,
                "ABC-1234",
                "Toyota",
                "Corolla",
                "Sedan",
                new BigDecimal("8500.00"),
                false
        );

        when(vehicleService.updateVehicleAvailability(eq(1L), any()))
                .thenReturn(unavailableVehicle);

        mockMvc.perform(patch("/api/vehicles/1/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"available\": false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    // Test 9 - Vehicle Statistics
    @Test
    void testVehicleStatistics() throws Exception {

        VehicleStatisticsResponse statistics =
                new VehicleStatisticsResponse(10L, 7L, 3L);

        when(vehicleService.getVehicleStatistics())
                .thenReturn(statistics);

        mockMvc.perform(get("/api/vehicles/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVehicles").value(10))
                .andExpect(jsonPath("$.availableVehicles").value(7))
                .andExpect(jsonPath("$.unavailableVehicles").value(3));
    }
}
