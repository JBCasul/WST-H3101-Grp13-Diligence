document.addEventListener("DOMContentLoaded", () => {
    const notesContainer = document.getElementById("notes-container");

    const viewModal = document.getElementById("view-note-modal");
    const viewBadge = document.getElementById("view-note-badge");
    const viewDate = document.getElementById("view-note-date");
    const viewTitle = document.getElementById("view-note-title");
    const viewContent = document.getElementById("view-note-content");
    const closeViewModalBtn = document.getElementById("close-view-modal-btn");
    const viewToEditBtn = document.getElementById("view-to-edit-btn");

    const editModal = document.getElementById("edit-note-modal");
    const editModalTitle = document.getElementById("edit-modal-title");
    const openCreateModalBtn = document.getElementById("open-create-modal-btn");
    const closeEditModalBtn = document.getElementById("close-edit-modal-btn");
    const cancelEditModalBtn = document.getElementById("cancel-edit-modal-btn");
    const deleteNoteBtn = document.getElementById("delete-note-btn");
    const noteForm = document.getElementById("note-form");

    const noteIdInput = document.getElementById("note-id");
    const noteTitleInput = document.getElementById("note-title-input");
    const noteContentInput = document.getElementById("note-content-input");

    let activeViewingNoteId = null;

    function getNotes() {
        const noteIdsText = localStorage.getItem("diligence_note_ids") || "";

        if (!noteIdsText) {
            return [];
        }

        const noteIds = noteIdsText.split(",");
        const notes = [];

        noteIds.forEach((noteId) => {
            if (!noteId) {
                return;
            }

            const title = localStorage.getItem(`diligence_note_${noteId}_title`);

            if (title === null) {
                return;
            }

            notes.push({
                id: noteId,
                title: title,
                content: localStorage.getItem(`diligence_note_${noteId}_content`) || "",
                tag: localStorage.getItem(`diligence_note_${noteId}_tag`) || "General",
                date: localStorage.getItem(`diligence_note_${noteId}_date`) || ""
            });
        });

        return notes;
    }

    function saveNotes(notes) {
        const noteIds = [];

        notes.forEach((note) => {
            const noteId = note.id.toString();
            noteIds.push(noteId);

            localStorage.setItem(
                `diligence_note_${noteId}_title`,
                note.title
            );

            localStorage.setItem(
                `diligence_note_${noteId}_content`,
                note.content || ""
            );

            localStorage.setItem(
                `diligence_note_${noteId}_tag`,
                note.tag || "General"
            );

            localStorage.setItem(
                `diligence_note_${noteId}_date`,
                note.date || ""
            );
        });

        localStorage.setItem("diligence_note_ids", noteIds.join(","));

        renderNotes();
    }

    function deleteNoteStorage(noteId) {
        localStorage.removeItem(`diligence_note_${noteId}_title`);
        localStorage.removeItem(`diligence_note_${noteId}_content`);
        localStorage.removeItem(`diligence_note_${noteId}_tag`);
        localStorage.removeItem(`diligence_note_${noteId}_date`);
    }

    function renderNotes() {
        const notes = getNotes();

        notesContainer.innerHTML = "";

        if (notes.length === 0) {
            notesContainer.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 2rem 0;">No notes found. Click "Create Note" to add one.</p>`;
            return;
        }

        notes.forEach((note) => {
            const noteCard = document.createElement("div");
            noteCard.className = "note-card";
            noteCard.dataset.id = note.id;

            const tagClass = note.tag || "General";

            noteCard.innerHTML = `
                <div>
                    <div class="note-card-header">
                        <span class="note-category-badge ${tagClass}">${tagClass}</span>
                        <div class="note-card-actions">
                            <button class="icon-btn view-btn" title="View Note"><i class="bx bx-show"></i></button>
                            <button class="icon-btn edit-btn" title="Edit Note"><i class="bx bx-edit-alt"></i></button>
                        </div>
                    </div>
                    <div class="note-card-title">${escapeHtml(note.title)}</div>
                    <div class="note-card-snippet">${escapeHtml(note.content)}</div>
                </div>
                <div class="note-card-footer">
                    <span>${note.date || "Recently"}</span>
                </div>
            `;

            noteCard.querySelector(".view-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                openViewModal(note.id);
            });

            noteCard.querySelector(".edit-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                openEditModal(note.id);
            });

            noteCard.addEventListener("click", () => {
                openViewModal(note.id);
            });

            notesContainer.appendChild(noteCard);
        });
    }

    function openViewModal(id) {
        const notes = getNotes();
        const note = notes.find((n) => n.id.toString() === id.toString());

        if (!note) {
            return;
        }

        activeViewingNoteId = note.id;

        viewTitle.textContent = note.title;
        viewContent.textContent = note.content;
        viewDate.textContent = note.date || "";
        viewBadge.textContent = note.tag || "General";
        viewBadge.className = `note-category-badge ${note.tag || "General"}`;

        viewModal.classList.remove("hidden");
    }

    function closeViewModal() {
        viewModal.classList.add("hidden");
        activeViewingNoteId = null;
    }

    function openEditModal(id = null) {
        if (id) {
            const notes = getNotes();
            const note = notes.find((n) => n.id.toString() === id.toString());

            if (!note) {
                return;
            }

            noteIdInput.value = note.id;
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;

            const tagRadio = noteForm.querySelector(
                `input[name="note-tag"][value="${note.tag}"]`
            );

            if (tagRadio) {
                tagRadio.checked = true;
            }

            editModalTitle.textContent = "Edit Note";
            deleteNoteBtn.classList.remove("hidden");
        } else {
            noteForm.reset();
            noteIdInput.value = "";
            editModalTitle.textContent = "Create Note";
            deleteNoteBtn.classList.add("hidden");
        }

        closeViewModal();
        editModal.classList.remove("hidden");
    }

    function closeEditModal() {
        editModal.classList.add("hidden");
        noteForm.reset();
        noteIdInput.value = "";
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const notes = getNotes();
        const editingId = noteIdInput.value;
        const selectedTag =
            noteForm.querySelector('input[name="note-tag"]:checked')?.value ||
            "General";

        const now = new Date();

        const formattedDate = now.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        if (editingId) {
            const index = notes.findIndex(
                (n) => n.id.toString() === editingId.toString()
            );

            if (index !== -1) {
                notes[index].title = noteTitleInput.value.trim();
                notes[index].content = noteContentInput.value.trim();
                notes[index].tag = selectedTag;
                notes[index].date = formattedDate;
            }
        } else {
            const newNoteId = Date.now().toString();

            const newNote = {
                id: newNoteId,
                title: noteTitleInput.value.trim(),
                content: noteContentInput.value.trim(),
                tag: selectedTag,
                date: formattedDate
            };

            notes.push(newNote);
        }

        saveNotes(notes);
        closeEditModal();
    }

    function deleteNote() {
        const editingId = noteIdInput.value;

        if (!editingId) {
            return;
        }

        const notes = getNotes().filter(
            (n) => n.id.toString() !== editingId.toString()
        );

        deleteNoteStorage(editingId);
        saveNotes(notes);
        closeEditModal();
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    if (openCreateModalBtn) {
        openCreateModalBtn.addEventListener("click", () => openEditModal());
    }

    if (closeViewModalBtn) {
        closeViewModalBtn.addEventListener("click", closeViewModal);
    }

    if (viewToEditBtn) {
        viewToEditBtn.addEventListener("click", () => {
            openEditModal(activeViewingNoteId);
        });
    }

    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener("click", closeEditModal);
    }

    if (cancelEditModalBtn) {
        cancelEditModalBtn.addEventListener("click", closeEditModal);
    }

    if (deleteNoteBtn) {
        deleteNoteBtn.addEventListener("click", deleteNote);
    }

    if (noteForm) {
        noteForm.addEventListener("submit", handleFormSubmit);
    }

    renderNotes();
});

