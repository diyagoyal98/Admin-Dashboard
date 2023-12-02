let originalData;
let currentPage = 1;
const rowsPerPage = 10;

// Fetch data from the API endpoint
fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    originalData = data;
    loadFromLocalStorage();
    displayData(originalData);
    updatePagination(originalData.length);
  })
  .catch(error => {
    console.error('Error during fetch:', error);
  });

function displayData(data) {
  const tableBody = document.querySelector('#userTable tbody');
  tableBody.innerHTML = '';

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  for (let i = startIndex; i < endIndex && i < data.length; i++) {
    const user = data[i];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" class="select-checkbox" onclick="highlightRow(this)"></td>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td class="action-column">
        <button class="edit-btn" onclick="editUser(${user.id})">Edit</button>
        <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  }
}

function updatePagination(totalRecords) {
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const firstPageBtn = createPageButton('First', 1);
  paginationContainer.appendChild(firstPageBtn);

  const prevPageBtn = createPageButton('Prev', currentPage - 1);
  paginationContainer.appendChild(prevPageBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = createPageButton(i, i);
    paginationContainer.appendChild(pageBtn);
  }

  const nextPageBtn = createPageButton('Next', currentPage + 1);
  paginationContainer.appendChild(nextPageBtn);

  const lastPageBtn = createPageButton('Last', totalPages);
  paginationContainer.appendChild(lastPageBtn);
}

function createPageButton(text, targetPage) {
  const pageBtn = document.createElement('button');
  pageBtn.innerText = text;
  pageBtn.classList.add('page-btn');
  pageBtn.onclick = () => goToPage(targetPage);
  return pageBtn;
}

function goToPage(targetPage) {
  if (targetPage >= 1 && targetPage <= Math.ceil(originalData.length / rowsPerPage)) {
    currentPage = targetPage;
    displayData(originalData);
    updatePagination(originalData.length);
  }
}

function editUser(userId) {
  const newName = prompt('Enter the new name:');
  if (newName !== null) {
    const userToUpdate = originalData.find(user => user.id == userId);
    userToUpdate.name = newName;
    saveToLocalStorage();
    displayData(originalData);
  }
}

function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    // Filter out the user to be deleted from the data array
    originalData = originalData.filter(user => user.id != userId);
    saveToLocalStorage();
    displayData(originalData);
    updatePagination(originalData.length);
  }
}

function deleteSelected() {
  const selectedCheckboxes = document.querySelectorAll('.select-checkbox:checked');
  if (selectedCheckboxes.length === 0) {
    alert('Please select at least one user to delete.');
    return;
  }

  if (confirm('Are you sure you want to delete selected users?')) {
    // Filter out the selected users from the data array
    originalData = originalData.filter(user => !Array.from(selectedCheckboxes).some(checkbox => user.id == checkbox.closest('tr').querySelector('td:nth-child(2)').textContent));
    saveToLocalStorage();
    displayData(originalData);
    updatePagination(originalData.length);
  }
}


function filterTable() {
  const searchInput = document.getElementById('searchInput');
  const filterText = searchInput.value.toLowerCase();

  const filteredData = originalData.filter(user => {
    return Object.values(user).some(value => value.toLowerCase().includes(filterText));
  });

  currentPage = 1;
  displayData(filteredData);
  updatePagination(filteredData.length);
}

function highlightRow(checkbox) {
  const row = checkbox.closest('tr');
  if (checkbox.checked) {
    row.classList.add('selected-row');
  } else {
    row.classList.remove('selected-row');
  }
}

function selectAllRows() {
  const selectAllCheckbox = document.getElementById('selectAll');
  const allCheckboxes = document.querySelectorAll('.select-checkbox');

  allCheckboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
    highlightRow(checkbox);
  });
}

function saveToLocalStorage() {
  localStorage.setItem('userData', JSON.stringify(originalData));
}

function loadFromLocalStorage() {
  const storedData = localStorage.getItem('userData');
  if (storedData) {
    originalData = JSON.parse(storedData);
  }
}
