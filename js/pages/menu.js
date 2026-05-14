async function loadMenu() {
    state.loading = true;
    render();
    try {
      state.categories = await apiFetch('/menu/categories');
      await loadMenuItems();
    } catch (e) { throw e; }
    finally { state.loading = false; render(); }
  }
  
  async function loadMenuItems() {
    let url = '/menu/items?';
    if (state.menuCatId) url += `categoryId=${state.menuCatId}&`;
    if (state.menuSearch) url += `search=${encodeURIComponent(state.menuSearch)}&`;
    state.menuItems = await apiFetch(url);
  }
  
  function renderMenu() {
    const div = document.createElement('div');
    div.className = 'page-wide';
    div.innerHTML = `<h1>База меню & КБЖУ</h1><div class="subtitle">Все позиции Simple Coffee с пищевой ценностью и составами</div>`;
    
    const searchDiv = document.createElement('div');
    searchDiv.className = 'menu-toolbar';
    searchDiv.innerHTML = `<div class="search-wrap"><input type="search" id="menu-search" placeholder="Поиск по названию..." value="${escapeHtml(state.menuSearch)}"></div>`;
    
    const searchInput = searchDiv.querySelector('#menu-search');
    searchInput.addEventListener('input', (e) => { 
      state.menuSearch = e.target.value; 
      loadMenuItems().then(() => render()); 
    });
    div.appendChild(searchDiv);
    
    const catDiv = document.createElement('div');
    catDiv.className = 'cat-tabs';
    const allBtn = document.createElement('button');
    allBtn.className = `cat-tab ${!state.menuCatId ? 'active' : ''}`;
    allBtn.textContent = 'Все';
    allBtn.addEventListener('click', () => { state.menuCatId = null; loadMenuItems().then(() => render()); });
    catDiv.appendChild(allBtn);
    
    state.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `cat-tab ${state.menuCatId === cat.id ? 'active' : ''}`;
      btn.textContent = cat.name;
      btn.addEventListener('click', () => { state.menuCatId = cat.id; loadMenuItems().then(() => render()); });
      catDiv.appendChild(btn);
    });
    div.appendChild(catDiv);
    
    if (state.menuItems.length === 0) {
      div.innerHTML += '<div class="empty"><div class="empty-icon">☕</div><h3>Ничего не найдено</h3></div>';
      return div;
    }
    
    const grid = document.createElement('div');
    grid.className = 'menu-grid';
    state.menuItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.addEventListener('click', () => showMenuModal(item));
      card.innerHTML = `
        <div class="menu-card-content">
          <div class="menu-card-cat">${escapeHtml(item.category) || '—'}</div>
          <div class="menu-card-name">${escapeHtml(item.name)}</div>
          <div class="menu-card-portion">${escapeHtml(item.portionSize) || '—'}</div>
          <div class="kbju-row">
            <div class="kbju-cell"><span class="kbju-val">${item.calories ?? '—'}</span><span class="kbju-label">Ккал</span></div>
            <div class="kbju-cell"><span class="kbju-val">${item.proteins ?? '—'}</span><span class="kbju-label">Белки</span></div>
            <div class="kbju-cell"><span class="kbju-val">${item.fats ?? '—'}</span><span class="kbju-label">Жиры</span></div>
            <div class="kbju-cell"><span class="kbju-val">${item.carbohydrates ?? '—'}</span><span class="kbju-label">Углев.</span></div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    div.appendChild(grid);
    
    return div;
  }