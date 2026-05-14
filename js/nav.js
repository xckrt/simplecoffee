function renderNav() {
    const nav = document.createElement('div');
    nav.className = 'navigation-new';
    
    
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  
    nav.innerHTML = `
      <div class="navigation-items">
        <a href="#" class="logo-link" id="logo-home-link">
          <img src="https://cdn.prod.website-files.com/5f92b98ef775e43402afe27f/69a2e5ff825a235c93dc616d_logo%20horizontal.svg" class="logo-image" alt="Simple Coffee">
          <img src="https://cdn.prod.website-files.com/5f92b98ef775e43402afe27f/690a55287ea74a02dd0609fe_logo%20mobile.svg" class="logo-image-mob" alt="Simple Coffee">
        </a>
        <div class="navigation-wrap">
          <button class="nav-link ${state.page === 'home' ? 'active' : ''}" data-page="home">Главная</button>
          <button class="nav-link ${state.page === 'lessons' ? 'active' : ''}" data-page="lessons">База знаний</button>
          <button class="nav-link ${state.page === 'menu' ? 'active' : ''}" data-page="menu">Меню / КБЖУ</button>
          <button class="nav-link ${state.page === 'tests' ? 'active' : ''}" data-page="tests">Тест</button>
          <button class="nav-link ${state.page === 'history' ? 'active' : ''}" data-page="history">История</button>
          ${state.auth?.role === 'Manager' ? `<button class="nav-link ${state.page === 'users' ? 'active' : ''}" data-page="users">Сотрудники</button>` : ''}
          ${state.auth?.role === 'Manager' ? `<button class="nav-link ${state.page === 'admin' ? 'active' : ''}" data-page="admin">Результаты</button>` : ''}
          
          <span class="nav-role-badge">${state.auth?.role === 'Manager' ? 'Менеджер' : state.auth?.role === 'Barista' ? 'Бариста' : 'Стажёр'}</span>
          
          <button class="dark-toggle" id="theme-toggle" title="Переключить тему">
            ${state.theme === 'light' ? moonIcon : sunIcon}
          </button>
          
          <button class="nav-link" id="logout-btn">Выйти</button>
        </div>
      </div>
    `;
    
    const logoLink = nav.querySelector('#logo-home-link');
    if (logoLink) logoLink.addEventListener('click', (e) => { e.preventDefault(); navigate('home'); });
    
    const navButtons = nav.querySelectorAll('[data-page]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.getAttribute('data-page')));
    });
    
    const themeBtn = nav.querySelector('#theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', () => { toggleTheme(); renderNav(); });
  
    const logoutBtn = nav.querySelector('#logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    return nav;
  }