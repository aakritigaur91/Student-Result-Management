/**
 * Student Result Management - Frontend Script
 * Handles form submission, API calls, and dynamic UI updates
 */

// ============ Configuration ============
const API_BASE = 'http://localhost:5000/api';

// ============ DOM Elements ============
const studentForm = document.getElementById('studentForm');
const studentNameInput = document.getElementById('studentName');
const studentMarksInput = document.getElementById('studentMarks');
const nameError = document.getElementById('nameError');
const marksError = document.getElementById('marksError');
const submitBtn = document.getElementById('submitBtn');
const submitLoader = document.getElementById('submitLoader');
const studentsTableBody = document.getElementById('studentsTableBody');
const emptyState = document.getElementById('emptyState');
const loadingOverlay = document.getElementById('loadingOverlay');
const refreshBtn = document.getElementById('refreshBtn');
const toast = document.getElementById('toast');
const editModal = document.getElementById('editModal');
const closeModalBtn = document.getElementById('closeModal');
const editForm = document.getElementById('editForm');
const editStudentIdInput = document.getElementById('editStudentId');
const editNameInput = document.getElementById('editName');
const editMarksInput = document.getElementById('editMarks');
const editNameError = document.getElementById('editNameError');
const editMarksError = document.getElementById('editMarksError');
const editLoader = document.getElementById('editLoader');

// ============ Utility Functions ============

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

/**
 * Show loading state on submit button
 */
function setSubmitLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.querySelector('.btn-text').classList.toggle('hidden', loading);
  submitLoader.classList.toggle('hidden', !loading);
}

/**
 * Clear form validation errors
 */
function clearFormErrors() {
  nameError.textContent = '';
  marksError.textContent = '';
}

// ============ Validation ============

/**
 * Validate add form input
 * @returns {boolean} - true if valid
 */
function validateAddForm() {
  let isValid = true;
  clearFormErrors();

  const name = studentNameInput.value.trim();
  const marks = studentMarksInput.value;

  if (!name) {
    nameError.textContent = 'Student name is required';
    isValid = false;
  } else if (name.length < 2) {
    nameError.textContent = 'Name must be at least 2 characters';
    isValid = false;
  }

  if (marks === '' || marks === null || marks === undefined) {
    marksError.textContent = 'Marks are required';
    isValid = false;
  } else {
    const marksNum = Number(marks);
    if (isNaN(marksNum)) {
      marksError.textContent = 'Marks must be a valid number';
      isValid = false;
    } else if (marksNum < 0 || marksNum > 100) {
      marksError.textContent = 'Marks must be between 0 and 100';
      isValid = false;
    }
  }

  return isValid;
}

// ============ API Calls ============

/**
 * Fetch all students from backend
 */
async function fetchStudents() {
  loadingOverlay.classList.remove('hidden');
  studentsTableBody.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    const students = await response.json();
    renderStudents(students);
  } catch (err) {
    console.error('Fetch error:', err);
    showToast(err.message || 'Failed to load students. Is the server running?', 'error');
  } finally {
    loadingOverlay.classList.add('hidden');
  }
}

/**
 * Add new student via POST
 * @param {Object} data - { name, marks }
 */
async function addStudent(data) {
  try {
    const response = await fetch(`${API_BASE}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to add student');
    }

    showToast('Student added successfully!', 'success');
    studentForm.reset();
    clearFormErrors();
    fetchStudents(); // Refresh the list
  } catch (err) {
    showToast(err.message || 'Failed to add student', 'error');
  } finally {
    setSubmitLoading(false);
  }
}

/**
 * Update student via PUT
 * @param {string} id - Student ID
 * @param {Object} data - { name?, marks? }
 */
async function updateStudent(id, data) {
  try {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update student');
    }

    showToast('Student updated successfully!', 'success');
    closeEditModal();
    fetchStudents();
  } catch (err) {
    showToast(err.message || 'Failed to update student', 'error');
  } finally {
    editForm.querySelector('.btn-text').classList.remove('hidden');
    editLoader.classList.add('hidden');
  }
}

/**
 * Delete student via DELETE
 * @param {string} id - Student ID
 */
async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  try {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete student');
    }

    showToast('Student deleted successfully!', 'success');
    fetchStudents();
  } catch (err) {
    showToast(err.message || 'Failed to delete student', 'error');
  }
}

// ============ Render Functions ============

/**
 * Get grade badge class
 */
function getGradeClass(grade) {
  const map = { A: 'grade-a', B: 'grade-b', C: 'grade-c' };
  return map[grade] || 'grade-c';
}

/**
 * Render students table
 * @param {Array} students - Array of student objects
 */
function renderStudents(students) {
  if (!students || students.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  studentsTableBody.innerHTML = students.map((student, index) => `
    <tr data-id="${student._id}">
      <td>${index + 1}</td>
      <td class="student-name">${escapeHtml(student.name)}</td>
      <td class="student-marks">${student.marks}</td>
      <td><span class="grade-badge ${getGradeClass(student.grade)}">${student.grade}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-edit edit-btn">Edit</button>
          <button class="btn btn-sm btn-delete delete-btn">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach event listeners to new buttons
  studentsTableBody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      openEditModal(
        row.dataset.id,
        row.querySelector('.student-name').textContent,
        Number(row.querySelector('.student-marks').textContent)
      );
    });
  });
  studentsTableBody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteStudent(btn.closest('tr').dataset.id));
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============ Edit Modal ============

function openEditModal(id, name, marks) {
  editStudentIdInput.value = id;
  editNameInput.value = name;
  editMarksInput.value = marks;
  editNameError.textContent = '';
  editMarksError.textContent = '';
  editModal.classList.remove('hidden');
}

function closeEditModal() {
  editModal.classList.add('hidden');
  editForm.reset();
}


// ============ Event Listeners ============

// Add student form submit
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateAddForm()) return;

  setSubmitLoading(true);
  const data = {
    name: studentNameInput.value.trim(),
    marks: Number(studentMarksInput.value)
  };
  await addStudent(data);
});

// Refresh button
refreshBtn.addEventListener('click', () => {
  fetchStudents();
  showToast('List refreshed', 'success');
});

// Edit form submit
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = editNameInput.value.trim();
  const marks = editMarksInput.value;
  editNameError.textContent = '';
  editMarksError.textContent = '';

  let valid = true;
  if (!name || name.length < 2) {
    editNameError.textContent = 'Name must be at least 2 characters';
    valid = false;
  }
  const marksNum = Number(marks);
  if (marks === '' || isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
    editMarksError.textContent = 'Marks must be between 0 and 100';
    valid = false;
  }
  if (!valid) return;

  editForm.querySelector('.btn-text').classList.add('hidden');
  editLoader.classList.remove('hidden');

  await updateStudent(editStudentIdInput.value, { name, marks: marksNum });
});

// Close modal
closeModalBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeEditModal();
});

// ============ Initial Load ============
fetchStudents();
