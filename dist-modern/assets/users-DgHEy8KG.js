var E=(c,e)=>()=>(e||c((e={exports:{}}).exports,e),e.exports);import"./main-CWVm6W1x.js";var B=E((k,h)=>{const l="/api";console.log("👤 Users Manager script loaded");class y{constructor(){console.log("📊 UsersManager initialized"),this.isLoading=!1,this.currentPage=1,this.itemsPerPage=10,this.totalUsers=0,this.users=[],this.selectedUsers=new Set,this.sortConfig={field:"createdAt",direction:"desc"},this.filterConfig={status:"",role:"",search:""}}async init(){console.log("🚀 Initializing users manager..."),this.setupEventListeners(),await this.loadUsers(),await this.updateUserStats(),await this.loadActivities(),this.initCharts(),console.log("✅ Users manager initialized")}setupEventListeners(){const e=document.getElementById("userSearchInput");e&&e.addEventListener("input",n=>{this.filterConfig.search=n.target.value,this.debounceSearch()});const t=document.getElementById("statusFilter"),s=document.getElementById("roleFilter");t&&t.addEventListener("change",n=>{this.filterConfig.status=n.target.value,this.loadUsers()}),s&&s.addEventListener("change",n=>{this.filterConfig.role=n.target.value,this.loadUsers()}),document.querySelectorAll("[data-sort]").forEach(n=>{n.addEventListener("click",b=>{const v=b.currentTarget.dataset.sort;this.handleSort(v)})});const a=document.getElementById("selectAllCheckbox");a&&a.addEventListener("change",n=>{this.handleSelectAll(n.target.checked)});const r=document.getElementById("bulkActivateBtn"),i=document.getElementById("bulkDeactivateBtn"),o=document.getElementById("bulkDeleteBtn"),u=document.getElementById("clearSelectionBtn");r&&r.addEventListener("click",()=>{this.handleBulkAction("activate")}),i&&i.addEventListener("click",()=>{this.handleBulkAction("deactivate")}),o&&o.addEventListener("click",()=>{this.handleBulkAction("delete")}),u&&u.addEventListener("click",()=>{this.clearSelection()});const d=document.getElementById("saveUserBtn");d&&d.addEventListener("click",n=>{n.preventDefault(),this.saveUser()});const m=document.getElementById("exportUsersBtn");m&&m.addEventListener("click",()=>{this.exportUsers()});const g=document.getElementById("importUsersBtn");g&&g.addEventListener("click",()=>{this.importUsers()});const f=document.getElementById("refreshActivitiesBtn");f&&f.addEventListener("click",()=>{this.loadActivities()});const p=document.getElementById("userForm");p&&p.addEventListener("submit",n=>{n.preventDefault(),this.saveUser()})}async loadUsers(){try{console.log("⏳ Loading users..."),this.showLoading();const e=new URLSearchParams({page:this.currentPage,limit:this.itemsPerPage,sortBy:this.sortConfig.field,sortOrder:this.sortConfig.direction,...this.filterConfig.status&&{status:this.filterConfig.status},...this.filterConfig.role&&{role:this.filterConfig.role},...this.filterConfig.search&&{search:this.filterConfig.search}}),t=await fetch(`${l}/users?${e}`);if(!t.ok)throw new Error(`HTTP ${t.status}`);const s=await t.json();if(console.log("✅ Users loaded:",s),s.success)this.users=s.data||[],this.totalUsers=s.total||0,this.currentPage=s.page||1,this.renderUsers(),this.updatePagination(),this.updateBulkActionState();else throw new Error(s.message||"Failed to load users");this.hideLoading()}catch(e){console.error("❌ Error loading users:",e),this.showToast(e.message||"Failed to load users","error"),this.hideLoading(),this.loadSampleUsers()}}async updateUserStats(){try{const e=await fetch(`${l}/users/stats`);if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();if(t.success){const s=t.data,a=document.getElementById("totalUsersCount"),r=document.getElementById("activeUsersCount");a&&(a.textContent=s.totalUsers||0),r&&(r.textContent=s.activeUsers||0),this.userGrowthChart&&this.updateGrowthChart(s.monthlyGrowth||[])}}catch(e){console.error("Error loading user stats:",e)}}async loadActivities(){try{const e=await fetch(`${l}/users/activities`);if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();t.success&&this.renderActivities(t.data||[])}catch(e){console.error("Error loading activities:",e),this.renderActivities([])}}renderUsers(){const e=document.getElementById("usersTableBody");if(e){if(this.users.length===0){e.innerHTML=`
        <tr>
          <td colspan="7" class="text-center py-5">
            <i class="bi bi-people display-6 text-muted"></i>
            <p class="mt-3">No users found</p>
          </td>
        </tr>
      `;return}e.innerHTML=this.users.map(t=>`
      <tr data-user-id="${t.id}" ${this.selectedUsers.has(t.id)?'class="selected"':""}>
        <td>
          <input type="checkbox" 
                 class="user-select-checkbox user-checkbox" 
                 value="${t.id}" 
                 ${this.selectedUsers.has(t.id)?"checked":""}>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <img src="${t.avatar||"/assets/images/avatar-placeholder.svg"}" 
                 alt="${t.name}" 
                 class="user-avatar me-3">
            <div>
              <div class="fw-medium">${t.name}</div>
              <small class="text-muted">${t.email}</small>
            </div>
          </div>
        </td>
        <td class="text-muted">${t.email}</td>
        <td>
          <span class="user-role ${this.getRoleColorClass(t.role)}">${t.role}</span>
        </td>
        <td>
          <span class="user-status ${this.getStatusColorClass(t.status)}">${t.status}</span>
        </td>
        <td class="text-muted">${this.formatRelativeTime(t.lastLogin||t.createdAt)}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" 
                    type="button" 
                    data-bs-toggle="dropdown">
              <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <button class="dropdown-item" type="button" onclick="window.usersManager.viewUser(${t.id})">
                  <i class="bi bi-eye me-2"></i>View
                </button>
              </li>
              <li>
                <button class="dropdown-item" type="button" onclick="window.usersManager.editUser(${t.id})">
                  <i class="bi bi-pencil me-2"></i>Edit
                </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item text-danger" type="button" onclick="window.usersManager.deleteUser(${t.id})">
                  <i class="bi bi-trash me-2"></i>Delete
                </button>
              </li>
            </ul>
          </div>
        </td>
      </tr>
    `).join(""),document.querySelectorAll(".user-checkbox").forEach(t=>{t.addEventListener("change",s=>{const a=parseInt(s.target.value);s.target.checked?(this.selectedUsers.add(a),s.target.closest("tr").classList.add("selected")):(this.selectedUsers.delete(a),s.target.closest("tr").classList.remove("selected")),this.updateBulkActionState()})})}}renderActivities(e){const t=document.getElementById("activityFeed");if(t){if(e.length===0){t.innerHTML=`
        <div class="text-center py-4">
          <i class="bi bi-activity display-6 text-muted"></i>
          <p class="mt-2">No recent activities</p>
        </div>
      `;return}t.innerHTML=e.map(s=>`
      <div class="activity-item">
        <div class="activity-icon ${this.getActivityTypeColor(s.type)} me-3">
          <i class="bi bi-${s.icon||"circle"}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between">
            <strong>${s.user}</strong>
            <small class="text-muted">${s.time}</small>
          </div>
          <div class="text-muted">
            ${s.action} - ${s.details}
          </div>
        </div>
      </div>
    `).join("")}}async viewUser(e){try{const t=await fetch(`${l}/users/${e}`);if(!t.ok)throw new Error(`HTTP ${t.status}`);const s=await t.json();if(s.success){const a=s.data;this.showUserModal(a,!1)}}catch(t){console.error("Error viewing user:",t),this.showToast("Failed to load user details","error")}}async editUser(e){try{const t=await fetch(`${l}/users/${e}`);if(!t.ok)throw new Error(`HTTP ${t.status}`);const s=await t.json();if(s.success){const a=s.data;this.showUserModal(a,!0)}}catch(t){console.error("Error loading user for edit:",t),this.showToast("Failed to load user data","error")}}async deleteUser(e){if(confirm("Are you sure you want to delete this user?"))try{const t=await fetch(`${l}/users/${e}`,{method:"DELETE"});if(!t.ok)throw new Error(`HTTP ${t.status}`);const s=await t.json();if(s.success)this.showToast("User deleted successfully","success"),await this.loadUsers(),await this.updateUserStats();else throw new Error(s.message)}catch(t){console.error("Error deleting user:",t),this.showToast(t.message||"Failed to delete user","error")}}showUserModal(e=null,t=!1){const s=new bootstrap.Modal(document.getElementById("userModal")),a=document.getElementById("userModalTitle"),r=document.getElementById("userForm");t?(a.textContent="Edit User",document.getElementById("firstName").value=e.firstName||"",document.getElementById("lastName").value=e.lastName||"",document.getElementById("email").value=e.email||"",document.getElementById("role").value=e.role||"user",document.getElementById("status").value=e.status||"active",document.getElementById("phone").value=e.phone||"",r.dataset.userId=e.id):(a.textContent=e?"User Details":"Add New User",e?(document.getElementById("firstName").value=e.firstName||"",document.getElementById("firstName").disabled=!0,document.getElementById("lastName").value=e.lastName||"",document.getElementById("lastName").disabled=!0,document.getElementById("email").value=e.email||"",document.getElementById("email").disabled=!0,document.getElementById("role").value=e.role||"",document.getElementById("role").disabled=!0,document.getElementById("status").value=e.status||"",document.getElementById("status").disabled=!0,document.getElementById("phone").value=e.phone||"",document.getElementById("phone").disabled=!0,document.getElementById("saveUserBtn").style.display="none"):(r.reset(),r.dataset.userId="",document.getElementById("firstName").disabled=!1,document.getElementById("lastName").disabled=!1,document.getElementById("email").disabled=!1,document.getElementById("role").disabled=!1,document.getElementById("status").disabled=!1,document.getElementById("phone").disabled=!1,document.getElementById("saveUserBtn").style.display="block")),s.show()}async saveUser(){const t=document.getElementById("userForm").dataset.userId,s={firstName:document.getElementById("firstName").value,lastName:document.getElementById("lastName").value,email:document.getElementById("email").value,role:document.getElementById("role").value,status:document.getElementById("status").value,phone:document.getElementById("phone").value||""};try{let a;if(t?a=await fetch(`${l}/users/${t}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}):a=await fetch(`${l}/users`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),!a.ok)throw new Error(`HTTP ${a.status}`);const r=await a.json();if(r.success)this.showToast(t?"User updated successfully":"User created successfully","success"),bootstrap.Modal.getInstance(document.getElementById("userModal")).hide(),await this.loadUsers(),await this.updateUserStats();else throw new Error(r.message||"Failed to save user")}catch(a){console.error("Error saving user:",a),this.showToast(a.message||"Failed to save user","error")}}handleSort(e){this.sortConfig.field===e?this.sortConfig.direction=this.sortConfig.direction==="asc"?"desc":"asc":(this.sortConfig.field=e,this.sortConfig.direction="asc"),document.querySelectorAll("[data-sort]").forEach(t=>{const s=t.querySelector(".bi-arrow-up"),a=t.querySelector(".bi-arrow-down");t.dataset.sort===e?this.sortConfig.direction==="asc"?(s.style.display="inline",a.style.display="none"):(s.style.display="none",a.style.display="inline"):(s.style.display="none",a.style.display="none")}),this.loadUsers()}handleSelectAll(e){const t=document.querySelectorAll(".user-checkbox"),s=document.getElementById("bulkActionsBar");e?(this.users.forEach(a=>{this.selectedUsers.add(a.id)}),t.forEach(a=>{a.checked=!0,a.closest("tr").classList.add("selected")}),s&&(s.style.display="block")):(this.selectedUsers.clear(),t.forEach(a=>{a.checked=!1,a.closest("tr").classList.remove("selected")}),s&&(s.style.display="none")),this.updateBulkActionState()}updateBulkActionState(){const e=document.getElementById("selectedUsersCount"),t=document.getElementById("bulkActionsBar");e&&(e.textContent=this.selectedUsers.size),t&&(this.selectedUsers.size>0?t.style.display="block":t.style.display="none");const s=document.getElementById("selectAllCheckbox");s&&(this.selectedUsers.size===0?(s.checked=!1,s.indeterminate=!1):this.selectedUsers.size===this.users.length?(s.checked=!0,s.indeterminate=!1):(s.checked=!1,s.indeterminate=!0))}clearSelection(){this.selectedUsers.clear(),document.querySelectorAll(".user-checkbox").forEach(e=>{e.checked=!1,e.closest("tr").classList.remove("selected")}),this.updateBulkActionState()}async handleBulkAction(e){if(this.selectedUsers.size===0){this.showToast("Please select users first","error");return}const t=Array.from(this.selectedUsers);let s="";switch(e){case"activate":s=`Activate ${t.length} selected user(s)?`;break;case"deactivate":s=`Deactivate ${t.length} selected user(s)?`;break;case"delete":s=`Delete ${t.length} selected user(s)? This action cannot be undone.`;break}if(confirm(s))try{const a=await fetch(`${l}/users/bulk-action`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:e,userIds:t})});if(!a.ok)throw new Error(`HTTP ${a.status}`);const r=await a.json();if(r.success)this.showToast(r.message||"Bulk action completed","success"),this.clearSelection(),await this.loadUsers(),await this.updateUserStats();else throw new Error(r.message||"Bulk action failed")}catch(a){console.error("Error in bulk action:",a),this.showToast(a.message||"Failed to perform bulk action","error")}}async exportUsers(){try{const e=await fetch(`${l}/users/export`);if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=e.headers.get("content-type");if(t&&t.includes("application/json")){const s=await e.json();if(!s.success)throw new Error(s.message)}else{const s=await e.blob(),a=window.URL.createObjectURL(s),r=document.createElement("a");r.href=a,r.download=`users-export-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(r),r.click(),document.body.removeChild(r),window.URL.revokeObjectURL(a),this.showToast("Users exported successfully","success")}}catch(e){console.error("Error exporting users:",e),this.showToast(e.message||"Failed to export users","error")}}async importUsers(){const e=document.getElementById("csvFile");if(!e||!e.files[0]){this.showToast("Please select a CSV file","error");return}const t=new FormData;t.append("file",e.files[0]);try{const s=await fetch(`${l}/users/import`,{method:"POST",body:t});if(!s.ok)throw new Error(`HTTP ${s.status}`);const a=await s.json();if(a.success){this.showToast(a.message||"Users imported successfully","success");const r=bootstrap.Modal.getInstance(document.getElementById("importModal"));r&&r.hide(),await this.loadUsers(),await this.updateUserStats()}else throw new Error(a.message||"Import failed")}catch(s){console.error("Error importing users:",s),this.showToast(s.message||"Failed to import users","error")}}updatePagination(){const e=document.getElementById("paginationContainer");if(!e)return;const t=Math.ceil(this.totalUsers/this.itemsPerPage);if(t<=1){e.innerHTML="";return}let s="";s+=`
      <li class="page-item ${this.currentPage===1?"disabled":""}">
        <a class="page-link" href="#" data-page="${this.currentPage-1}">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;const a=5;let r=Math.max(1,this.currentPage-Math.floor(a/2)),i=Math.min(t,r+a-1);i-r+1<a&&(r=Math.max(1,i-a+1));for(let o=r;o<=i;o++)s+=`
        <li class="page-item ${o===this.currentPage?"active":""}">
          <a class="page-link" href="#" data-page="${o}">${o}</a>
        </li>
      `;s+=`
      <li class="page-item ${this.currentPage===t?"disabled":""}">
        <a class="page-link" href="#" data-page="${this.currentPage+1}">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `,e.innerHTML=s,e.querySelectorAll(".page-link").forEach(o=>{o.addEventListener("click",u=>{u.preventDefault();const d=parseInt(u.target.closest(".page-link").dataset.page);d&&d!==this.currentPage&&(this.currentPage=d,this.loadUsers())})})}initCharts(){const e=document.getElementById("userGrowthChart");e&&(this.userGrowthChart=new ApexCharts(e,{series:[{name:"New Users",data:[30,40,35,50,49,60,70,91,125]}],chart:{type:"line",height:300,toolbar:{show:!1}},colors:["#4CAF50"],stroke:{width:3,curve:"smooth"},xaxis:{categories:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"]},grid:{borderColor:"#e7e7e7",row:{colors:["#f3f3f3","transparent"],opacity:.5}}}),this.userGrowthChart.render());const t=document.getElementById("userTypePieChart");t&&(this.userTypePieChart=new ApexCharts(t,{series:[65,35],chart:{type:"donut",height:250},labels:["Regular Users","Sellers"],colors:["#4CAF50","#2196F3"],legend:{show:!1},plotOptions:{pie:{donut:{labels:{show:!0,total:{show:!0,label:"Total Users",formatter:function(s){return s.globals.seriesTotals.reduce((a,r)=>a+r,0)}}}}}}}),this.userTypePieChart.render())}updateGrowthChart(e){if(this.userGrowthChart&&e.length>0){const t=e.map(a=>a.month),s=e.map(a=>a.count);this.userGrowthChart.updateOptions({xaxis:{categories:t},series:[{data:s}]})}}getRoleColorClass(e){return{admin:"bg-danger text-white",user:"bg-secondary text-white",moderator:"bg-warning text-dark",seller:"bg-info text-white",customer:"bg-success text-white"}[e]||"bg-secondary text-white"}getStatusColorClass(e){return{active:"bg-success text-white",inactive:"bg-secondary text-white",pending:"bg-warning text-dark",banned:"bg-danger text-white",suspended:"bg-danger text-white"}[e]||"bg-secondary text-white"}getActivityTypeColor(e){return{login:"bg-primary text-white",update:"bg-warning text-dark",create:"bg-success text-white",system:"bg-info text-white",logout:"bg-secondary text-white"}[e]||"bg-secondary text-white"}formatRelativeTime(e){const t=new Date(e),a=new Date-t,r=Math.floor(a/6e4),i=Math.floor(a/36e5),o=Math.floor(a/864e5);return r<1?"Just now":r<60?`${r}m ago`:i<24?`${i}h ago`:o===1?"Yesterday":o<7?`${o}d ago`:t.toLocaleDateString()}debounceSearch(){this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=setTimeout(()=>{this.loadUsers()},500)}showLoading(){const e=document.getElementById("loading-screen");e&&(e.style.display="flex")}hideLoading(){const e=document.getElementById("loading-screen");e&&(e.style.display="none")}showToast(e,t="info"){const s=document.getElementById("toast-container");if(!s)return;const a="toast-"+Date.now(),r=`
      <div id="${a}" class="toast align-items-center text-bg-${t==="error"?"danger":t} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi bi-${t==="error"?"exclamation-triangle":t==="success"?"check-circle":"info-circle"} me-2"></i>
            ${e}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;s.insertAdjacentHTML("beforeend",r);const i=document.getElementById(a);new bootstrap.Toast(i,{delay:3e3}).show(),i.addEventListener("hidden.bs.toast",()=>{i.remove()})}loadSampleUsers(){console.log("📋 Loading sample users data..."),this.users=[{id:1,firstName:"Nguyễn",lastName:"Văn A",name:"Nguyễn Văn A",email:"admin@example.com",role:"admin",status:"active",phone:"+84 123 456 789",avatar:"/assets/images/avatar-placeholder.svg",lastLogin:new Date(Date.now()-2*6e4).toISOString(),createdAt:new Date("2023-01-15").toISOString()},{id:2,firstName:"Trần",lastName:"Thị B",name:"Trần Thị B",email:"user@example.com",role:"user",status:"active",phone:"+84 987 654 321",avatar:"/assets/images/avatar-placeholder.svg",lastLogin:new Date(Date.now()-60*6e4).toISOString(),createdAt:new Date("2023-02-20").toISOString()}],this.totalUsers=this.users.length,this.renderUsers(),this.updatePagination(),this.updateBulkActionState()}}function w(){if(console.log("🚀 DOM loaded, initializing users manager..."),!document.getElementById("usersManagementContainer")){console.log("⚠️ Not on users page, skipping initialization");return}const c=new y;window.usersManager=c,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{c.init()}):c.init(),console.log("🎉 Users manager initialization complete")}w();typeof h<"u"&&h.exports&&(h.exports={UsersManager:y,initializeUsersManager:w})});export default B();
