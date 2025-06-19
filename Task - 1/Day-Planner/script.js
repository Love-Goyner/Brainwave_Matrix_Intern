document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.querySelector('.close-modal');
    const taskForm = document.getElementById('taskForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const notification = document.getElementById('notification');
    const currentDateEl = document.querySelector('.current-date');
    const currentTimeEl = document.querySelector('.current-time');
    const timeSlotsContainer = document.querySelector('.time-slots');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Initialize the app
    init();
    
    function init() {
        // Set up event listeners
        addTaskBtn.addEventListener('click', openModal);
        closeModal.addEventListener('click', closeModalFunc);
        taskForm.addEventListener('submit', handleTaskSubmit);
        
        // Generate time slots
        generateTimeSlots();
        
        // Update date and time
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // Load tasks
        renderTasks();
    }
    
    function generateTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            
            // Format hour to 12-hour format with AM/PM
            const displayHour = hour % 12 === 0 ? 12 : hour % 12;
            const ampm = hour < 12 ? 'AM' : 'PM';
            timeSlot.textContent = `${displayHour} ${ampm}`;
            
            timeSlotsContainer.appendChild(timeSlot);
        }
    }
    
    function updateDateTime() {
        const now = new Date();
        
        // Format date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString(undefined, options);
        
        // Format time
        currentTimeEl.textContent = now.toLocaleTimeString();
    }
    
    function openModal() {
        taskModal.classList.add('active');
        
        // Set default time to next hour
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        const hours = String(nextHour.getHours()).padStart(2, '0');
        const minutes = String(nextHour.getMinutes()).padStart(2, '0');
        document.getElementById('taskTime').value = `${hours}:${minutes}`;
    }
    
    function closeModalFunc() {
        taskModal.classList.remove('active');
        taskForm.reset();
    }
    
    function handleTaskSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value;
        const time = document.getElementById('taskTime').value;
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;
        const notes = document.getElementById('taskNotes').value;
        
        const newTask = {
            id: Date.now().toString(),
            title,
            time,
            priority,
            category,
            notes,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        closeModalFunc();
        showNotification('Task added successfully!');
    }
    
    function renderTasks() {
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-animation">
                        <div class="circle"></div>
                        <div class="line short"></div>
                        <div class="line medium"></div>
                        <div class="line long"></div>
                    </div>
                    <h3>No tasks yet</h3>
                    <p>Click "Add Task" to get started</p>
                </div>
            `;
            return;
        }
        
        // Clear container
        tasksContainer.innerHTML = '';
        
        // Sort tasks by time
        const sortedTasks = [...tasks].sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });
        
        // Create task cards
        sortedTasks.forEach((task, index) => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-card ${task.priority}`;
            taskEl.style.animationDelay = `${index * 0.1}s`;
            taskEl.dataset.id = task.id;
            
            // Format time to 12-hour format
            const [hours, minutes] = task.time.split(':');
            const displayHours = hours % 12 === 0 ? 12 : hours % 12;
            const ampm = hours < 12 ? 'AM' : 'PM';
            const displayTime = `${displayHours}:${minutes} ${ampm}`;
            
            taskEl.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-time">${displayTime}</div>
                </div>
                ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
                <div class="task-category">${task.category}</div>
                <div class="task-actions">
                    <button class="complete-btn" data-id="${task.id}">
                        <i class="fas fa-check"></i> Complete
                    </button>
                    <button class="delete-btn" data-id="${task.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            tasksContainer.appendChild(taskEl);
            
            // Calculate position based on time
            const [taskHours, taskMinutes] = task.time.split(':').map(Number);
            const position = (taskHours * 60 + taskMinutes) / 2; // 1px per 2 minutes
            
            taskEl.style.top = `${position}px`;
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', completeTask);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
    }
    
    function completeTask(e) {
        const taskId = e.target.closest('button').dataset.id;
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        showNotification('Task completed!', 'success');
    }
    
    function deleteTask(e) {
        const taskId = e.target.closest('button').dataset.id;
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        showNotification('Task deleted!', 'error');
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification show';
        notification.classList.add(type);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.className = 'notification';
            }, 300);
        }, 3000);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModalFunc();
        }
    });
});