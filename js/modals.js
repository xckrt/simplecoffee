function showMenuModal(item) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    
    overlay.innerHTML = `
      <div class="modal">
        <div style="display:flex;justify-content:space-between;margin-bottom:20px">
          <span class="menu-card-cat">${escapeHtml(item.category)}</span>
          <button onclick="this.closest('.modal-overlay').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text-muted)">×</button>
        </div>
        <h2 style="margin-bottom:8px">${escapeHtml(item.name)}</h2>
        <p style="color:var(--text-secondary);font-size:14px;margin-bottom:20px">${escapeHtml(item.portionSize) || ''}</p>
        
        ${item.description ? `<p style="margin-bottom:24px;line-height:1.6">${escapeHtml(item.description)}</p>` : ''}
        
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:24px">
          <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">${item.calories ?? '—'}</div><div style="font-size:11px;color:var(--text-muted)">Калории</div></div>
          <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">${item.proteins ?? '—'}</div><div style="font-size:11px;color:var(--text-muted)">Белки, г</div></div>
          <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">${item.fats ?? '—'}</div><div style="font-size:11px;color:var(--text-muted)">Жиры, г</div></div>
          <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:var(--accent)">${item.carbohydrates ?? '—'}</div><div style="font-size:11px;color:var(--text-muted)">Углев., г</div></div>
        </div>
        
        ${item.composition ? `
          <p style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:8px">СОСТАВ</p>
          <p style="font-size:14px;line-height:1.6;margin-bottom:20px">${escapeHtml(item.composition)}</p>
        ` : ''}
  
        ${item.preparationMethod ? `
          <p style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:8px;margin-top:16px;">СПОСОБ ПРИГОТОВЛЕНИЯ</p>
          <div style="font-size:14px;line-height:1.6;background:var(--accent-light);padding:16px;border-radius:12px;color:var(--text);">
              ${escapeHtml(item.preparationMethod).replace(/\n/g, '<br>')}
          </div>
        ` : ''}
      </div>
    `;
    document.body.appendChild(overlay);
  }
  
  function showAddLessonModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="modal modal-large">
        <h2>Добавить объемный урок</h2>
        <div class="form-group"><label>Название урока</label><input type="text" id="n-title" placeholder="Например: Латте-арт и текстура молока"></div>
        <div class="form-group">
          <label>Содержание (поддерживается HTML-форматирование)</label>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5;">
            Используйте теги <b>&lt;h3&gt;</b>, <b>&lt;ul&gt;&lt;li&gt;</b>, <b>&lt;strong&gt;</b> для красивой структуры текста.<br>
            Для мини-теста: <b>[QUIZ: Вопрос | Ответ 1 | Ответ 2 | Ответ 3 | CORRECT: 0]</b> (где 0 - индекс правильного ответа)
          </div>
          <textarea id="n-content" rows="18" placeholder="Вставьте объемный текст лекции сюда..."></textarea>
        </div>
        <button class="btn btn-primary" style="width:100%; padding: 16px; font-size: 16px;" id="save-lesson-btn">Сохранить урок</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('save-lesson-btn').onclick = async () => {
      const btn = document.getElementById('save-lesson-btn');
      btn.disabled = true;
      btn.textContent = 'Сохраняем...';
      try {
        await createLesson(document.getElementById('n-title').value, document.getElementById('n-content').value);
        showToast('Урок успешно добавлен!');
        overlay.remove();
      } catch (e) {
        btn.disabled = false;
        btn.textContent = 'Сохранить урок';
        showToast(e.message, 'error');
      }
    };
  }
  
  function showAddUserModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    
    let rolesOptions = state.roles.map(r => `<option value="${r.id}">${escapeHtml(r.displayName)}</option>`).join('');
  
    overlay.innerHTML = `
      <div class="modal">
        <h2>Добавить сотрудника</h2>
        <div class="form-group"><label>ФИО</label><input type="text" id="nu-name" placeholder="Иванов Иван"></div>
        <div class="form-group"><label>Email</label><input type="email" id="nu-email" placeholder="barista@simplecoffee.ru"></div>
        <div class="form-group"><label>Пароль</label><input type="password" id="nu-pass" placeholder="Пароль"></div>
        <div class="form-group"><label>Роль</label><select id="nu-role">${rolesOptions}</select></div>
        <div class="form-group"><label>Кофейня (локация)</label><input type="text" id="nu-loc" placeholder="Например: Ленина 46"></div>
        <button class="btn btn-primary" style="width:100%" id="save-user-btn">Создать пользователя</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('save-user-btn').onclick = async () => {
       const btn = document.getElementById('save-user-btn');
       btn.disabled = true;
       btn.textContent = 'Создаем...';
       try {
           await createUser({
              fullName: document.getElementById('nu-name').value,
              email: document.getElementById('nu-email').value,
              password: document.getElementById('nu-pass').value,
              roleId: parseInt(document.getElementById('nu-role').value),
              cafeLocation: document.getElementById('nu-loc').value
           });
           showToast('Сотрудник успешно добавлен!');
           overlay.remove();
       } catch(e) {
           showToast(e.message, 'error');
           btn.disabled = false;
           btn.textContent = 'Создать пользователя';
       }
    };
  }


function showEditUserModal(user) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    

    let rolesOptions = state.roles.map(r => 
      `<option value="${r.id}" ${r.name === user.role ? 'selected' : ''}>${escapeHtml(r.displayName)}</option>`
    ).join('');
  
    overlay.innerHTML = `
      <div class="modal">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
          <h2 style="margin:0">Редактировать сотрудника</h2>
          <button onclick="this.closest('.modal-overlay').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text-muted)">×</button>
        </div>
        <div class="form-group"><label>ФИО</label><input type="text" id="eu-name" value="${escapeHtml(user.fullName)}"></div>
        <div class="form-group"><label>Email</label><input type="email" id="eu-email" value="${escapeHtml(user.email)}"></div>
        <div class="form-group">
          <label>Новый пароль (оставьте пустым, если не нужно менять)</label>
          <input type="password" id="eu-pass" placeholder="••••••••">
        </div>
        <div class="form-group"><label>Роль</label><select id="eu-role">${rolesOptions}</select></div>
        <div class="form-group"><label>Кофейня (локация)</label><input type="text" id="eu-loc" value="${escapeHtml(user.cafeLocation || '')}"></div>
        
        <div class="form-group" style="display:flex; align-items:center; gap:10px; margin-top:24px;">
          <input type="checkbox" id="eu-active" ${user.isActive ? 'checked' : ''} style="width:auto; transform: scale(1.2); cursor:pointer;">
          <label for="eu-active" style="margin:0; cursor:pointer; font-size:14px; text-transform:none;">Активен (имеет доступ к порталу)</label>
        </div>
        
        <button class="btn btn-primary" style="width:100%; margin-top:16px;" id="update-user-btn">Сохранить изменения</button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    document.getElementById('update-user-btn').onclick = async () => {
       const btn = document.getElementById('update-user-btn');
       btn.disabled = true;
       btn.textContent = 'Сохраняем...';
       try {
           await updateUser(user.id, {
              fullName: document.getElementById('eu-name').value,
              email: document.getElementById('eu-email').value,
              password: document.getElementById('eu-pass').value || null, 
              roleId: parseInt(document.getElementById('eu-role').value),
              cafeLocation: document.getElementById('eu-loc').value,
              isActive: document.getElementById('eu-active').checked
           });
           showToast('Данные сотрудника успешно обновлены!');
           overlay.remove();
       } catch(e) {
           showToast(e.message, 'error');
           btn.disabled = false;
           btn.textContent = 'Сохранить изменения';
       }
    };
  }