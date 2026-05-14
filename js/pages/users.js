async function loadUsers() {
    state.loading = true;
    render();
    try {
      state.users = await apiFetch('/users');
      state.roles = await apiFetch('/users/roles');
    } catch (e) { throw e; }
    finally { state.loading = false; render(); }
  }
  
  async function createUser(data) {
    await apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
    await loadUsers();
  }
  
  
  async function updateUser(id, data) {
    await apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await loadUsers(); 
  }
  
  function renderUsers() {
    const div = document.createElement('div');
    div.className = 'page-wide';
    div.innerHTML = `<h1>Сотрудники</h1><div class="subtitle">Управление доступом к порталу</div>`;
    
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.style.marginBottom = '24px';
    addBtn.textContent = '+ Добавить сотрудника';
    addBtn.addEventListener('click', showAddUserModal);
    div.appendChild(addBtn);
  
    if (!state.users || state.users.length === 0) {
       div.insertAdjacentHTML('beforeend', '<div class="empty"><h3>Нет данных</h3></div>');
       return div;
    }
  
    let html = '<div class="card" style="padding:0;overflow-x:auto"><table class="history-table"><thead><tr><th>Сотрудник</th><th>Email</th><th>Роль</th><th>Локация</th><th>Статус</th></tr></thead><tbody>';
    
    state.users.forEach((u, index) => {
      
      html += `<tr class="user-row" data-index="${index}" style="cursor:pointer;" title="Нажмите для редактирования">
        <td style="font-weight:600">${escapeHtml(u.fullName)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge" style="background:var(--blue-light);color:var(--blue)">${escapeHtml(u.roleDisplayName)}</span></td>
        <td>${escapeHtml(u.cafeLocation || '—')}</td>
        <td>${u.isActive ? '<span class="badge badge-pass">Активен</span>' : '<span class="badge badge-fail">Заблокирован</span>'}</td>
      </tr>`;
    });
    html += '</tbody></table></div>';
    
    div.insertAdjacentHTML('beforeend', html);
  

    const rows = div.querySelectorAll('.user-row');
    rows.forEach(row => {
        row.addEventListener('click', () => {
            const userIndex = row.getAttribute('data-index');
            const user = state.users[userIndex];
            showEditUserModal(user);
        });
    });
  
    return div;
  }