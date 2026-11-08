
/* RENTFLOW - DAY 23 */

const DEMO_MODE = true;
const API_URL = "/api/vehicles";
const STORAGE_KEY = "rentflow_demo_vehicles";

const initialVehicles = [
    {
        id: 1,
        registrationNumber: "ABC-1234",
        brand: "Toyota",
        model: "Corolla",
        category: "Sedan",
        dailyRate: 8500,
        available: true
    },
    {
        id: 2,
        registrationNumber: "XYZ-5678",
        brand: "Honda",
        model: "Civic",
        category: "Sedan",
        dailyRate: 7500,
        available: false
    },
    {
        id: 3,
        registrationNumber: "CAR-9090",
        brand: "Nissan",
        model: "X-Trail",
        category: "SUV",
        dailyRate: 12000,
        available: true
    }
];

let vehicles = [];
let currentPage = 1;

// HTML Elements
const tableBody = document.getElementById("vehicleTableBody");
const statusMessage = document.getElementById("statusMessage");
const refreshBtn = document.getElementById("refreshBtn");

const vehicleForm = document.getElementById("vehicleForm");
const vehicleIdInput = document.getElementById("vehicleId");
const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const availabilityFilter = document.getElementById("availabilityFilter");
const sortFilter = document.getElementById("sortFilter");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

const pageSizeInput = document.getElementById("pageSize");
const pageInfo = document.getElementById("pageInfo");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");

// Demo Database
function loadDemoData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
        return JSON.parse(saved);
    }

    const data = structuredClone(initialVehicles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
}

function saveDemoData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

// Backend API Helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        let message = "Request failed: " + response.status;

        try {
            const error = await response.json();
            message = error.message || message;
        } catch (ignored) {
            // Response is not JSON
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function jsonOptions(method, data) {
    return {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
}

// Table Helpers
function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
}

function makeButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = className;
    button.addEventListener("click", onClick);
    return button;
}

// Day 23 - Search, Filter and Sort
function getFilteredVehicles() {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const availability = availabilityFilter.value;
    const sort = sortFilter.value;

    let result = vehicles.filter(vehicle => {

        const searchableText = [
            vehicle.registrationNumber,
            vehicle.brand,
            vehicle.model
        ].join(" ").toLowerCase();

        const matchesSearch =
            searchableText.includes(keyword);

        const matchesCategory =
            category === "" ||
            vehicle.category === category;

        const matchesAvailability =
            availability === "" ||
            String(vehicle.available) === availability;

        return matchesSearch &&
            matchesCategory &&
            matchesAvailability;
    });

    result.sort((a, b) => {
        switch (sort) {
            case "id-desc":
                return b.id - a.id;

            case "brand-asc":
                return a.brand.localeCompare(b.brand);

            case "brand-desc":
                return b.brand.localeCompare(a.brand);

            case "rate-asc":
                return Number(a.dailyRate) -
                    Number(b.dailyRate);

            case "rate-desc":
                return Number(b.dailyRate) -
                    Number(a.dailyRate);

            default:
                return a.id - b.id;
        }
    });

    return result;
}

// Statistics: all vehicles, not only filtered ones
function displayStatistics() {
    const total = vehicles.length;

    const available = vehicles.filter(
        vehicle => vehicle.available
    ).length;

    document.getElementById("totalVehicles").textContent =
        total;

    document.getElementById("availableVehicles").textContent =
        available;

    document.getElementById("unavailableVehicles").textContent =
        total - available;
}

