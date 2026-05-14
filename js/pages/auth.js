function renderAuth() {
    const wrapper = document.createElement('div');
    wrapper.className = 'auth-wrapper';
    wrapper.innerHTML = `
      <div class="auth-hero">
        <div class="auth-hero-content">
          <div class="auth-hero-title">Simple Coffee<br>Learning Portal</div>
          <div class="auth-hero-sub">Платформа для обучения и аттестации бариста и менеджеров сети Simple Coffee</div>
        </div>
      </div>
      <div class="auth-form-pane">
        <div class="auth-form-container">
          <h2>Вход в систему</h2>
          <div class="auth-form-hint">Войдите, используя корпоративную почту</div>
          <div id="auth-form-container">
            <div class="form-group"><label>Email</label><input type="email" id="login-email" placeholder="barista@simplecoffee.ru"></div>
            <div class="form-group"><label>Пароль</label><input type="password" id="login-password" placeholder="••••••••"></div>
            <button class="btn btn-primary" style="width:100%" id="login-btn">Войти</button>
            <div style="margin-top:24px;font-size:12px;color:var(--text-muted);text-align:center">Обратитесь к менеджеру для получения доступа</div>
          </div>
        </div>
      </div>
    `;
    
    const loginBtn = wrapper.querySelector('#login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          login(email, password);
        });
    }
    return wrapper;
  }