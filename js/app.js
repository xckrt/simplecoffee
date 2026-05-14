
(function initApp() {
    
    const saved = localStorage.getItem('sc_auth');
    if (saved) {
      try {
        state.auth = JSON.parse(saved);
        state.page = 'home';
      } catch (e) {
        localStorage.removeItem('sc_auth');
      }
    }
  

    document.addEventListener('keydown', (e) => {
      if (state.page === 'test' && !state.loading) {
        if (e.key === 'ArrowRight') {
          const nextBtn = document.getElementById('next-btn');
          if (nextBtn && !nextBtn.disabled) nextBtn.click();
        }
        if (e.key === 'ArrowLeft') {
          const prevBtn = document.getElementById('prev-btn');
          if (prevBtn && !prevBtn.disabled) prevBtn.click();
        }
      }
    });
  

    render();
  })();