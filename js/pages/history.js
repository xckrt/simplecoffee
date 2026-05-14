async function loadHistory() {
    state.loading = true;
    render();
    try { state.history = await apiFetch('/test/results'); } 
    catch (e) { throw e; }
    finally { state.loading = false; render(); }
  }
  
  function renderHistory() {
    const div = document.createElement('div');
    div.className = 'page';
    div.innerHTML = `<h1>История тестов</h1><div class="subtitle">Все ваши предыдущие результаты</div>`;
    
    if (state.history.length === 0) { 
      div.innerHTML += '<div class="empty"><div class="empty-icon">📋</div><h3>Вы ещё не проходили тесты</h3></div>'; 
      return div; 
    }
    
    let html = '<div class="card" style="padding:0;overflow-x:auto"><table class="history-table"><thead><tr><th>Тест</th><th>Результат</th><th>Правильных</th><th>Статус</th><th>Дата</th></tr></thead><tbody>';
    state.history.forEach(r => {
      html += `<tr>
        <td>${escapeHtml(r.testTitle)}</td>
        <td style="font-weight:700;color:${r.isPassed ? 'var(--green)' : 'var(--red)'}">${r.score}%</td>
        <td>${r.correctAnswers}/${r.totalQuestions}</td>
        <td><span class="badge ${r.isPassed ? 'badge-pass' : 'badge-fail'}">${r.isPassed ? 'Пройден' : 'Не пройден'}</span></td>
        <td>${formatDate(r.finishedAt)}</td>
      </tr>`;
    });
    html += '</tbody></table></div>';
    div.innerHTML += html;
    return div;
  }