function renderHome() {
    const div = document.createElement('div');
    div.className = 'page';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
    
    div.innerHTML = `
      <h1>${greeting}, ${escapeHtml(state.auth?.fullName?.split(' ')[0]) || 'Коллега'}! ☕</h1>
      <div class="subtitle">Добро пожаловать в обучающий портал Simple Coffee</div>
      
      <div class="home-grid">
        <div class="home-card" data-page="menu">
          <div class="home-card-icon">📋</div>
          <div class="home-card-title">База меню</div>
          <div class="home-card-desc">Изучи все позиции с КБЖУ и составами</div>
        </div>
        <div class="home-card" data-page="lessons">
          <div class="home-card-icon">📖</div>
          <div class="home-card-title">База знаний</div>
          <div class="home-card-desc">Материалы для изучения и видео-уроки</div>
        </div>
        <div class="home-card" data-page="tests">
          <div class="home-card-icon">✏️</div>
          <div class="home-card-title">Пройти тест</div>
          <div class="home-card-desc">Базовая аттестация: меню + сервис</div>
        </div>
        <div class="home-card" data-page="history">
          <div class="home-card-icon">📊</div>
          <div class="home-card-title">История</div>
          <div class="home-card-desc">Посмотри свои прошлые результаты</div>
        </div>
      </div>
    `;
  
    const cards = div.querySelectorAll('.home-card');
    cards.forEach(card => {
      card.addEventListener('click', () => navigate(card.getAttribute('data-page')));
    });
    return div;
  }