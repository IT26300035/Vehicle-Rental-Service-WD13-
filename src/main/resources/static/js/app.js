
/* ==========================================
   RENTFLOW VEHICLE MANAGEMENT SYSTEM
   DAY 24 - COMPLETE FRONTEND JAVASCRIPT
   ========================================== */

// Database connection will be enabled later.
const DEMO_MODE = true;

const API_URL = "/api/vehicles";
const STORAGE_KEY = "rentflow_demo_vehicles";
const NEXT_ID_KEY = "rentflow_demo_next_id";

// Initial Demo Vehicles
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

// Application State
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

/* ==========================================
   DEMO DATA STORAGE
   ========================================== */

function loadDemoData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
        const data = JSON.parse(saved);

        if (!Array.isArray(data)) {
            throw new Error("Invalid demo vehicle data.");
        }

        return data;
    }

    const data = structuredClone(initialVehicles);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return data;
}

function saveDemoData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(vehicles)
    );
}

/* ==========================================
   DAY 24 - UNIQUE ID GENERATION FIX
   ========================================== */

function generateNextId() {
    // Find the highest currently existing ID.
    const maxId = vehicles.reduce(
        (max, vehicle) =>
            Math.max(max, Number(vehicle.id)),
        0
    );

    // Read the last saved ID counter.
    const savedNextId = Number(
        localStorage.getItem(NEXT_ID_KEY)
    );

    // Prevent reusing previously deleted IDs.
    const nextId = Math.max(
        maxId + 1,
        Number.isSafeInteger(savedNextId) && savedNextId > 0
            ? savedNextId
            : 1
    );

    if (!Number.isSafeInteger(nextId)) {
        throw new Error("Vehicle ID limit reached.");
    }

    return nextId;
}

/* ==========================================
   BACKEND API HELPERS
   ========================================== */

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        let message = "Request failed: " + response.status;

        try {
            const error = await response.json();

            message =
                error.message ||
                error.error ||
                message;

        } catch (ignored) {
            // Response does not contain JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();

    return text ? JSON.parse(text) : null;
}

function jsonOptions(method, data) {
    return {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
}

/* ==========================================
   TABLE HELPER FUNCTIONS
   ========================================== */

function addCell(row, value) {
    const cell = document.createElement("td");

    cell.textContent = value;

    row.appendChild(cell);

    return cell;
}

function makeButton(label, className, onClick) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = className;

    button.addEventListener("click", onClick);

    return button;
}

/* ==========================================
   DAY 23 - SEARCH AND FILTER
   ========================================== */

function getFilteredVehicles() {
    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    const category = categoryFilter.value;
    const availability = availabilityFilter.value;
    const sort = sortFilter.value;

    const filtered = vehicles.filter(vehicle => {
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

        return (
            matchesSearch &&
            matchesCategory &&
            matchesAvailability
        );
    });

    // Sorting
    filtered.sort((a, b) => {
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

            case "id-asc":
            default:
                return a.id - b.id;
        }
    });

    return filtered;
}

/* ==========================================
   DASHBOARD STATISTICS
   ========================================== */

function displayStatistics() {
    const total = vehicles.length;

    const availableCount = vehicles.filter(
        vehicle => vehicle.available === true
    ).length;

    const unavailableCount = total - availableCount;

    document.getElementById(
        "totalVehicles"
    ).textContent = total;

    document.getElementById(
        "availableVehicles"
    ).textContent = availableCount;

    document.getElementById(
        "unavailableVehicles"
    ).textContent = unavailableCount;
}

/* ==========================================
   DISPLAY VEHICLE TABLE
   ========================================== */