// Day 23 - Render paginated vehicle list
function displayVehicles() {
    tableBody.replaceChildren();

    const filtered = getFilteredVehicles();
    const pageSize = Number(pageSizeInput.value);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / pageSize)
    );

    // Keep current page within valid range
    currentPage = Math.min(
        Math.max(currentPage, 1),
        totalPages
    );

    const startIndex = (currentPage - 1) * pageSize;
    const pageVehicles = filtered.slice(
        startIndex,
        startIndex + pageSize
    );

    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages} ` +
        `(${filtered.length} matching vehicles)`;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    statusMessage.textContent = filtered.length === 0
        ? "No matching vehicles found."
        : DEMO_MODE
            ? "Demo Mode — Changes saved in this browser."
            : "";

    pageVehicles.forEach(vehicle => {
        const row = document.createElement("tr");

        addCell(row, vehicle.id);
        addCell(row, vehicle.registrationNumber);
        addCell(row, `${vehicle.brand} ${vehicle.model}`);
        addCell(row, vehicle.category);

        addCell(
            row,
            "LKR " + Number(vehicle.dailyRate).toFixed(2)
        );

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = vehicle.available
            ? "status available"
            : "status unavailable";

        badge.textContent = vehicle.available
            ? "Available"
            : "Unavailable";

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "action-buttons";

        actions.appendChild(
            makeButton("Edit", "edit-btn", () =>
                editVehicle(vehicle.id))
        );

        actions.appendChild(
            makeButton("Delete", "delete-btn", () =>
                deleteVehicle(vehicle.id))
        );

        actions.appendChild(
            makeButton(
                vehicle.available
                    ? "Mark Unavailable"
                    : "Mark Available",
                "availability-btn",
                () => toggleAvailability(vehicle.id)
            )
        );

        actionCell.appendChild(actions);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });

    displayStatistics();
}

// Load Dashboard
async function loadDashboard() {
    refreshBtn.disabled = true;
    statusMessage.classList.remove("error");

    try {
        if (DEMO_MODE) {
            vehicles = loadDemoData();
        } else {
            vehicles = await apiRequest(API_URL);
        }

        displayVehicles();

    } catch (error) {
        console.error(error);
        statusMessage.textContent = error.message;
        statusMessage.classList.add("error");
    } finally {
        refreshBtn.disabled = false;
    }
}

// Read Add/Edit Form
function getFormData() {
    return {
        registrationNumber:
            document.getElementById("registrationNumber")
                .value.trim().toUpperCase(),

        brand:
            document.getElementById("brand").value.trim(),

        model:
            document.getElementById("model").value.trim(),

        category:
        document.getElementById("category").value,

        dailyRate:
            Number(document.getElementById("dailyRate").value),

        available:
            document.getElementById("available").value === "true"
    };
}

function resetForm() {
    vehicleForm.reset();
    vehicleIdInput.value = "";
    formTitle.textContent = "Add New Vehicle";
    saveBtn.textContent = "Save Vehicle";
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

function showMessage(message, success) {
    formMessage.textContent = message;
    formMessage.className = success
        ? "form-message success"
        : "form-message error";
}

// Day 22 - Add and Update Vehicle
vehicleForm.addEventListener("submit", async event => {
    event.preventDefault();

    const data = getFormData();
    const editingId = vehicleIdInput.value;
    const isEditing = editingId !== "";

    const rateText =
        document.getElementById("dailyRate").value.trim();

    const validRate =
        /^(?:\d{1,10})(?:\.\d{1,2})?$/.test(rateText) &&
        data.dailyRate >= 0.01;

    if (!data.registrationNumber ||
        !data.brand ||
        !data.model ||
        !data.category ||
        !validRate) {

        showMessage("Please enter valid vehicle details.", false);
        return;
    }

    saveBtn.disabled = true;

    try {
        if (DEMO_MODE) {
            const duplicate = vehicles.some(vehicle =>
                vehicle.registrationNumber.toUpperCase() ===
                data.registrationNumber &&
                (!isEditing ||
                    vehicle.id !== Number(editingId))
            );

            if (duplicate) {
                throw new Error(
                    "This registration number already exists."
                );
            }

            if (isEditing) {
                const index = vehicles.findIndex(
                    vehicle => vehicle.id === Number(editingId)
                );

                if (index === -1) {
                    throw new Error("Vehicle not found.");
                }

                vehicles[index] = {
                    ...vehicles[index],
                    ...data
                };
            } else {
                const nextId = vehicles.length > 0
                    ? Math.max(...vehicles.map(v => v.id)) + 1
                    : 1;

                vehicles.push({ id: nextId, ...data });
            }

            saveDemoData();

        } else {
            if (isEditing) {
                await apiRequest(
                    `${API_URL}/${editingId}`,
                    jsonOptions("PUT", data)
                );
            } else {
                await apiRequest(
                    API_URL,
                    jsonOptions("POST", data)
                );
            }
        }

        const message = isEditing
            ? "Vehicle updated successfully!"
            : "Vehicle added successfully!";

        resetForm();
        showMessage(message, true);

        currentPage = 1;
        await loadDashboard();

    } catch (error) {
        showMessage(error.message, false);
    } finally {
        saveBtn.disabled = false;
    }
});

// Edit Vehicle
function editVehicle(id) {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    vehicleIdInput.value = vehicle.id;

    document.getElementById("registrationNumber").value =
        vehicle.registrationNumber;

    document.getElementById("brand").value = vehicle.brand;
    document.getElementById("model").value = vehicle.model;
    document.getElementById("category").value = vehicle.category;
    document.getElementById("dailyRate").value = vehicle.dailyRate;
    document.getElementById("available").value =
        String(vehicle.available);

    formTitle.textContent = "Edit Vehicle";
    saveBtn.textContent = "Update Vehicle";
    formMessage.textContent = "";

    document.getElementById("vehicleFormSection")
        .scrollIntoView({ behavior: "smooth" });
}

// Delete Vehicle
async function deleteVehicle(id) {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
        return;
    }

    try {
        if (DEMO_MODE) {
            vehicles = vehicles.filter(v => v.id !== id);
            saveDemoData();
        } else {
            await apiRequest(`${API_URL}/${id}`, {
                method: "DELETE"
            });
        }

        if (vehicleIdInput.value === String(id)) {
            resetForm();
        }

        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}

// Change Availability
async function toggleAvailability(id) {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    const newStatus = !vehicle.available;

    try {
        if (DEMO_MODE) {
            vehicle.available = newStatus;
            saveDemoData();
        } else {
            await apiRequest(
                `${API_URL}/${id}/availability`,
                jsonOptions("PATCH", {
                    available: newStatus
                })
            );
        }

        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}

// Day 23 - Filter Events
function refreshFilteredList() {
    currentPage = 1;
    displayVehicles();
}

searchInput.addEventListener("input", refreshFilteredList);
categoryFilter.addEventListener("change", refreshFilteredList);
availabilityFilter.addEventListener("change", refreshFilteredList);
sortFilter.addEventListener("change", refreshFilteredList);
pageSizeInput.addEventListener("change", refreshFilteredList);

// Reset Filters
resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    availabilityFilter.value = "";
    sortFilter.value = "id-asc";

    currentPage = 1;
    displayVehicles();
});

// Pagination
prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayVehicles();
    }
});

nextPageBtn.addEventListener("click", () => {
    currentPage++;
    displayVehicles();
});

// Other Events
cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", loadDashboard);

// Start Application
loadDashboard();
