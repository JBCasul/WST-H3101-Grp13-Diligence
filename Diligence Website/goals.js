document.addEventListener("DOMContentLoaded", () => {
    const goalsList = document.getElementById("goals-list");
    const emptyGoalsState = document.getElementById("empty-goals-state");

    const addGoalButton = document.getElementById("add-goal-button");
    const emptyAddGoalButton = document.getElementById("empty-add-goal-button");

    const goalModalOverlay = document.getElementById("goal-modal-overlay");
    const closeGoalModalButton = document.getElementById("close-goal-modal");
    const cancelGoalButton = document.getElementById("cancel-goal-button");

    const goalForm = document.getElementById("goal-form");
    const goalModalTitle = document.getElementById("goal-modal-title");

    const goalTitleInput = document.getElementById("goal-title");
    const goalDescriptionInput = document.getElementById("goal-description");
    const goalDeadlineInput = document.getElementById("goal-deadline");
    const goalProgressInput = document.getElementById("goal-progress");

    if (goalDeadlineInput) {
    goalDeadlineInput.max = "2999-12-31";
}

    const totalGoalsCount = document.getElementById("total-goals-count");
    const activeGoalsCount = document.getElementById("active-goals-count");
    const completedGoalsCount = document.getElementById("completed-goals-count");

    let goals = loadGoals();
    let editingGoalId = null;

    function loadGoals() {
        const goalIdsText = localStorage.getItem("diligence_goal_ids") || "";

        if (!goalIdsText) {
            return [];
        }

        const goalIds = goalIdsText.split(",");
        const loadedGoals = [];

        goalIds.forEach((goalId) => {
            if (!goalId) {
                return;
            }

            const title = localStorage.getItem(`diligence_goal_${goalId}_title`);

            if (title === null) {
                return;
            }

            loadedGoals.push({
                id: goalId,
                title: title,
                description:
                    localStorage.getItem(`diligence_goal_${goalId}_description`) || "",
                deadline:
                    localStorage.getItem(`diligence_goal_${goalId}_deadline`) || "",
                progress: Number(
                    localStorage.getItem(`diligence_goal_${goalId}_progress`) || "0"
                )
            });
        });

        return loadedGoals;
    }

    function saveGoals() {
        const goalIds = [];

        goals.forEach((goal) => {
            const goalId = goal.id.toString();
            goalIds.push(goalId);

            localStorage.setItem(
                `diligence_goal_${goalId}_title`,
                goal.title
            );

            localStorage.setItem(
                `diligence_goal_${goalId}_description`,
                goal.description || ""
            );

            localStorage.setItem(
                `diligence_goal_${goalId}_deadline`,
                goal.deadline || ""
            );

            localStorage.setItem(
                `diligence_goal_${goalId}_progress`,
                goal.progress.toString()
            );
        });

        localStorage.setItem("diligence_goal_ids", goalIds.join(","));
    }

    function deleteGoalStorage(goalId) {
        localStorage.removeItem(`diligence_goal_${goalId}_title`);
        localStorage.removeItem(`diligence_goal_${goalId}_description`);
        localStorage.removeItem(`diligence_goal_${goalId}_deadline`);
        localStorage.removeItem(`diligence_goal_${goalId}_progress`);
    }

    function openGoalModal(goal = null) {
        goalModalOverlay.classList.add("visible");

        if (goal) {
            editingGoalId = goal.id;

            goalModalTitle.textContent = "Edit Goal";
            goalTitleInput.value = goal.title;
            goalDescriptionInput.value = goal.description;
            goalDeadlineInput.value = goal.deadline;
            goalProgressInput.value = goal.progress;
        } else {
            editingGoalId = null;

            goalModalTitle.textContent = "Add New Goal";
            goalForm.reset();
            goalProgressInput.value = 0;
        }

        setTimeout(() => {
            goalTitleInput.focus();
        }, 100);
    }

    function closeGoalModal() {
        goalModalOverlay.classList.remove("visible");
        editingGoalId = null;
        goalForm.reset();
        goalProgressInput.value = 0;
    }

    function formatGoalDeadline(deadline) {
        if (!deadline) {
            return "No deadline";
        }

        const deadlineDate = new Date(`${deadline}T00:00:00`);

        return deadlineDate.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    }

    function getGoalStatus(goal) {
        return Number(goal.progress) >= 100;
    }

    function createGoalCard(goal) {
        const goalCard = document.createElement("div");
        goalCard.className = "goal-card";

        const isCompleted = getGoalStatus(goal);

        if (isCompleted) {
            goalCard.classList.add("completed");
        }

        const goalStatusText = isCompleted ? "Completed" : "Active";

        goalCard.innerHTML = `
            <div class="goal-card-header">
                <div class="goal-card-title-section">
                    <h3 class="goal-card-title"></h3>
                    <p class="goal-card-description"></p>
                </div>

                <span class="goal-status ${isCompleted ? "completed-status" : ""}">
                    ${goalStatusText}
                </span>
            </div>

            <div class="goal-card-progress">
                <div class="goal-progress-information">
                    <span>Progress</span>
                    <span>${goal.progress}%</span>
                </div>

                <div class="goal-progress-bar">
                    <div
                        class="goal-progress-fill"
                        style="width: ${goal.progress}%"
                    ></div>
                </div>
            </div>

            <div class="goal-card-footer">

                <div class="goal-deadline">
                    <i class="bx bx-calendar"></i>
                    <span>${formatGoalDeadline(goal.deadline)}</span>
                </div>

                <div class="goal-card-actions">

                    <button
                        class="goal-action-button complete-goal-button"
                        type="button"
                        title="${isCompleted ? "Mark as active" : "Mark as complete"}"
                    >
                        <i class="bx ${isCompleted ? "bx-undo" : "bx-check"}"></i>
                    </button>

                    <button
                        class="goal-action-button edit-goal-button"
                        type="button"
                        title="Edit goal"
                    >
                        <i class="bx bx-edit"></i>
                    </button>

                    <button
                        class="goal-action-button delete delete-goal-button"
                        type="button"
                        title="Delete goal"
                    >
                        <i class="bx bx-trash"></i>
                    </button>

                </div>

            </div>
        `;

        const goalTitle = goalCard.querySelector(".goal-card-title");
        const goalDescription = goalCard.querySelector(".goal-card-description");

        goalTitle.textContent = goal.title;
        goalDescription.textContent = goal.description || "No description provided.";

        const completeGoalButton = goalCard.querySelector(
            ".complete-goal-button"
        );

        const editGoalButton = goalCard.querySelector(
            ".edit-goal-button"
        );

        const deleteGoalButton = goalCard.querySelector(
            ".delete-goal-button"
        );

        completeGoalButton.addEventListener("click", () => {
            toggleGoalCompletion(goal.id);
        });

        editGoalButton.addEventListener("click", () => {
            openGoalModal(goal);
        });

        deleteGoalButton.addEventListener("click", () => {
            deleteGoal(goal.id);
        });

        return goalCard;
    }

    function renderGoals() {
        goalsList.innerHTML = "";

        if (goals.length === 0) {
            emptyGoalsState.classList.add("visible");
        } else {
            emptyGoalsState.classList.remove("visible");

            goals.forEach((goal) => {
                const goalCard = createGoalCard(goal);
                goalsList.appendChild(goalCard);
            });
        }

        updateGoalStatistics();
    }

    function updateGoalStatistics() {
        const totalGoals = goals.length;

        const completedGoals = goals.filter((goal) => {
            return getGoalStatus(goal);
        }).length;

        const activeGoals = totalGoals - completedGoals;

        totalGoalsCount.textContent = totalGoals;
        activeGoalsCount.textContent = activeGoals;
        completedGoalsCount.textContent = completedGoals;
    }

    function addGoal(goalData) {
        const newGoal = {
            id: Date.now().toString(),
            title: goalData.title,
            description: goalData.description,
            deadline: goalData.deadline,
            progress: Number(goalData.progress)
        };

        goals.push(newGoal);

        saveGoals();
        renderGoals();
    }

    function updateGoal(goalData) {
        const goalIndex = goals.findIndex((goal) => {
            return goal.id.toString() === editingGoalId.toString();
        });

        if (goalIndex === -1) {
            return;
        }

        goals[goalIndex].title = goalData.title;
        goals[goalIndex].description = goalData.description;
        goals[goalIndex].deadline = goalData.deadline;
        goals[goalIndex].progress = Number(goalData.progress);

        saveGoals();
        renderGoals();
    }

    function toggleGoalCompletion(goalId) {
        const goal = goals.find((item) => {
            return item.id.toString() === goalId.toString();
        });

        if (!goal) {
            return;
        }

        if (getGoalStatus(goal)) {
            goal.progress = 0;
        } else {
            goal.progress = 100;
        }

        saveGoals();
        renderGoals();
    }

    function deleteGoal(goalId) {
        const shouldDeleteGoal = confirm(
            "Are you sure you want to delete this goal?"
        );

        if (!shouldDeleteGoal) {
            return;
        }

        goals = goals.filter((goal) => {
            return goal.id.toString() !== goalId.toString();
        });

        deleteGoalStorage(goalId);
        saveGoals();
        renderGoals();
    }

    goalForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const goalData = {
            title: goalTitleInput.value.trim(),
            description: goalDescriptionInput.value.trim(),
            deadline: goalDeadlineInput.value,
            progress: Math.min(
                100,
                Math.max(0, Number(goalProgressInput.value))
            )
        };

        if (!goalData.title || !goalData.deadline) {
            return;
        }

        if (editingGoalId) {
            updateGoal(goalData);
        } else {
            addGoal(goalData);
        }

        closeGoalModal();
    });

    addGoalButton.addEventListener("click", () => {
        openGoalModal();
    });

    emptyAddGoalButton.addEventListener("click", () => {
        openGoalModal();
    });

    closeGoalModalButton.addEventListener("click", () => {
        closeGoalModal();
    });

    cancelGoalButton.addEventListener("click", () => {
        closeGoalModal();
    });

    goalModalOverlay.addEventListener("click", (event) => {
        if (event.target === goalModalOverlay) {
            closeGoalModal();
        }
    });

    goalProgressInput.addEventListener("input", () => {
        let progressValue = Number(goalProgressInput.value);

        if (progressValue > 100) {
            goalProgressInput.value = 100;
        }

        if (progressValue < 0) {
            goalProgressInput.value = 0;
        }
    });

    renderGoals();
});

