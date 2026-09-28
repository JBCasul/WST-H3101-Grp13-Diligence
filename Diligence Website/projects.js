document.addEventListener("DOMContentLoaded", () => {
    const projectsList = document.getElementById("projects-list");
    const emptyProjectsState = document.getElementById("empty-projects-state");

    const addProjectButton = document.getElementById("add-project-button");
    const emptyAddProjectButton = document.getElementById("empty-add-project-button");

    const projectModalOverlay = document.getElementById("project-modal-overlay");
    const closeProjectModalButton = document.getElementById("close-project-modal");
    const cancelProjectButton = document.getElementById("cancel-project-button");

    const projectForm = document.getElementById("project-form");
    const projectModalTitle = document.getElementById("project-modal-title");

    const projectTitleInput = document.getElementById("project-title");
    const projectDescriptionInput = document.getElementById("project-description");
    const projectStatusSelect = document.getElementById("project-status");
    const projectDeadlineInput = document.getElementById("project-deadline");

    const projectTaskInput = document.getElementById("project-task-input");
    const addTaskItemBtn = document.getElementById("add-task-item-btn");
    const projectTasksBuilderList = document.getElementById("project-tasks-builder-list");

    const totalProjectsCount = document.getElementById("total-projects-count");
    const inProgressProjectsCount = document.getElementById("in-progress-projects-count");
    const completedProjectsCount = document.getElementById("completed-projects-count");

    let projects = loadProjects();
    let editingProjectId = null;
    let tempTasksList = [];

    function loadProjects() {
        const projectIdsText = localStorage.getItem("diligence_project_ids") || "";

        if (!projectIdsText) {
            return [];
        }

        const projectIds = projectIdsText.split(",");
        const loadedProjects = [];

        projectIds.forEach((projectId) => {
            if (!projectId) {
                return;
            }

            const title = localStorage.getItem(`diligence_project_${projectId}_title`);

            if (title === null) {
                return;
            }

            const taskCount = parseInt(
                localStorage.getItem(`diligence_project_${projectId}_task_count`) || "0"
            );

            const projectTasks = [];

            for (let i = 0; i < taskCount; i++) {
                const taskName = localStorage.getItem(
                    `diligence_project_${projectId}_task_${i}_name`
                );

                if (taskName === null) {
                    continue;
                }

                projectTasks.push({
                    name: taskName,
                    completed:
                        localStorage.getItem(
                            `diligence_project_${projectId}_task_${i}_completed`
                        ) === "true"
                });
            }

            loadedProjects.push({
                id: projectId,
                title: title,
                description:
                    localStorage.getItem(`diligence_project_${projectId}_description`) || "",
                status:
                    localStorage.getItem(`diligence_project_${projectId}_status`) || "Planned",
                deadline:
                    localStorage.getItem(`diligence_project_${projectId}_deadline`) || "",
                tasks: projectTasks
            });
        });

        return loadedProjects;
    }

    function saveProjects() {
        const projectIds = [];

        projects.forEach((project) => {
            const projectId = project.id.toString();
            projectIds.push(projectId);

            localStorage.setItem(
                `diligence_project_${projectId}_title`,
                project.title
            );

            localStorage.setItem(
                `diligence_project_${projectId}_description`,
                project.description || ""
            );

            localStorage.setItem(
                `diligence_project_${projectId}_status`,
                project.status
            );

            localStorage.setItem(
                `diligence_project_${projectId}_deadline`,
                project.deadline || ""
            );

            const previousTaskCount = parseInt(
                localStorage.getItem(`diligence_project_${projectId}_task_count`) || "0"
            );

            for (let i = 0; i < previousTaskCount; i++) {
                localStorage.removeItem(
                    `diligence_project_${projectId}_task_${i}_name`
                );

                localStorage.removeItem(
                    `diligence_project_${projectId}_task_${i}_completed`
                );
            }

            localStorage.setItem(
                `diligence_project_${projectId}_task_count`,
                project.tasks.length.toString()
            );

            project.tasks.forEach((task, index) => {
                localStorage.setItem(
                    `diligence_project_${projectId}_task_${index}_name`,
                    task.name
                );

                localStorage.setItem(
                    `diligence_project_${projectId}_task_${index}_completed`,
                    task.completed ? "true" : "false"
                );
            });
        });

        localStorage.setItem("diligence_project_ids", projectIds.join(","));
    }

    function deleteProjectStorage(projectId) {
        localStorage.removeItem(`diligence_project_${projectId}_title`);
        localStorage.removeItem(`diligence_project_${projectId}_description`);
        localStorage.removeItem(`diligence_project_${projectId}_status`);
        localStorage.removeItem(`diligence_project_${projectId}_deadline`);

        const taskCount = parseInt(
            localStorage.getItem(`diligence_project_${projectId}_task_count`) || "0"
        );

        for (let i = 0; i < taskCount; i++) {
            localStorage.removeItem(
                `diligence_project_${projectId}_task_${i}_name`
            );

            localStorage.removeItem(
                `diligence_project_${projectId}_task_${i}_completed`
            );
        }

        localStorage.removeItem(`diligence_project_${projectId}_task_count`);
    }

    function renderModalTaskItems() {
        projectTasksBuilderList.innerHTML = "";

        tempTasksList.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = "project-task-builder-item";

            li.innerHTML = `
                <span>${task.name}</span>
                <button type="button" data-index="${index}">
                    <i class="bx bx-trash"></i>
                </button>
            `;

            li.querySelector("button").addEventListener("click", () => {
                tempTasksList.splice(index, 1);
                renderModalTaskItems();
            });

            projectTasksBuilderList.appendChild(li);
        });
    }

    addTaskItemBtn.addEventListener("click", () => {
        const taskText = projectTaskInput.value.trim();

        if (taskText !== "") {
            tempTasksList.push({
                name: taskText,
                completed: false
            });

            projectTaskInput.value = "";
            renderModalTaskItems();
        }
    });

    projectTaskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTaskItemBtn.click();
        }
    });

    function openProjectModal(project = null) {
        projectModalOverlay.classList.add("visible");

        if (project) {
            editingProjectId = project.id;
            projectModalTitle.textContent = "Edit Project";
            projectTitleInput.value = project.title;
            projectDescriptionInput.value = project.description;
            projectStatusSelect.value = project.status;
            projectDeadlineInput.value = project.deadline;
            tempTasksList = project.tasks
                ? project.tasks.map((task) => ({
                    name: task.name,
                    completed: task.completed
                }))
                : [];
        } else {
            editingProjectId = null;
            projectModalTitle.textContent = "Add New Project";
            projectForm.reset();
            tempTasksList = [];
        }

        renderModalTaskItems();

        setTimeout(() => {
            projectTitleInput.focus();
        }, 100);
    }

    function closeProjectModal() {
        projectModalOverlay.classList.remove("visible");
        editingProjectId = null;
        tempTasksList = [];
        projectForm.reset();
        renderModalTaskItems();
    }

    function formatProjectDeadline(deadline) {
        if (!deadline) {
            return "No deadline";
        }

        const deadlineDate = new Date(`${deadline}T00:00:00`);

        return deadlineDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function calculateProgressPercentage(completedTasks, totalTasks) {
        if (!totalTasks || totalTasks <= 0) {
            return 0;
        }

        const calculatedProgress = Math.round((completedTasks / totalTasks) * 100);
        return Math.min(100, Math.max(0, calculatedProgress));
    }

    function getBadgeClassName(status) {
        if (status === "Completed") {
            return "completed";
        }

        if (status === "Planned") {
            return "planned";
        }

        return "in-progress";
    }

    function createProjectCard(project) {
        const projectCard = document.createElement("div");
        projectCard.className = "project-card";

        const tasks = project.tasks || [];
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;

        const progressPercentage = calculateProgressPercentage(
            completedTasks,
            totalTasks
        );

        const badgeClass = getBadgeClassName(project.status);

        let tasksListHTML = "";

        if (tasks.length > 0) {
            tasksListHTML = `
                <div class="project-card-tasks">
                    <div class="project-tasks-header">Action Items</div>
                    <ul class="project-task-items">
                        ${tasks.map((task, tIndex) => `
                            <li class="project-task-item ${task.completed ? 'completed' : ''}">
                                <input 
                                    type="checkbox" 
                                    class="project-task-checkbox" 
                                    data-task-index="${tIndex}" 
                                    ${task.completed ? 'checked' : ''}
                                >
                                <span>${task.name}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        projectCard.innerHTML = `
            <div>
                <div class="project-card-header">
                    <div class="project-card-title-section">
                        <h3 class="project-card-title"></h3>
                        <p class="project-card-description"></p>
                    </div>

                    <span class="project-badge ${badgeClass}">
                        ${project.status}
                    </span>
                </div>

                ${tasksListHTML}

                <div class="project-card-progress">
                    <div class="project-progress-information">
                        <span>Tasks Completed</span>
                        <span>${completedTasks} / ${totalTasks} (${progressPercentage}%)</span>
                    </div>

                    <div class="project-progress-bar">
                        <div
                            class="project-progress-fill"
                            style="width: ${progressPercentage}%"
                        ></div>
                    </div>
                </div>
            </div>

            <div class="project-card-footer">

                <div class="project-deadline">
                    <i class="bx bx-calendar"></i>
                    <span>${formatProjectDeadline(project.deadline)}</span>
                </div>

                <div class="project-card-actions">

                    <button
                        class="project-action-button edit-project-button"
                        type="button"
                        title="Edit project"
                    >
                        <i class="bx bx-edit"></i>
                    </button>

                    <button
                        class="project-action-button delete delete-project-button"
                        type="button"
                        title="Delete project"
                    >
                        <i class="bx bx-trash"></i>
                    </button>

                </div>

            </div>
        `;

        const projectTitle = projectCard.querySelector(".project-card-title");
        const projectDescription = projectCard.querySelector(".project-card-description");

        projectTitle.textContent = project.title;
        projectDescription.textContent =
            project.description || "No description provided.";

        const checkboxes = projectCard.querySelectorAll(".project-task-checkbox");

        checkboxes.forEach(cb => {
            cb.addEventListener("change", (e) => {
                const taskIndex = parseInt(e.target.dataset.taskIndex);

                project.tasks[taskIndex].completed = e.target.checked;

                saveProjects();
                renderProjects();
            });
        });

        const editProjectButton =
            projectCard.querySelector(".edit-project-button");

        const deleteProjectButton =
            projectCard.querySelector(".delete-project-button");

        editProjectButton.addEventListener("click", () => {
            openProjectModal(project);
        });

        deleteProjectButton.addEventListener("click", () => {
            deleteProject(project.id);
        });

        return projectCard;
    }

    function renderProjects() {
        projectsList.innerHTML = "";

        if (projects.length === 0) {
            emptyProjectsState.classList.add("visible");
        } else {
            emptyProjectsState.classList.remove("visible");

            projects.forEach((project) => {
                const projectCard = createProjectCard(project);
                projectsList.appendChild(projectCard);
            });
        }

        updateProjectStatistics();
    }

    function updateProjectStatistics() {
        const totalProjects = projects.length;

        const completedProjects = projects.filter((project) => {
            return project.status === "Completed";
        }).length;

        const inProgressProjects = projects.filter((project) => {
            return project.status === "In Progress";
        }).length;

        totalProjectsCount.textContent = totalProjects;
        inProgressProjectsCount.textContent = inProgressProjects;
        completedProjectsCount.textContent = completedProjects;
    }

    function addProject(projectData) {
        const newProject = {
            id: Date.now().toString(),
            title: projectData.title,
            description: projectData.description,
            status: projectData.status,
            deadline: projectData.deadline,
            tasks: projectData.tasks
        };

        projects.push(newProject);

        saveProjects();
        renderProjects();
    }

    function updateProject(projectData) {
        const projectIndex = projects.findIndex((project) => {
            return project.id.toString() === editingProjectId.toString();
        });

        if (projectIndex === -1) {
            return;
        }

        projects[projectIndex].title = projectData.title;
        projects[projectIndex].description = projectData.description;
        projects[projectIndex].status = projectData.status;
        projects[projectIndex].deadline = projectData.deadline;
        projects[projectIndex].tasks = projectData.tasks;

        saveProjects();
        renderProjects();
    }

    function deleteProject(projectId) {
        const shouldDeleteProject = confirm(
            "Are you sure you want to delete this project?"
        );

        if (!shouldDeleteProject) {
            return;
        }

        projects = projects.filter((project) => {
            return project.id.toString() !== projectId.toString();
        });

        deleteProjectStorage(projectId);
        saveProjects();
        renderProjects();
    }

    projectForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const projectData = {
            title: projectTitleInput.value.trim(),
            description: projectDescriptionInput.value.trim(),
            status: projectStatusSelect.value,
            deadline: projectDeadlineInput.value,
            tasks: tempTasksList.map((task) => ({
                name: task.name,
                completed: task.completed
            }))
        };

        if (!projectData.title || !projectData.deadline) {
            return;
        }

        if (editingProjectId) {
            updateProject(projectData);
        } else {
            addProject(projectData);
        }

        closeProjectModal();
    });

    addProjectButton.addEventListener("click", () => {
        openProjectModal();
    });

    emptyAddProjectButton.addEventListener("click", () => {
        openProjectModal();
    });

    closeProjectModalButton.addEventListener("click", () => {
        closeProjectModal();
    });

    cancelProjectButton.addEventListener("click", () => {
        closeProjectModal();
    });

    renderProjects();
});


