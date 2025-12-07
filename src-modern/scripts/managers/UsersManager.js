// API base URL
const API_BASE = '/api';

console.log('👤 Users Manager script loaded');

// Users data management
class UsersManager {
  constructor() {
    console.log('📊 UsersManager initialized');
    this.isLoading = false;
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalUsers = 0;
    this.users = [];
    this.selectedUsers = new Set();
    this.sortConfig = {
      field: 'createdAt',
      direction: 'desc'
    };
    this.filterConfig = {
      status: '',
      role: '',
      search: ''
    };
  }

  async init() {
    console.log('🚀 Initializing users manager...');
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load initial data
    await this.loadUsers();
    
    // Update stats if exists
    await this.updateUserStats();
    
    // Load activities
    await this.loadActivities();
    
    // Initialize charts
    this.initCharts();
    
    console.log('✅ Users manager initialized');
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterConfig.search = e.target.value;
        this.debounceSearch();
      });
    }

    // Filter dropdowns
    const statusFilter = document.getElementById('statusFilter');
    const roleFilter = document.getElementById('roleFilter');
    
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterConfig.status = e.target.value;
        this.loadUsers();
      });
    }
    
    if (roleFilter) {
      roleFilter.addEventListener('change', (e) => {
        this.filterConfig.role = e.target.value;
        this.loadUsers();
      });
    }

    // Sort headers
    document.querySelectorAll('[data-sort]').forEach(header => {
      header.addEventListener('click', (e) => {
        const field = e.currentTarget.dataset.sort;
        this.handleSort(field);
      });
    });

    // Bulk actions
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        this.handleSelectAll(e.target.checked);
      });
    }

    // Bulk action buttons
    const bulkActivateBtn = document.getElementById('bulkActivateBtn');
    const bulkDeactivateBtn = document.getElementById('bulkDeactivateBtn');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    
    if (bulkActivateBtn) {
      bulkActivateBtn.addEventListener('click', () => {
        this.handleBulkAction('activate');
      });
    }
    
    if (bulkDeactivateBtn) {
      bulkDeactivateBtn.addEventListener('click', () => {
        this.handleBulkAction('deactivate');
      });
    }
    
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', () => {
        this.handleBulkAction('delete');
      });
    }
    
    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener('click', () => {
        this.clearSelection();
      });
    }

    // Add user button
    const addUserBtn = document.getElementById('saveUserBtn');
    if (addUserBtn) {
      addUserBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveUser();
      });
    }

    // Export button
    const exportBtn = document.getElementById('exportUsersBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportUsers();
      });
    }

    // Import button
    const importBtn = document.getElementById('importUsersBtn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        this.importUsers();
      });
    }

    // Refresh activities button
    const refreshActivitiesBtn = document.getElementById('refreshActivitiesBtn');
    if (refreshActivitiesBtn) {
      refreshActivitiesBtn.addEventListener('click', () => {
        this.loadActivities();
      });
    }

    // Modal form submission
    const userForm = document.getElementById('userForm');
    if (userForm) {
      userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveUser();
      });
    }
  }

  async loadUsers() {
    try {
      console.log('⏳ Loading users...');
      this.showLoading();
      
      const queryParams = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage,
        sortBy: this.sortConfig.field,
        sortOrder: this.sortConfig.direction,
        ...(this.filterConfig.status && { status: this.filterConfig.status }),
        ...(this.filterConfig.role && { role: this.filterConfig.role }),
        ...(this.filterConfig.search && { search: this.filterConfig.search })
      });
      
      const response = await fetch(`${API_BASE}/users?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Users loaded:', result);
      
      if (result.success) {
        this.users = result.data || [];
        this.totalUsers = result.total || 0;
        this.currentPage = result.page || 1;
        
        this.renderUsers();
        this.updatePagination();
        this.updateBulkActionState();
      } else {
        throw new Error(result.message || 'Failed to load users');
      }
      
      this.hideLoading();
      
    } catch (error) {
      console.error('❌ Error loading users:', error);
      this.showToast(error.message || 'Failed to load users', 'error');
      this.hideLoading();
      
      // Load sample data if API fails (for demo)
      this.loadSampleUsers();
    }
  }

  async updateUserStats() {
    try {
      const response = await fetch(`${API_BASE}/users/stats`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        const stats = result.data;
        
        // Update stats cards
        const totalUsersCount = document.getElementById('totalUsersCount');
        const activeUsersCount = document.getElementById('activeUsersCount');
        
        if (totalUsersCount) totalUsersCount.textContent = stats.totalUsers || 0;
        if (activeUsersCount) activeUsersCount.textContent = stats.activeUsers || 0;
        
        // Update chart data if needed
        if (this.userGrowthChart) {
          this.updateGrowthChart(stats.monthlyGrowth || []);
        }
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  async loadActivities() {
    try {
      const response = await fetch(`${API_BASE}/users/activities`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        this.renderActivities(result.data || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      this.renderActivities([]);
    }
  }

  renderUsers() {
    const usersTable = document.getElementById('usersTableBody');
    if (!usersTable) return;
    
    if (this.users.length === 0) {
      usersTable.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5">
            <i class="bi bi-people display-6 text-muted"></i>
            <p class="mt-3">No users found</p>
          </td>
        </tr>
      `;
      return;
    }
    
    usersTable.innerHTML = this.users.map(user => `
      <tr data-user-id="${user.id}" ${this.selectedUsers.has(user.id) ? 'class="selected"' : ''}>
        <td>
          <input type="checkbox" 
                 class="user-select-checkbox user-checkbox" 
                 value="${user.id}" 
                 ${this.selectedUsers.has(user.id) ? 'checked' : ''}>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <img src="${user.avatar || '/assets/images/avatar-placeholder.svg'}" 
                 alt="${user.name}" 
                 class="user-avatar me-3">
            <div>
              <div class="fw-medium">${user.name}</div>
              <small class="text-muted">${user.email}</small>
            </div>
          </div>
        </td>
        <td class="text-muted">${user.email}</td>
        <td>
          <span class="user-role ${this.getRoleColorClass(user.role)}">${user.role}</span>
        </td>
        <td>
          <span class="user-status ${this.getStatusColorClass(user.status)}">${user.status}</span>
        </td>
        <td class="text-muted">${this.formatRelativeTime(user.lastLogin || user.createdAt)}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" 
                    type="button" 
                    data-bs-toggle="dropdown">
              <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <button class="dropdown-item" type="button" onclick="window.usersManager.viewUser(${user.id})">
                  <i class="bi bi-eye me-2"></i>View
                </button>
              </li>
              <li>
                <button class="dropdown-item" type="button" onclick="window.usersManager.editUser(${user.id})">
                  <i class="bi bi-pencil me-2"></i>Edit
                </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item text-danger" type="button" onclick="window.usersManager.deleteUser(${user.id})">
                  <i class="bi bi-trash me-2"></i>Delete
                </button>
              </li>
            </ul>
          </div>
        </td>
      </tr>
    `).join('');
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.user-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const userId = parseInt(e.target.value);
        if (e.target.checked) {
          this.selectedUsers.add(userId);
          e.target.closest('tr').classList.add('selected');
        } else {
          this.selectedUsers.delete(userId);
          e.target.closest('tr').classList.remove('selected');
        }
        this.updateBulkActionState();
      });
    });
  }

  renderActivities(activities) {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;
    
    if (activities.length === 0) {
      activityFeed.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-activity display-6 text-muted"></i>
          <p class="mt-2">No recent activities</p>
        </div>
      `;
      return;
    }
    
    activityFeed.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${this.getActivityTypeColor(activity.type)} me-3">
          <i class="bi bi-${activity.icon || 'circle'}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between">
            <strong>${activity.user}</strong>
            <small class="text-muted">${activity.time}</small>
          </div>
          <div class="text-muted">
            ${activity.action} - ${activity.details}
          </div>
        </div>
      </div>
    `).join('');
  }

  async viewUser(userId) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        const user = result.data;
        this.showUserModal(user, false);
      }
    } catch (error) {
      console.error('Error viewing user:', error);
      this.showToast('Failed to load user details', 'error');
    }
  }

  async editUser(userId) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        const user = result.data;
        this.showUserModal(user, true);
      }
    } catch (error) {
      console.error('Error loading user for edit:', error);
      this.showToast('Failed to load user data', 'error');
    }
  }

  async deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast('User deleted successfully', 'success');
        await this.loadUsers();
        await this.updateUserStats();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      this.showToast(error.message || 'Failed to delete user', 'error');
    }
  }

  showUserModal(user = null, isEdit = false) {
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    const modalTitle = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');
    
    if (isEdit) {
      modalTitle.textContent = 'Edit User';
      // Populate form with user data
      document.getElementById('firstName').value = user.firstName || '';
      document.getElementById('lastName').value = user.lastName || '';
      document.getElementById('email').value = user.email || '';
      document.getElementById('role').value = user.role || 'user';
      document.getElementById('status').value = user.status || 'active';
      document.getElementById('phone').value = user.phone || '';
      
      // Store user ID in form for update
      form.dataset.userId = user.id;
    } else {
      modalTitle.textContent = user ? 'User Details' : 'Add New User';
      if (user) {
        // View mode - disable inputs
        document.getElementById('firstName').value = user.firstName || '';
        document.getElementById('firstName').disabled = true;
        document.getElementById('lastName').value = user.lastName || '';
        document.getElementById('lastName').disabled = true;
        document.getElementById('email').value = user.email || '';
        document.getElementById('email').disabled = true;
        document.getElementById('role').value = user.role || '';
        document.getElementById('role').disabled = true;
        document.getElementById('status').value = user.status || '';
        document.getElementById('status').disabled = true;
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('phone').disabled = true;
        document.getElementById('saveUserBtn').style.display = 'none';
      } else {
        // Add mode - enable inputs
        form.reset();
        form.dataset.userId = '';
        document.getElementById('firstName').disabled = false;
        document.getElementById('lastName').disabled = false;
        document.getElementById('email').disabled = false;
        document.getElementById('role').disabled = false;
        document.getElementById('status').disabled = false;
        document.getElementById('phone').disabled = false;
        document.getElementById('saveUserBtn').style.display = 'block';
      }
    }
    
    modal.show();
  }

  async saveUser() {
    const form = document.getElementById('userForm');
    const userId = form.dataset.userId;
    
    const userData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      role: document.getElementById('role').value,
      status: document.getElementById('status').value,
      phone: document.getElementById('phone').value || ''
    };
    
    try {
      let response;
      
      if (userId) {
        // Update existing user
        response = await fetch(`${API_BASE}/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      } else {
        // Create new user
        response = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      }
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast(userId ? 'User updated successfully' : 'User created successfully', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
        modal.hide();
        
        // Refresh data
        await this.loadUsers();
        await this.updateUserStats();
      } else {
        throw new Error(result.message || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      this.showToast(error.message || 'Failed to save user', 'error');
    }
  }

  handleSort(field) {
    if (this.sortConfig.field === field) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig.field = field;
      this.sortConfig.direction = 'asc';
    }
    
    // Update sort icons
    document.querySelectorAll('[data-sort]').forEach(header => {
      const upIcon = header.querySelector('.bi-arrow-up');
      const downIcon = header.querySelector('.bi-arrow-down');
      
      if (header.dataset.sort === field) {
        if (this.sortConfig.direction === 'asc') {
          upIcon.style.display = 'inline';
          downIcon.style.display = 'none';
        } else {
          upIcon.style.display = 'none';
          downIcon.style.display = 'inline';
        }
      } else {
        upIcon.style.display = 'none';
        downIcon.style.display = 'none';
      }
    });
    
    this.loadUsers();
  }

  handleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    
    if (checked) {
      // Select all users
      this.users.forEach(user => {
        this.selectedUsers.add(user.id);
      });
      
      checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        checkbox.closest('tr').classList.add('selected');
      });
      
      if (bulkActionsBar) bulkActionsBar.style.display = 'block';
    } else {
      // Deselect all
      this.selectedUsers.clear();
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('tr').classList.remove('selected');
      });
      
      if (bulkActionsBar) bulkActionsBar.style.display = 'none';
    }
    
    this.updateBulkActionState();
  }

  updateBulkActionState() {
    const selectedCount = document.getElementById('selectedUsersCount');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    
    if (selectedCount) {
      selectedCount.textContent = this.selectedUsers.size;
    }
    
    if (bulkActionsBar) {
      if (this.selectedUsers.size > 0) {
        bulkActionsBar.style.display = 'block';
      } else {
        bulkActionsBar.style.display = 'none';
      }
    }
    
    // Update select all checkbox state
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
      if (this.selectedUsers.size === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
      } else if (this.selectedUsers.size === this.users.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
      } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
      }
    }
  }

  clearSelection() {
    this.selectedUsers.clear();
    document.querySelectorAll('.user-checkbox').forEach(checkbox => {
      checkbox.checked = false;
      checkbox.closest('tr').classList.remove('selected');
    });
    this.updateBulkActionState();
  }

  async handleBulkAction(action) {
    if (this.selectedUsers.size === 0) {
      this.showToast('Please select users first', 'error');
      return;
    }
    
    const userIds = Array.from(this.selectedUsers);
    
    let confirmMessage = '';
    switch (action) {
      case 'activate':
        confirmMessage = `Activate ${userIds.length} selected user(s)?`;
        break;
      case 'deactivate':
        confirmMessage = `Deactivate ${userIds.length} selected user(s)?`;
        break;
      case 'delete':
        confirmMessage = `Delete ${userIds.length} selected user(s)? This action cannot be undone.`;
        break;
    }
    
    if (!confirm(confirmMessage)) return;
    
    try {
      const response = await fetch(`${API_BASE}/users/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: action,
          userIds: userIds
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast(result.message || 'Bulk action completed', 'success');
        this.clearSelection();
        await this.loadUsers();
        await this.updateUserStats();
      } else {
        throw new Error(result.message || 'Bulk action failed');
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      this.showToast(error.message || 'Failed to perform bulk action', 'error');
    }
  }

  async exportUsers() {
    try {
      const response = await fetch(`${API_BASE}/users/export`);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // Check if response is JSON (error) or CSV (success)
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }
      } else {
        // It's a CSV file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('Users exported successfully', 'success');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      this.showToast(error.message || 'Failed to export users', 'error');
    }
  }

  async importUsers() {
    const fileInput = document.getElementById('csvFile');
    if (!fileInput || !fileInput.files[0]) {
      this.showToast('Please select a CSV file', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    try {
      const response = await fetch(`${API_BASE}/users/import`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        this.showToast(result.message || 'Users imported successfully', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
        if (modal) modal.hide();
        
        // Refresh data
        await this.loadUsers();
        await this.updateUserStats();
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing users:', error);
      this.showToast(error.message || 'Failed to import users', 'error');
    }
  }

  updatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(this.totalUsers / this.itemsPerPage);
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage - 1}">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }
    
    // Next button
    paginationHTML += `
      <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage + 1}">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Add event listeners to pagination links
    paginationContainer.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(e.target.closest('.page-link').dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.loadUsers();
        }
      });
    });
  }

  initCharts() {
    // User Growth Chart
    const growthChartEl = document.getElementById('userGrowthChart');
    if (growthChartEl) {
      this.userGrowthChart = new ApexCharts(growthChartEl, {
        series: [{
          name: 'New Users',
          data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
        }],
        chart: {
          type: 'line',
          height: 300,
          toolbar: { show: false }
        },
        colors: ['#4CAF50'],
        stroke: {
          width: 3,
          curve: 'smooth'
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
        },
        grid: {
          borderColor: '#e7e7e7',
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          }
        }
      });
      this.userGrowthChart.render();
    }
    
    // User Type Pie Chart
    const pieChartEl = document.getElementById('userTypePieChart');
    if (pieChartEl) {
      this.userTypePieChart = new ApexCharts(pieChartEl, {
        series: [65, 35],
        chart: {
          type: 'donut',
          height: 250
        },
        labels: ['Regular Users', 'Sellers'],
        colors: ['#4CAF50', '#2196F3'],
        legend: {
          show: false
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total Users',
                  formatter: function (w) {
                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                  }
                }
              }
            }
          }
        }
      });
      this.userTypePieChart.render();
    }
  }

  updateGrowthChart(data) {
    if (this.userGrowthChart && data.length > 0) {
      const categories = data.map(item => item.month);
      const seriesData = data.map(item => item.count);
      
      this.userGrowthChart.updateOptions({
        xaxis: { categories },
        series: [{ data: seriesData }]
      });
    }
  }

  // Utility methods
  getRoleColorClass(role) {
    const colorMap = {
      'admin': 'bg-danger text-white',
      'user': 'bg-secondary text-white',
      'moderator': 'bg-warning text-dark',
      'seller': 'bg-info text-white',
      'customer': 'bg-success text-white'
    };
    return colorMap[role] || 'bg-secondary text-white';
  }

  getStatusColorClass(status) {
    const colorMap = {
      'active': 'bg-success text-white',
      'inactive': 'bg-secondary text-white',
      'pending': 'bg-warning text-dark',
      'banned': 'bg-danger text-white',
      'suspended': 'bg-danger text-white'
    };
    return colorMap[status] || 'bg-secondary text-white';
  }

  getActivityTypeColor(type) {
    const colorMap = {
      'login': 'bg-primary text-white',
      'update': 'bg-warning text-dark',
      'create': 'bg-success text-white',
      'system': 'bg-info text-white',
      'logout': 'bg-secondary text-white'
    };
    return colorMap[type] || 'bg-secondary text-white';
  }

  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  debounceSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadUsers();
    }, 500);
  }

  showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'flex';
  }

  hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
      <div id="${toastId}" class="toast align-items-center text-bg-${type === 'error' ? 'danger' : type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi bi-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  }

  // Sample data for demo (fallback)
  loadSampleUsers() {
    console.log('📋 Loading sample users data...');
    
    this.users = [
      {
        id: 1,
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        name: 'Nguyễn Văn A',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        phone: '+84 123 456 789',
        avatar: '/assets/images/avatar-placeholder.svg',
        lastLogin: new Date(Date.now() - 2 * 60000).toISOString(),
        createdAt: new Date('2023-01-15').toISOString()
      },
      {
        id: 2,
        firstName: 'Trần',
        lastName: 'Thị B',
        name: 'Trần Thị B',
        email: 'user@example.com',
        role: 'user',
        status: 'active',
        phone: '+84 987 654 321',
        avatar: '/assets/images/avatar-placeholder.svg',
        lastLogin: new Date(Date.now() - 60 * 60000).toISOString(),
        createdAt: new Date('2023-02-20').toISOString()
      }
    ];
    
    this.totalUsers = this.users.length;
    this.renderUsers();
    this.updatePagination();
    this.updateBulkActionState();
  }
}

// Initialize users manager when page loads
function initializeUsersManager() {
  console.log('🚀 DOM loaded, initializing users manager...');

  // Check if we're on the users page
  if (!document.getElementById('usersManagementContainer')) {
    console.log('⚠️ Not on users page, skipping initialization');
    return;
  }

  // Initialize users manager
  const usersManager = new UsersManager();
  window.usersManager = usersManager;
  
  // Initialize when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      usersManager.init();
    });
  } else {
    usersManager.init();
  }
  
  console.log('🎉 Users manager initialization complete');
}

// Start initialization
initializeUsersManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UsersManager, initializeUsersManager };
}