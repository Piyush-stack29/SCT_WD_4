// ==========================
// State
// ==========================
let tasks = [];
let currentFilter = "all";
let editingTaskId = null;

// ==========================
// DOM References
// ==========================
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskDatetime = document.getElementById("task-datetime");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

const totalCountEl = document.getElementById("total-count");
const completedCountEl = document.getElementById("completed-count");
const pendingCountEl = document.getElementById("pending-count");

const filterBtns = document.querySelectorAll(".filter-btn");

const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const editDatetime = document.getElementById("edit-datetime");
const editSaveBtn = document.getElementById("edit-save");
const editCancelBtn = document.getElementById("edit-cancel");

// ==========================
// Local Storage
// ==========================
function saveTasks() {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const stored = localStorage.getItem("todo-tasks");
    tasks = stored ? JSON.parse(stored) : [];
}

// ==========================
// Helpers
// ==========================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date)) return "";
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };
    return date.toLocaleString(undefined, options);
}

// ==========================
// Render
// ==========================
function render() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;
    if (currentFilter === "pending") {
        filteredTasks = tasks.filter((t) => !t.completed);
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter((t) => t.completed);
    }

    emptyState.classList.toggle("hidden", filteredTasks.length !== 0);

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.classList.add("task-item");
        if (task.completed) li.classList.add("completed");
        li.dataset.id = task.id;

        li.innerHTML = `
      <div class="task-checkbox">${task.completed ? "✓" : ""}</div>
      <div class="task-content">
        <div class="task-name"></div>
        ${task.datetime ? `<div class="task-datetime">🕒 <span></span></div>` : ""}
      </div>
      <div class="task-actions">
        ${
          task.completed
            ? `<button class="icon-btn undo-btn" title="Undo">↺</button>`
            : `<button class="icon-btn edit-btn" title="Edit">✏️</button>`
        }
        <button class="icon-btn delete-btn" title="Delete">🗑️</button>
      </div>
    `;

        // Set text content safely (avoids HTML injection from task names)
        li.querySelector(".task-name").textContent = task.name;
        if (task.datetime) {
            li.querySelector(".task-datetime span").textContent = formatDateTime(task.datetime);
        }

        // Checkbox toggle
        li.querySelector(".task-checkbox").addEventListener("click", () => toggleComplete(task.id));

        // Edit button (only present when not completed)
        const editBtn = li.querySelector(".edit-btn");
        if (editBtn) editBtn.addEventListener("click", () => openEditModal(task.id));

        // Undo button (only present when completed)
        const undoBtn = li.querySelector(".undo-btn");
        if (undoBtn) undoBtn.addEventListener("click", () => toggleComplete(task.id));

        // Delete button
        li.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));

        taskList.appendChild(li);
    });

    updateStats();
    saveTasks();
}

// ==========================
// Stats
// ==========================
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;

    totalCountEl.textContent = total;
    completedCountEl.textContent = completed;
    pendingCountEl.textContent = pending;
}

// ==========================
// Task Actions
// ==========================
function addTask(name, datetime) {
    tasks.unshift({
        id: generateId(),
        name: name.trim(),
        datetime: datetime || "",
        completed: false,
        createdAt: new Date().toISOString()
    });
    render();
}

function toggleComplete(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.completed = !task.completed;
        render();
    }
}

function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    render();
}

function editTask(id, newName, newDatetime) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.name = newName.trim();
        task.datetime = newDatetime || "";
        render();
    }
}

// ==========================
// Edit Modal
// ==========================
function openEditModal(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    editingTaskId = id;
    editInput.value = task.name;
    editDatetime.value = task.datetime || "";
    editModal.classList.remove("hidden");
    editInput.focus();
}

function closeEditModal() {
    editModal.classList.add("hidden");
    editingTaskId = null;
}

editSaveBtn.addEventListener("click", () => {
    if (!editInput.value.trim()) {
        taskInput.focus();
        return;
    }
    editTask(editingTaskId, editInput.value, editDatetime.value);
    closeEditModal();
});

editCancelBtn.addEventListener("click", closeEditModal);

editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
});

// ==========================
// Form Submit
// ==========================
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = taskInput.value.trim();
    if (!name) return;

    addTask(name, taskDatetime.value);
    taskForm.reset();
    taskInput.focus();
});

// ==========================
// Filters
// ==========================
filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        render();
    });
});

// ==========================
// Init
// ==========================
loadTasks();
render();