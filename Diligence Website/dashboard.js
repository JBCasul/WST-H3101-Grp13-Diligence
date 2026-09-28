document.addEventListener("DOMContentLoaded", () => {
    function getTodayDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function normalizeDate(value) {
        if (!value) {
            return "";
        }

        const dateValue = String(value).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }

        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
            const parts = dateValue.split("/");
            const month = String(parts[0]).padStart(2, "0");
            const day = String(parts[1]).padStart(2, "0");

            return `${parts[2]}-${month}-${day}`;
        }

        const parsedDate = new Date(dateValue);

        if (isNaN(parsedDate.getTime())) {
            return "";
        }

        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function loadTasks() {
        const taskIdsText =
            localStorage.getItem("diligence_task_ids") || "";

        if (!taskIdsText) {
            return [];
        }

        const taskIds = taskIdsText.split(",").filter(id => id);
        const loadedTasks = [];

        taskIds.forEach(taskId => {
            const taskName =
                localStorage.getItem(
                    `diligence_task_${taskId}_name`
                );

            if (taskName === null) {
                return;
            }

            loadedTasks.push({
                id: taskId,
                name: taskName,
                section:
                    localStorage.getItem(
                        `diligence_task_${taskId}_section`
                    ) || "",
                completed:
                    localStorage.getItem(
                        `diligence_task_${taskId}_completed`
                    ) === "true",
                category:
                    localStorage.getItem(
                        `diligence_task_${taskId}_category`
                    ) || "",
                repeat:
                    localStorage.getItem(
                        `diligence_task_${taskId}_repeat`
                    ) || "none",
                date:
                    localStorage.getItem(
                        `diligence_task_${taskId}_date`
                    ) || "",
                time:
                    localStorage.getItem(
                        `diligence_task_${taskId}_time`
                    ) || ""
            });
        });

        return loadedTasks;
    }

    function loadProjects() {
        const projectIdsText =
            localStorage.getItem("diligence_project_ids") || "";

        if (!projectIdsText) {
            return [];
        }

        const projectIds =
            projectIdsText.split(",").filter(id => id);

        const loadedProjects = [];

        projectIds.forEach(projectId => {
            const title =
                localStorage.getItem(
                    `diligence_project_${projectId}_title`
                );

            if (title === null) {
                return;
            }

            const taskCount =
                Number(
                    localStorage.getItem(
                        `diligence_project_${projectId}_task_count`
                    )
                ) || 0;

            const projectTasks = [];

            for (let index = 0; index < taskCount; index++) {
                const taskName =
                    localStorage.getItem(
                        `diligence_project_${projectId}_task_${index}_name`
                    );

                if (taskName === null) {
                    continue;
                }

                projectTasks.push({
                    name: taskName,
                    completed:
                        localStorage.getItem(
                            `diligence_project_${projectId}_task_${index}_completed`
                        ) === "true"
                });
            }

            loadedProjects.push({
                id: projectId,
                title: title,
                status:
                    localStorage.getItem(
                        `diligence_project_${projectId}_status`
                    ) || "Planned",
                deadline:
                    localStorage.getItem(
                        `diligence_project_${projectId}_deadline`
                    ) || "",
                tasks: projectTasks
            });
        });

        return loadedProjects;
    }

    function loadGoals() {
        const goalList =
            document.getElementById(
                "dashboard-goal-list"
            );

        if (!goalList) {
            return;
        }

        const goalIdsText =
            localStorage.getItem(
                "diligence_goal_ids"
            ) || "";

        const goalIds =
            goalIdsText
                .split(",")
                .filter(id => id);

        goalList.innerHTML = "";

        if (goalIds.length === 0) {
            showEmptyMessage(
                goalList,
                "No goals yet."
            );
            return;
        }

        goalIds
            .slice(0, 3)
            .forEach(goalId => {
                const title =
                    localStorage.getItem(
                        `diligence_goal_${goalId}_title`
                    );

                if (title === null) {
                    return;
                }

                const progress =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            Number(
                                localStorage.getItem(
                                    `diligence_goal_${goalId}_progress`
                                )
                            ) || 0
                        )
                    );

                const goalItem =
                    document.createElement(
                        "div"
                    );

                goalItem.className =
                    "project-item";

                goalItem.innerHTML = `
                    <div class="project-information">
                        <div class="project-name">
                            <i class="bx bxs-flag"></i>
                            <h3>${title}</h3>
                        </div>

                        <span>${progress}%</span>
                    </div>

                    <div class="project-progress">
                        <div
                            class="project-progress-bar"
                            style="width: ${progress}%"
                        ></div>
                    </div>
                `;

                goalList.appendChild(
                    goalItem
                );
            });
    }

    function getTaskSection(task) {
        return String(task.section || "")
            .trim()
            .toLowerCase();
    }

    function isSchedule(task) {
        return getTaskSection(task) === "schedule";
    }

    function isDeadline(task) {
        return getTaskSection(task) === "deadline";
    }

    function isTodayTask(task) {
        return getTaskSection(task) === "today";
    }

    function parseTaskTime(time) {
        if (!time) {
            return null;
        }

        const timeValue = String(time).trim();

        const twentyFourHourMatch =
            timeValue.match(/^(\d{1,2}):(\d{2})$/);

        if (twentyFourHourMatch) {
            return {
                hour: Number(twentyFourHourMatch[1]),
                minute: Number(twentyFourHourMatch[2])
            };
        }

        const twelveHourMatch =
            timeValue.match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
            );

        if (twelveHourMatch) {
            let hour = Number(twelveHourMatch[1]);
            const minute = Number(twelveHourMatch[2]);
            const period =
                twelveHourMatch[3].toUpperCase();

            if (period === "PM" && hour !== 12) {
                hour += 12;
            }

            if (period === "AM" && hour === 12) {
                hour = 0;
            }

            return {
                hour,
                minute
            };
        }

        return null;
    }

    function formatTime(time) {
        const parsedTime = parseTaskTime(time);

        if (!parsedTime) {
            return {
                hour: "--",
                minute: "--",
                period: ""
            };
        }

        let hour = parsedTime.hour;

        const minute =
            String(parsedTime.minute).padStart(2, "0");

        const period =
            hour >= 12 ? "PM" : "AM";

        hour = hour % 12;

        if (hour === 0) {
            hour = 12;
        }

        return {
            hour:
                String(hour).padStart(2, "0"),
            minute: minute,
            period: period
        };
    }

    function getTaskDateTime(task) {
        const date =
            normalizeDate(task.date);

        const time =
            parseTaskTime(task.time);

        if (!date || !time) {
            return null;
        }

        return new Date(
            `${date}T${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}:00`
        );
    }

    function formatCountdown(task) {
        const scheduleTime =
            getTaskDateTime(task);

        if (!scheduleTime) {
            return "Starts soon";
        }

        const currentTime =
            new Date();

        const difference =
            scheduleTime.getTime() -
            currentTime.getTime();

        if (difference <= 0) {
            return "Started";
        }

        const totalMinutes =
            Math.ceil(
                difference / 60000
            );

        const hours =
            Math.floor(
                totalMinutes / 60
            );

        const minutes =
            totalMinutes % 60;

        if (hours >= 1) {
            if (minutes === 0) {
                return hours === 1
                    ? "In 1 hr"
                    : `In ${hours} hrs`;
            }

            return `In less than ${hours + 1} hrs`;
        }

        return minutes === 1
            ? "In 1 min"
            : `In ${minutes} mins`;
    }

    function showEmptyMessage(container, message) {
        container.innerHTML = `
            <div class="dashboard-empty-state">
                <span>${message}</span>
            </div>
        `;
    }

    function getCompletedScheduleKeys() {
        const savedKeys =
            localStorage.getItem(
                "diligence_dashboard_completed_schedules"
            ) || "";

        if (!savedKeys) {
            return [];
        }

        return savedKeys
            .split(",")
            .filter(key => key);
    }

    function saveCompletedScheduleKey(scheduleKey) {
        const completedSchedules =
            getCompletedScheduleKeys();

        if (!completedSchedules.includes(scheduleKey)) {
            completedSchedules.push(scheduleKey);
        }

        localStorage.setItem(
            "diligence_dashboard_completed_schedules",
            completedSchedules.join(",")
        );
    }

    function loadDashboardDate() {
        const dateElement =
            document.getElementById(
                "dashboard-current-date"
            );

        const timeElement =
            document.getElementById(
                "dashboard-current-time"
            );

        if (!dateElement || !timeElement) {
            return;
        }

        function updateDateTime() {
            const currentDate =
                new Date();

            const dateText =
                currentDate.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    }
                );

            const timeText =
                currentDate.toLocaleTimeString(
                    "en-US",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                );

            if (dateElement.childNodes[0]) {
                dateElement.childNodes[0].textContent =
                    `${dateText} `;
            }

            timeElement.textContent =
                timeText;
        }

        updateDateTime();

        if (!dateElement.dataset.timerStarted) {
            setInterval(
                updateDateTime,
                1000
            );

            dateElement.dataset.timerStarted =
                "true";
        }
    }

    function loadTodaySchedule(tasks) {
        const scheduleList =
            document.querySelector(
                ".today-schedule-card .schedule-list"
            );

        if (!scheduleList) {
            return;
        }

        const today =
            getTodayDate();

        const completedSchedules =
            getCompletedScheduleKeys();

        const todaySchedule =
            tasks
                .filter(task => {
                    const scheduleKey =
                        `${task.id}-${today}`;

                    return (
                        isSchedule(task) &&
                        normalizeDate(task.date) === today &&
                        !completedSchedules.includes(
                            scheduleKey
                        )
                    );
                })
                .sort((firstTask, secondTask) => {
                    const firstTime =
                        parseTaskTime(
                            firstTask.time
                        );

                    const secondTime =
                        parseTaskTime(
                            secondTask.time
                        );

                    if (!firstTime && !secondTime) {
                        return 0;
                    }

                    if (!firstTime) {
                        return 1;
                    }

                    if (!secondTime) {
                        return -1;
                    }

                    return (
                        firstTime.hour * 60 +
                        firstTime.minute
                    ) - (
                        secondTime.hour * 60 +
                        secondTime.minute
                    );
                })
                .slice(0, 3);

        scheduleList.innerHTML = "";

        if (todaySchedule.length === 0) {
            showEmptyMessage(
                scheduleList,
                "No schedule for today."
            );
            return;
        }

        todaySchedule.forEach(task => {
            const time =
                formatTime(task.time);

            const scheduleItem =
                document.createElement("div");

            scheduleItem.className =
                "schedule-item";

            scheduleItem.style.display =
                "grid";

            scheduleItem.style.gridTemplateColumns =
                "62px 14px minmax(0, 1fr) auto 20px";

            scheduleItem.style.alignItems =
                "center";

            scheduleItem.innerHTML = `
                <div class="schedule-time">
                    <span>${time.hour}:${time.minute}</span>
                    <small>${time.period}</small>
                </div>

                <div class="schedule-indicator"></div>

                <div class="schedule-information">
                    <h3>${task.name}</h3>
                    <span>${task.category || "Schedule"}</span>
                </div>

                <div class="schedule-countdown">
                    ${formatCountdown(task)}
                </div>

                <label class="schedule-checkbox">
                    <input type="checkbox">
                    <span class="schedule-checkmark"></span>
                </label>
            `;

            const checkbox =
                scheduleItem.querySelector(
                    ".schedule-checkbox input"
                );

            checkbox.addEventListener(
                "change",
                () => {
                    if (!checkbox.checked) {
                        return;
                    }

                    const finished =
                        window.confirm(
                            "Is this schedule finished for today?"
                        );

                    if (finished) {
                        const scheduleKey =
                            `${task.id}-${today}`;

                        saveCompletedScheduleKey(
                            scheduleKey
                        );

                        loadDashboard();
                    } else {
                        checkbox.checked = false;
                    }
                }
            );

            scheduleList.appendChild(
                scheduleItem
            );
        });
    }

    function updateScheduleCountdowns(tasks) {
        const scheduleList =
            document.querySelector(
                ".today-schedule-card .schedule-list"
            );

        if (!scheduleList) {
            return;
        }

        const today =
            getTodayDate();

        const completedSchedules =
            getCompletedScheduleKeys();

        const todaySchedule =
            tasks
                .filter(task => {
                    const scheduleKey =
                        `${task.id}-${today}`;

                    return (
                        isSchedule(task) &&
                        normalizeDate(task.date) === today &&
                        !completedSchedules.includes(
                            scheduleKey
                        )
                    );
                })
                .sort((firstTask, secondTask) => {
                    const firstTime =
                        parseTaskTime(firstTask.time);

                    const secondTime =
                        parseTaskTime(secondTask.time);

                    if (!firstTime && !secondTime) {
                        return 0;
                    }

                    if (!firstTime) {
                        return 1;
                    }

                    if (!secondTime) {
                        return -1;
                    }

                    return (
                        firstTime.hour * 60 +
                        firstTime.minute
                    ) - (
                        secondTime.hour * 60 +
                        secondTime.minute
                    );
                })
                .slice(0, 3);

        const scheduleItems =
            scheduleList.querySelectorAll(
                ".schedule-item"
            );

        scheduleItems.forEach(
            (scheduleItem, index) => {
                const task =
                    todaySchedule[index];

                if (!task) {
                    return;
                }

                const countdown =
                    scheduleItem.querySelector(
                        ".schedule-countdown"
                    );

                if (countdown) {
                    countdown.textContent =
                        formatCountdown(task);
                }
            }
        );
    }

    function loadUpcomingDeadlines(tasks) {
        const deadlineList =
            document.querySelector(
                ".upcoming-deadlines-card .deadline-list"
            );

        if (!deadlineList) {
            return;
        }

        const today =
            getTodayDate();

        const upcomingDeadlines =
            tasks
                .filter(task => {
                    const date =
                        normalizeDate(task.date);

                    return (
                        isDeadline(task) &&
                        date &&
                        date >= today
                    );
                })
                .sort((firstTask, secondTask) => {
                    return (
                        normalizeDate(firstTask.date).localeCompare(
                            normalizeDate(secondTask.date)
                        )
                    );
                })
                .slice(0, 3);

        deadlineList.innerHTML = "";

        if (upcomingDeadlines.length === 0) {
            showEmptyMessage(
                deadlineList,
                "No upcoming deadlines."
            );
            return;
        }

        upcomingDeadlines.forEach(task => {
            const deadlineDate =
                normalizeDate(task.date);

            const dateObject =
                new Date(
                    `${deadlineDate}T00:00:00`
                );

            const todayDate =
                new Date(
                    `${today}T00:00:00`
                );

            const difference =
                Math.ceil(
                    (
                        dateObject.getTime() -
                        todayDate.getTime()
                    ) / 86400000
                );

            let deadlineText =
                "Due today";

            if (difference === 1) {
                deadlineText =
                    "Due tomorrow";
            } else if (difference > 1) {
                deadlineText =
                    `Due in ${difference} days`;
            }

            const deadlineItem =
                document.createElement("div");

            deadlineItem.className =
                "deadline-item";

            deadlineItem.innerHTML = `
                <div class="deadline-information">
                    <h3>${task.name}</h3>
                    <span>${deadlineText}</span>
                </div>

                <div class="deadline-date">
                    <strong>${String(dateObject.getDate()).padStart(2, "0")}</strong>
                    <span>${dateObject.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span>
                </div>
            `;

            deadlineList.appendChild(
                deadlineItem
            );
        });
    }

    function getProjectProgress(project) {
        if (
            !project.tasks ||
            project.tasks.length === 0
        ) {
            return 0;
        }

        const completedTasks =
            project.tasks.filter(
                task => task.completed
            ).length;

        return Math.round(
            (
                completedTasks /
                project.tasks.length
            ) * 100
        );
    }

    function loadActiveProjects(projects) {
        const projectList =
            document.querySelector(
                ".active-projects-card .project-list"
            );

        if (!projectList) {
            return;
        }

        const activeProjects =
            projects
                .filter(
                    project =>
                        project.status ===
                        "In Progress"
                )
                .slice(0, 3);

        projectList.innerHTML = "";

        if (activeProjects.length === 0) {
            showEmptyMessage(
                projectList,
                "No active projects."
            );
            return;
        }

        activeProjects.forEach(project => {
            const progress =
                getProjectProgress(
                    project
                );

            const projectItem =
                document.createElement("div");

            projectItem.className =
                "project-item";

            projectItem.innerHTML = `
                <div class="project-information">
                    <div class="project-name">
                        <i class="bx bx-folder-open"></i>
                        <h3>${project.title}</h3>
                    </div>

                    <span>${progress}%</span>
                </div>

                <div class="project-progress">
                    <div
                        class="project-progress-bar"
                        style="width: ${progress}%"
                    ></div>
                </div>
            `;

            projectList.appendChild(
                projectItem
            );
        });
    }

    function loadTodayTasks(tasks) {
        const taskList =
            document.querySelector(
                ".todays-tasks-card .dashboard-task-list"
            );

        const summary =
            document.getElementById(
                "tasks-completed-summary"
            );

        if (!taskList) {
            return;
        }

        const allTodayTasks =
            tasks.filter(
                task =>
                    isTodayTask(task)
            );

        taskList.innerHTML = "";

        if (allTodayTasks.length === 0) {
            showEmptyMessage(
                taskList,
                "No tasks for today."
            );

            if (summary) {
                summary.textContent =
                    "0 of 0 completed";
            }

            return;
        }

        const todayTasks =
            allTodayTasks.slice(0, 3);

        const completedTasks =
            allTodayTasks.filter(
                task => task.completed
            ).length;

        if (summary) {
            summary.textContent =
                `${completedTasks} of ${allTodayTasks.length} completed`;
        }

        todayTasks.forEach(task => {
            const taskItem =
                document.createElement("label");

            taskItem.className =
                "dashboard-task-item";

            if (task.completed) {
                taskItem.classList.add(
                    "completed"
                );
            }

            taskItem.innerHTML = `
                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                >

                <span class="dashboard-task-checkmark"></span>

                <span class="dashboard-task-name">
                    ${task.name}
                </span>
            `;

            const checkbox =
                taskItem.querySelector(
                    "input"
                );

            checkbox.addEventListener(
                "change",
                () => {
                    task.completed =
                        checkbox.checked;

                    localStorage.setItem(
                        `diligence_task_${task.id}_completed`,
                        checkbox.checked
                            ? "true"
                            : "false"
                    );

                    taskItem.classList.toggle(
                        "completed",
                        checkbox.checked
                    );

                    const updatedCompletedTasks =
                        allTodayTasks.filter(
                            currentTask =>
                                currentTask.completed
                        ).length;

                    if (summary) {
                        summary.textContent =
                            `${updatedCompletedTasks} of ${allTodayTasks.length} completed`;
                    }
                }
            );

            taskList.appendChild(
                taskItem
            );
        });
    }

    function loadStatistics(tasks, projects) {
        const tasksTodayCount =
            document.getElementById(
                "tasks-today-count"
            );

        const upcomingDeadlinesCount =
            document.getElementById(
                "upcoming-deadlines-count"
            );

        const activeProjectsCount =
            document.getElementById(
                "active-projects-count"
            );

        const today =
            getTodayDate();

        const todayScheduleCount =
            tasks.filter(task => {
                return (
                    isSchedule(task) &&
                    normalizeDate(task.date) === today
                );
            }).length;

        const upcomingDeadlineCount =
            tasks.filter(task => {
                const date =
                    normalizeDate(task.date);

                return (
                    isDeadline(task) &&
                    date &&
                    date >= today
                );
            }).length;

        const activeProjectCount =
            projects.filter(
                project =>
                    project.status ===
                    "In Progress"
            ).length;

        if (tasksTodayCount) {
            tasksTodayCount.textContent =
                todayScheduleCount;
        }

        if (upcomingDeadlinesCount) {
            upcomingDeadlinesCount.textContent =
                upcomingDeadlineCount;
        }

        if (activeProjectsCount) {
            activeProjectsCount.textContent =
                activeProjectCount;
        }
    }

    function loadDashboard() {
        const tasks =
            loadTasks();

        const projects =
            loadProjects();

        loadDashboardDate();
        loadStatistics(
            tasks,
            projects
        );
        loadTodaySchedule(
            tasks
        );
        loadUpcomingDeadlines(
            tasks
        );
        loadActiveProjects(
            projects
        );
        loadTodayTasks(
            tasks
        );
        loadGoals();
    }

    loadDashboard();

    setInterval(() => {
        const tasks =
            loadTasks();

        updateScheduleCountdowns(
            tasks
        );
    }, 30000);

    window.addEventListener(
        "storage",
        () => {
            loadDashboard();
        }
    );
});

