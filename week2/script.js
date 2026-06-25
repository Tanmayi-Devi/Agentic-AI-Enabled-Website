
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const notificationContainer = document.getElementById('notification-container');

let tasks = [];

function showNotification(message, type = 'success') {
    notificationContainer.innerHTML = '';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `notification ${type}`;
    alertDiv.innerText = message;
    
    notificationContainer.appendChild(alertDiv);
  
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function renderTasks() {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="empty-state">No tasks available. Add one above!</li>';
        return;
    }

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';

        li.innerHTML = `
            <span>${task}</span>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="editTask(${index})">Edit</button>
                <button class="task-btn delete-btn" onclick="deleteTask(${index})">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

taskForm.addEventListener('submit', function(event) {
  
    event.preventDefault(); 
    
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        showNotification('Task field cannot be left blank!', 'error');
        return;
    }

    tasks.push(taskText);
 
    taskInput.value = '';

    renderTasks();
    showNotification('Task registered successfully!');
});

window.editTask = function(index) {
    const currentText = tasks[index];
    const updatedText = prompt('Modify your current task content:', currentText);

    if (updatedText === null) return; 
    
    const validationText = updatedText.trim();
    if (validationText === '') {
        showNotification('Update rejected. Task text cannot be empty.', 'error');
        return;
    }
    
    tasks[index] = validationText;
    renderTasks();
    showNotification('Task item updated successfully!');
};

window.deleteTask = function(index) {
    tasks.splice(index, 1);
    renderTasks();
    showNotification('Task entry deleted completely.', 'error');
};