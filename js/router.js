
async function navigate(page, extra = {}) {
    state.page = page;
    Object.assign(state, extra);
    state.error = null;
    
    
    render();
  
    
    try {
      if (page === 'menu') await loadMenu();
      if (page === 'history') await loadHistory();
      if (page === 'admin') await loadAdminResults();
      if (page === 'lessons') await loadLessons();
      if (page === 'users') await loadUsers(); 
      if (page === 'tests') await loadTests();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }
  
  
  function render() {
    const root = document.getElementById('root');
    root.innerHTML = '';
    
    
    if (!state.auth && state.page !== 'auth') {
      state.page = 'auth';
    }
    
    
    if (state.page === 'auth') {
      root.appendChild(renderAuth());
      return;
    }
    
    const wrapper = document.createElement('div');
    wrapper.appendChild(renderNav()); 
    
    if (state.loading) {
      const loader = document.createElement('div');
      loader.className = 'page';
      loader.innerHTML = '<div class="spinner"></div>';
      wrapper.appendChild(loader);
    } else {
      
      let pageNode;
      switch (state.page) {
        case 'home':    pageNode = renderHome(); break;
        case 'menu':    pageNode = renderMenu(); break;
        case 'users':   pageNode = renderUsers(); break;
        case 'tests':   pageNode = renderTests(); break;
        case 'test':    pageNode = renderTest(); break;
        case 'result':  pageNode = renderResult(); break;
        case 'history': pageNode = renderHistory(); break;
        case 'admin':   pageNode = renderAdmin(); break;
        case 'lessons': pageNode = renderLessons(); break;
        default:        pageNode = renderHome(); break;
      }
      wrapper.appendChild(pageNode);
    }
    
    root.appendChild(wrapper);
  }