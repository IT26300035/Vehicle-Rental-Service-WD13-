
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

const tableBody = document.getElementById("vehicleTableBody");
const statusMessage = document.getElementById("statusMessage");
const refreshBtn = document.getElementById("refreshBtn");

const vehicleForm = document.getElementById("vehicleForm");
const vehicleIdInput = document.getElementById("vehicleId");
const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

let vehicles = [];

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

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        let message = `Request failed: ${response.status}`;

        try {
            const error = await response.json();
            message = error.message || message;
        } catch (ignored) {
            // No JSON error response
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
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
}

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

function displayVehicles() {
    tableBody.replaceChildren();

    if (vehicles.length === 0) {
        statusMessage.textContent = "No vehicles found.";
        displayStatistics();
        return;
    }

    statusMessage.textContent = DEMO_MODE
        ? "Demo Mode — Changes are saved in this browser."
        : "";

    vehicles.forEach(vehicle => {
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
            makeButton("Edit", "edit-btn", () => {
                editVehicle(vehicle.id);
            })
        );

        actions.appendChild(
            makeButton("Delete", "delete-btn", () => {
                deleteVehicle(vehicle.id);
            })
        );

        actions.appendChild(
            makeButton(
                vehicle.available ? "Mark Unavailable" : "Mark Available",
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

function getFormData() {
    return {
        registrationNumber: document
            .getElementById("registrationNumber")
            .value.trim().toUpperCase(),

        brand: document.getElementById("brand").value.trim(),

        model: document.getElementById("model").value.trim(),

        category: document.getElementById("category").value,

        dailyRate: Number(
            document.getElementById("dailyRate").value
        ),

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

vehicleForm.addEventListener("submit", async event => {
    event.preventDefault();

    const data = getFormData();
    const editingId = vehicleIdInput.value;
    const isEditing = editingId !== "";

    if (!data.registrationNumber || !data.brand ||
        !data.model || !data.category ||
        !Number.isFinite(data.dailyRate) ||
        data.dailyRate < 0.01 ||
        data.dailyRate > 9999999999.99 ||
        Math.round(data.dailyRate * 100) !==
        data.dailyRate * 100) {

        showMessage("Please enter valid vehicle details.", false);
        return;
    }

    try {
        if (DEMO_MODE) {
            const duplicate = vehicles.some(vehicle =>
                vehicle.registrationNumber ===
                data.registrationNumber &&
                (!isEditing || vehicle.id !== Number(editingId))
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

                vehicles.push({
                    id: nextId,
                    ...data
                });
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

        await loadDashboard();

    } catch (error) {
        showMessage(error.message, false);
    }
});

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

async function deleteVehicle(id) {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
        return;
    }

    try {
        if (DEMO_MODE) {
            vehicles = vehicles.filter(vehicle => vehicle.id !== id);
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

cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", loadDashboard);

loadDashboard();