function displayVehicles() {
    tableBody.replaceChildren();

    const filteredVehicles = getFilteredVehicles();

    const pageSize = Number(pageSizeInput.value);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredVehicles.length / pageSize)
    );

    // Keep page number inside valid range.
    currentPage = Math.min(
        Math.max(currentPage, 1),
        totalPages
    );

    const startIndex = (currentPage - 1) * pageSize;

    const pageVehicles = filteredVehicles.slice(
        startIndex,
        startIndex + pageSize
    );

    // Pagination information
    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages} ` +
        `(${filteredVehicles.length} matching vehicles)`;

    prevPageBtn.disabled = currentPage === 1;

    nextPageBtn.disabled =
        currentPage >= totalPages;

    if (filteredVehicles.length === 0) {
        statusMessage.textContent =
            "No matching vehicles found.";

    } else if (DEMO_MODE) {
        statusMessage.textContent =
            "Demo Mode - Changes are saved in this browser.";

    } else {
        statusMessage.textContent = "";
    }

    // Generate table rows
    pageVehicles.forEach(vehicle => {
        const row = document.createElement("tr");

        addCell(row, vehicle.id);

        addCell(
            row,
            vehicle.registrationNumber
        );

        addCell(
            row,
            `${vehicle.brand} ${vehicle.model}`
        );

        addCell(row, vehicle.category);

        addCell(
            row,
            "LKR " +
            Number(vehicle.dailyRate).toFixed(2)
        );

        // Availability Badge
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

        // Action Buttons
        const actionCell = document.createElement("td");

        const actions = document.createElement("div");

        actions.className = "action-buttons";

        // Edit
        actions.appendChild(
            makeButton(
                "Edit",
                "edit-btn",
                () => editVehicle(vehicle.id)
            )
        );

        // Delete
        actions.appendChild(
            makeButton(
                "Delete",
                "delete-btn",
                () => deleteVehicle(vehicle.id)
            )
        );

        // Availability
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

/* ==========================================
   LOAD DASHBOARD
   ========================================== */

async function loadDashboard() {
    refreshBtn.disabled = true;

    statusMessage.classList.remove("error");

    try {
        if (DEMO_MODE) {
            vehicles = loadDemoData();

        } else {
            vehicles = await apiRequest(API_URL);

            if (!Array.isArray(vehicles)) {
                throw new Error(
                    "Invalid vehicle list from backend."
                );
            }
        }

        displayVehicles();

    } catch (error) {
        console.error("Dashboard error:", error);

        statusMessage.textContent = error.message;

        statusMessage.classList.add("error");

    } finally {
        refreshBtn.disabled = false;
    }
}

/* ==========================================
   READ VEHICLE FORM
   ========================================== */

function getFormData() {
    return {
        registrationNumber:
            document.getElementById(
                "registrationNumber"
            ).value.trim().toUpperCase(),

        brand:
            document.getElementById(
                "brand"
            ).value.trim(),

        model:
            document.getElementById(
                "model"
            ).value.trim(),

        category:
        document.getElementById(
            "category"
        ).value,

        dailyRate:
            Number(
                document.getElementById(
                    "dailyRate"
                ).value
            ),

        available:
            document.getElementById(
                "available"
            ).value === "true"
    };
}

/* ==========================================
   FORM RESET
   ========================================== */

function resetForm() {
    vehicleForm.reset();

    vehicleIdInput.value = "";

    formTitle.textContent = "Add New Vehicle";

    saveBtn.textContent = "Save Vehicle";

    formMessage.textContent = "";

    formMessage.className = "form-message";
}

/* ==========================================
   SUCCESS / ERROR MESSAGE
   ========================================== */

function showMessage(message, success) {
    formMessage.textContent = message;

    formMessage.className = success
        ? "form-message success"
        : "form-message error";
}

/* ==========================================
   DAY 22 - ADD / UPDATE VEHICLE
   ========================================== */

vehicleForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const data = getFormData();

        const editingId = vehicleIdInput.value;

        const isEditing = editingId !== "";

        const rateText = document.getElementById(
            "dailyRate"
        ).value.trim();

        // Allow positive rates with up to 2 decimals.
        const validRate =
            /^(?:\d{1,10})(?:\.\d{1,2})?$/.test(rateText) &&
            data.dailyRate >= 0.01 &&
            data.dailyRate <= 9999999999.99;

        if (
            !data.registrationNumber ||
            !data.brand ||
            !data.model ||
            !data.category ||
            !validRate
        ) {
            showMessage(
                "Please enter valid vehicle details.",
                false
            );

            return;
        }

        saveBtn.disabled = true;

        try {
            if (DEMO_MODE) {
                // Duplicate Registration Check
                const duplicate = vehicles.some(vehicle =>
                    vehicle.registrationNumber
                        .toUpperCase() ===
                    data.registrationNumber &&

                    (
                        !isEditing ||
                        vehicle.id !== Number(editingId)
                    )
                );

                if (duplicate) {
                    throw new Error(
                        "This registration number already exists."
                    );
                }

                if (isEditing) {
                    // UPDATE VEHICLE
                    const index = vehicles.findIndex(
                        vehicle =>
                            vehicle.id === Number(editingId)
                    );

                    if (index === -1) {
                        throw new Error(
                            "Vehicle not found."
                        );
                    }

                    vehicles[index] = {
                        ...vehicles[index],
                        ...data
                    };

                } else {
                    // ADD VEHICLE - DAY 24 ID FIX
                    const nextId = generateNextId();

                    vehicles.push({
                        id: nextId,
                        ...data
                    });

                    saveDemoData();

                    localStorage.setItem(
                        NEXT_ID_KEY,
                        String(nextId + 1)
                    );
                }

                saveDemoData();

            } else {
                // REAL BACKEND
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
    }
);

/* ==========================================
   EDIT VEHICLE
   ========================================== */

function editVehicle(id) {
    const vehicle = vehicles.find(
        vehicle => vehicle.id === id
    );

    if (!vehicle) {
        alert("Vehicle not found.");
        return;
    }

    vehicleIdInput.value = vehicle.id;

    document.getElementById(
        "registrationNumber"
    ).value = vehicle.registrationNumber;

    document.getElementById(
        "brand"
    ).value = vehicle.brand;

    document.getElementById(
        "model"
    ).value = vehicle.model;

    document.getElementById(
        "category"
    ).value = vehicle.category;

    document.getElementById(
        "dailyRate"
    ).value = vehicle.dailyRate;

    document.getElementById(
        "available"
    ).value = String(vehicle.available);

    formTitle.textContent = "Edit Vehicle";

    saveBtn.textContent = "Update Vehicle";

    formMessage.textContent = "";

    document.getElementById(
        "vehicleFormSection"
    ).scrollIntoView({
        behavior: "smooth"
    });
}

/* ==========================================
   DELETE VEHICLE
   ========================================== */

async function deleteVehicle(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this vehicle?"
    );

    if (!confirmed) {
        return;
    }

    try {
        if (DEMO_MODE) {
            vehicles = vehicles.filter(
                vehicle => vehicle.id !== id
            );

            saveDemoData();

        } else {
            await apiRequest(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );
        }

        if (vehicleIdInput.value === String(id)) {
            resetForm();
        }

        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}

/* ==========================================
   CHANGE VEHICLE AVAILABILITY
   ========================================== */

async function toggleAvailability(id) {
    const vehicle = vehicles.find(
        vehicle => vehicle.id === id
    );

    if (!vehicle) {
        return;
    }

    const newStatus = !vehicle.available;

    try {
        if (DEMO_MODE) {
            vehicle.available = newStatus;

            saveDemoData();

        } else {
            await apiRequest(
                `${API_URL}/${id}/availability`,
                jsonOptions(
                    "PATCH",
                    { available: newStatus }
                )
            );
        }

        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}

/* ==========================================
   DAY 23 - FILTER EVENTS
   ========================================== */

function refreshFilteredList() {
    currentPage = 1;

    displayVehicles();
}

searchInput.addEventListener(
    "input",
    refreshFilteredList
);

categoryFilter.addEventListener(
    "change",
    refreshFilteredList
);

availabilityFilter.addEventListener(
    "change",
    refreshFilteredList
);

sortFilter.addEventListener(
    "change",
    refreshFilteredList
);

pageSizeInput.addEventListener(
    "change",
    refreshFilteredList
);

/* ==========================================
   RESET FILTERS
   ========================================== */

resetFiltersBtn.addEventListener(
    "click",
    () => {
        searchInput.value = "";

        categoryFilter.value = "";

        availabilityFilter.value = "";

        sortFilter.value = "id-asc";

        currentPage = 1;

        displayVehicles();
    }
);

/* ==========================================
   PAGINATION EVENTS
   ========================================== */

prevPageBtn.addEventListener(
    "click",
    () => {
        if (currentPage > 1) {
            currentPage--;

            displayVehicles();
        }
    }
);

nextPageBtn.addEventListener(
    "click",
    () => {
        const pageSize = Number(pageSizeInput.value);

        const totalPages = Math.max(
            1,
            Math.ceil(
                getFilteredVehicles().length / pageSize
            )
        );

        if (currentPage < totalPages) {
            currentPage++;

            displayVehicles();
        }
    }
);

/* ==========================================
   OTHER BUTTON EVENTS
   ========================================== */

cancelBtn.addEventListener(
    "click",
    resetForm
);

refreshBtn.addEventListener(
    "click",
    loadDashboard
);

/* ==========================================
   START APPLICATION
   ========================================== */

loadDashboard();
