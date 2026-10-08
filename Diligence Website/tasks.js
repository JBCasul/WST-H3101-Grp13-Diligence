document.addEventListener('DOMContentLoaded', () => {
    let tasks = loadTasks();

    const openModalBtn = document.getElementById('open-task-modal-btn');
    const closeModalBtn = document.getElementById('close-task-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-task-modal-btn');
    const taskModal = document.getElementById('task-modal');
    const addTaskForm = document.getElementById('add-task-form');

    const taskSectionSelect = document.getElementById('task-section');
    const scheduleFields = document.getElementById('schedule-fields');
    const deadlineFields = document.getElementById('deadline-fields');

    const scheduledTasksList = document.getElementById('scheduled-tasks-list');
    const upcomingDeadlinesList = document.getElementById('upcoming-deadlines-list');
    const todayTasksList = document.getElementById('today-tasks-list');
    const tasksCompletedSummary = document.getElementById('tasks-completed-summary');

    const scheduleDateInput = document.getElementById('task-date');
    const deadlineDateInput = document.getElementById('task-deadline-date');

    if (scheduleDateInput) {
        scheduleDateInput.max = '2999-12-31';
    }

    if (deadlineDateInput) {
        deadlineDateInput.max = '2999-12-31';
    }

    function loadTasks() {
        const taskIds = localStorage.getItem('diligence_task_ids') || '';

        if (!taskIds) {
            return [];
        }

        const ids = taskIds.split(',');
        const loadedTasks = [];

        ids.forEach(id => {
            if (!id) return;

            const name = localStorage.getItem(`diligence_task_${id}_name`);

            if (name === null) return;

            loadedTasks.push({
                id: id,
                section: localStorage.getItem(`diligence_task_${id}_section`) || '',
                name: name,
                completed: localStorage.getItem(`diligence_task_${id}_completed`) === 'true',
                category: localStorage.getItem(`diligence_task_${id}_category`) || '',
                repeat: localStorage.getItem(`diligence_task_${id}_repeat`) || 'none',
                date: localStorage.getItem(`diligence_task_${id}_date`) || '',
                time: localStorage.getItem(`diligence_task_${id}_time`) || ''
            });
        });

        return loadedTasks;
    }

    function saveTasks() {
        const taskIds = [];

        tasks.forEach(task => {
            taskIds.push(task.id);

            localStorage.setItem(`diligence_task_${task.id}_section`, task.section);
            localStorage.setItem(`diligence_task_${task.id}_name`, task.name);
            localStorage.setItem(`diligence_task_${task.id}_completed`, task.completed ? 'true' : 'false');
            localStorage.setItem(`diligence_task_${task.id}_category`, task.category || '');
            localStorage.setItem(`diligence_task_${task.id}_repeat`, task.repeat || 'none');
            localStorage.setItem(`diligence_task_${task.id}_date`, task.date || '');
            localStorage.setItem(`diligence_task_${task.id}_time`, task.time || '');
        });

        localStorage.setItem('diligence_task_ids', taskIds.join(','));
    }

    function deleteTaskStorage(taskId) {
        localStorage.removeItem(`diligence_task_${taskId}_section`);
        localStorage.removeItem(`diligence_task_${taskId}_name`);
        localStorage.removeItem(`diligence_task_${taskId}_completed`);
        localStorage.removeItem(`diligence_task_${taskId}_category`);
        localStorage.removeItem(`diligence_task_${taskId}_repeat`);
        localStorage.removeItem(`diligence_task_${taskId}_date`);
        localStorage.removeItem(`diligence_task_${taskId}_time`);
    }

    function validateDate(dateValue) {
        if (!dateValue) {
            return true;
        }

        const dateParts = dateValue.split('-');

        if (dateParts.length !== 3) {
            return false;
        }

        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];

        if (!/^\d{4}$/.test(year)) {
            return false;
        }

        const yearNumber = Number(year);
        const monthNumber = Number(month);
        const dayNumber = Number(day);

        if (yearNumber < 1 || yearNumber > 2999) {
            return false;
        }

        if (monthNumber < 1 || monthNumber > 12) {
            return false;
        }

        if (dayNumber < 1 || dayNumber > 31) {
            return false;
        }

        const date = new Date(yearNumber, monthNumber - 1, dayNumber);

        return date.getFullYear() === yearNumber &&
            date.getMonth() === monthNumber - 1 &&
            date.getDate() === dayNumber;
    }

    function openModal(isEdit = false, task = null) {
        if (isEdit && task) {
            document.getElementById('modal-title').textContent = 'Edit Task';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-section').value = task.section;
            document.getElementById('task-name').value = task.name;

            toggleSectionFields(task.section);

            if (task.section === 'schedule') {
                document.getElementById('task-category').value = task.category || '';
                document.getElementById('task-repeat').value = task.repeat || 'none';
                document.getElementById('task-date').value = task.date || '';
                document.getElementById('task-time').value = task.time || '';
            } else if (task.section === 'deadline') {
                document.getElementById('task-deadline-date').value = task.date || '';
            }
        } else {
            document.getElementById('modal-title').textContent = 'Add New Task';
            addTaskForm.reset();
            document.getElementById('task-id').value = '';
            toggleSectionFields('schedule');
        }

        taskModal.classList.remove('hidden');
    }

    function closeModal() {
        taskModal.classList.add('hidden');
        addTaskForm.reset();
    }

    function toggleSectionFields(section) {
        if (section === 'schedule') {
            scheduleFields.classList.remove('hidden');
            deadlineFields.classList.add('hidden');
        } else if (section === 'deadline') {
            scheduleFields.classList.add('hidden');
            deadlineFields.classList.remove('hidden');
        } else {
            scheduleFields.classList.add('hidden');
            deadlineFields.classList.add('hidden');
        }
    }

    function renderTasks() {
        scheduledTasksList.innerHTML = '';
        upcomingDeadlinesList.innerHTML = '';
        todayTasksList.innerHTML = '';

        const scheduleTasks = tasks.filter(t => t.section === 'schedule');
        const deadlineTasks = tasks.filter(t => t.section === 'deadline');
        const todayTasks = tasks.filter(t => t.section === 'today');

        if (scheduleTasks.length === 0) {
            scheduledTasksList.innerHTML = `
                <div class="empty-state">
                    <i class="bx bx-calendar empty-icon"></i>
                    <p class="empty-text">No available scheduled events</p>
                </div>`;
        } else {
            scheduleTasks.forEach(task => {
                scheduledTasksList.appendChild(createTaskElement(task));
            });
        }

        if (deadlineTasks.length === 0) {
            upcomingDeadlinesList.innerHTML = `
                <div class="empty-state">
                    <i class="bx bx-time-five empty-icon"></i>
                    <p class="empty-text">No available deadlines</p>
                </div>`;
        } else {
            deadlineTasks.forEach(task => {
                upcomingDeadlinesList.appendChild(createTaskElement(task));
            });
        }

        if (todayTasks.length === 0) {
            todayTasksList.innerHTML = `
                <div class="empty-state">
                    <i class="bx bx-check-double empty-icon"></i>
                    <p class="empty-text">No available today's tasks</p>
                </div>`;
        } else {
            todayTasks.forEach(task => {
                todayTasksList.appendChild(createTaskElement(task));
            });
        }

        const completedToday = todayTasks.filter(t => t.completed).length;
        tasksCompletedSummary.textContent = `${completedToday} of ${todayTasks.length} completed`;
    }

    function createTaskElement(task) {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;

        let metaText = '';

        if (task.section === 'schedule') {
            const parts = [];

            if (task.category) parts.push(task.category);
            if (task.date) parts.push(task.date);
            if (task.time) parts.push(task.time);
            if (task.repeat && task.repeat !== 'none') parts.push(`Repeats ${task.repeat}`);

            metaText = parts.join(' • ');
        } else if (task.section === 'deadline') {
            metaText = task.date ? `Due: ${task.date}` : '';
        }

        card.innerHTML = `
            <div class="task-info">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-details">
                    <span class="task-title">${escapeHtml(task.name)}</span>
                    ${metaText ? `<span class="task-meta">${escapeHtml(metaText)}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="icon-btn edit-btn" title="Edit"><i class="bx bx-edit-alt"></i></button>
                <button class="icon-btn delete-btn" title="Delete"><i class="bx bx-trash"></i></button>
            </div>
        `;

        const checkbox = card.querySelector('.task-checkbox');

        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const editBtn = card.querySelector('.edit-btn');

        editBtn.addEventListener('click', () => {
            openModal(true, task);
        });

        const deleteBtn = card.querySelector('.delete-btn');

        deleteBtn.addEventListener('click', () => {
            const confirmed = window.confirm(
                `Are you sure you want to delete "${task.name}"?`
            );

            if (!confirmed) {
                return;
            }

            tasks = tasks.filter(t => t.id !== task.id);
            deleteTaskStorage(task.id);
            saveTasks();
            renderTasks();
        });

        return card;
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    openModalBtn.addEventListener('click', () => openModal(false));
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    taskSectionSelect.addEventListener('change', (e) => {
        toggleSectionFields(e.target.value);
    });

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskId = document.getElementById('task-id').value;
        const section = document.getElementById('task-section').value;
        const name = document.getElementById('task-name').value.trim();

        if (!name) return;

        let taskData = {
            id: taskId || Date.now().toString(),
            section: section,
            name: name,
            completed: false,
            category: '',
            repeat: 'none',
            date: '',
            time: ''
        };

        if (section === 'schedule') {
            taskData.category = document.getElementById('task-category').value.trim();
            taskData.repeat = document.getElementById('task-repeat').value;
            taskData.date = document.getElementById('task-date').value;
            taskData.time = document.getElementById('task-time').value;

            if (!validateDate(taskData.date)) {
                alert('Please enter a valid date with a 4-digit year from 0001 to 2999.');
                return;
            }
        } else if (section === 'deadline') {
            taskData.date = document.getElementById('task-deadline-date').value;

            if (!validateDate(taskData.date)) {
                alert('Please enter a valid date with a 4-digit year from 0001 to 2999.');
                return;
            }
        }

        if (taskId) {
            const index = tasks.findIndex(t => t.id === taskId);

            if (index !== -1) {
                taskData.completed = tasks[index].completed;
                tasks[index] = taskData;
            }
        } else {
            tasks.push(taskData);
        }

        saveTasks();
        renderTasks();
        closeModal();
    });

    renderTasks();
});
