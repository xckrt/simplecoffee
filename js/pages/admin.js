async function loadAdminResults() {
    state.loading = true;
    render();
    try {
      const data = await apiFetch('/test/results/all');
      state.adminResults = data.items || [];
    } catch (e) { throw e; }
    finally { state.loading = false; render(); }
  }
  
  function renderAdmin() {
    const div = document.createElement('div');
    div.className = 'page-wide';
    div.innerHTML = `<h1>Результаты сотрудников</h1><div class="subtitle">Все результаты тестирования по сети</div>`;
    
    if (state.adminResults.length === 0) { 
      div.innerHTML += '<div class="empty"><div class="empty-icon">📊</div><h3>Нет данных</h3></div>'; 
      return div; 
    }
    
    const total = state.adminResults.length;
    const passed = state.adminResults.filter(r => r.isPassed).length;
    const avgScore = Math.round(state.adminResults.reduce((s, r) => s + r.score, 0) / total);
    
    let statsHtml = '<div class="stats-grid">';
    [{ val: total, label: 'Всего тестов' }, { val: passed, label: 'Пройдено' }, { val: total - passed, label: 'Не пройдено' }, { val: `${avgScore}%`, label: 'Средний балл' }].forEach(s => {
      statsHtml += `<div class="stat-card"><div class="stat-val">${s.val}</div><div class="stat-key">${s.label}</div></div>`;
    });
    statsHtml += '</div>';
    div.innerHTML += statsHtml;
    
    let tableHtml = '<div class="card" style="padding:0;overflow-x:auto"><table class="history-table"><thead><tr><th>Сотрудник</th><th>Тест</th><th>Балл</th><th>Статус</th><th>Локация</th><th>Дата</th></tr></thead><tbody>';
    state.adminResults.forEach(r => {
      tableHtml += `<tr>
        <td><div style="font-weight:600">${escapeHtml(r.userName)}</div><div style="font-size:11px;color:var(--text-muted)">${escapeHtml(r.userEmail)}</div></td>
        <td>${escapeHtml(r.testTitle)}</td>
        <td style="font-weight:700;color:${r.isPassed ? 'var(--green)' : 'var(--red)'}">${r.score}%</td>
        <td><span class="badge ${r.isPassed ? 'badge-pass' : 'badge-fail'}">${r.isPassed ? 'Пройден' : 'Не пройден'}</span></td>
        <td>${escapeHtml(r.location) || '—'}</td>
        <td>${formatDate(r.finishedAt)}</td>
      </tr>`;
    });
    tableHtml += '</tbody></table></div>';
    div.innerHTML += tableHtml;
    return div;
  }