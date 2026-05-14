const API = '/api';

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  
  if (state.auth?.accessToken) {
    headers['Authorization'] = `Bearer ${state.auth.accessToken}`;
  }
  
  try {
    const res = await fetch(`${API}${path}`, { ...opts, headers });
    
    
    if (res.status === 401 && state.auth?.refreshToken) {
      const rr = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: state.auth.refreshToken })
      });
      
      if (rr.ok) {
        state.auth = await rr.json();
        localStorage.setItem('sc_auth', JSON.stringify(state.auth));
        headers['Authorization'] = `Bearer ${state.auth.accessToken}`;
        

        const retry = await fetch(`${API}${path}`, { ...opts, headers });
        return retry.ok ? retry.json() : Promise.reject(await retry.text());
      } else {
        logout();
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || await res.text() || `Ошибка ${res.status}`);
    }
    
    return res.json();
  } catch (err) {
    console.error(`API Error (${path}):`, err);
    throw err;
  }
}

async function login(email, password) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    state.auth = data;
    localStorage.setItem('sc_auth', JSON.stringify(data));
    showToast('Успешный вход в систему!');
    navigate('home');
  } catch (e) {
    state.error = e.message;
    showToast(e.message, 'error');
    render();
  }
}

function logout() {
  if (state.auth?.refreshToken) {
    apiFetch('/auth/logout', { 
      method: 'POST', 
      body: JSON.stringify({ refreshToken: state.auth.refreshToken }) 
    }).catch(() => {});
  }
  state.auth = null;
  localStorage.removeItem('sc_auth');
  if (state.timerInterval) clearInterval(state.timerInterval);
  navigate('auth');
}