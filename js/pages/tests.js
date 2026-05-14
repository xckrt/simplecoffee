async function loadTests() {
    state.loading = true;
    render();
    try { state.testList = await apiFetch('/test'); } 
    catch (e) { throw e; }
    finally { state.loading = false; render(); }
  }
  
  async function startTest(testId) {
    state.loading = true;
    render();
    try {
      const test = await apiFetch(`/test/${testId}/start`);
      if (state.timerInterval) clearInterval(state.timerInterval);
      state.activeTest = test;
      state.testAnswers = {};
      state.currentQuestion = 0;
      state.testStartedAt = new Date().toISOString();
      
      if (test.timeLimit) {
        state.timerSecs = test.timeLimit * 60;
        state.timerInterval = setInterval(() => {
          state.timerSecs--;
          if (state.timerSecs <= 0) {
            clearInterval(state.timerInterval);
            submitTest();
            showToast('Время вышло! Тест отправлен автоматически.', 'error');
          }
          render();
        }, 1000);
      }
      navigate('test');
    } catch (e) { throw e; }
    finally { state.loading = false; render(); }
  }
  
  async function submitTest() {
    if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
    state.loading = true;
    render();
    try {
      const answers = state.activeTest.questions.map(q => ({
        questionId: q.id,
        selectedAnswerId: state.testAnswers[q.id] || null
      }));
      const result = await apiFetch('/test/submit', {
        method: 'POST',
        body: JSON.stringify({ testId: state.activeTest.id, startedAt: state.testStartedAt, answers })
      });
      state.lastResult = result;
      navigate('result');
    } catch (e) { throw e; }
    finally { state.loading = false; render(); }
  }
  
  function renderTests() {
    const div = document.createElement('div');
    div.className = 'page';
    div.innerHTML = `<h1>Тестирование</h1><div class="subtitle">Пройди аттестацию и подтверди свои знания</div>`;
  
    if (!state.testList || state.testList.length === 0) {
      div.innerHTML += '<div class="empty"><h3>Тесты пока не загружены</h3></div>';
      return div;
    }
  
    state.testList.forEach(t => {
      const locked = t.isLocked;
      div.innerHTML += `
        <div class="card" style="${locked ? 'opacity: 0.8; background: var(--bg-secondary);' : ''}">
          <h2 style="margin-bottom:12px; color: ${locked ? 'var(--text-muted)' : 'var(--text)'}">${escapeHtml(t.title)}</h2>
          <div style="font-size:14px;color:var(--text-secondary);margin-bottom:24px">${escapeHtml(t.description || '')}</div>
          <div style="display:flex;gap:24px;margin-bottom:24px;font-size:13px;color:var(--text-muted);flex-wrap:wrap">
            <span>⏱ ${t.timeLimit} минут</span>
            <span>❓ ${t.questionCount} вопросов</span>
            <span>✅ Порог: ${t.passScore}%</span>
            <span style="color:${locked ? 'var(--red)' : 'var(--green)'}; font-weight: bold;">📚 Изучено уроков: ${t.completedLessons} из ${t.totalLessons}</span>
          </div>
          ${locked 
            ? `<div style="padding:12px; background:var(--red-light); color:var(--red); border-radius:var(--r-sm); font-weight:600; font-size:14px;">🔒 Тест заблокирован. Изучите все уроки базы знаний.</div>`
            : `<button class="btn btn-primary start-test-btn" data-id="${t.id}">▶ Начать тест</button>`
          }
        </div>
      `;
    });
  
    const btns = div.querySelectorAll('.start-test-btn');
    btns.forEach(btn => { btn.addEventListener('click', (e) => startTest(e.target.dataset.id)); });
    return div;
  }
  
  function renderTest() {
    const test = state.activeTest;
    if (!test) return document.createElement('div');
    const q = test.questions[state.currentQuestion];
    const total = test.questions.length;
    const answered = Object.keys(state.testAnswers).length;
    const div = document.createElement('div');
    div.className = 'page';
    
    const isUrgent = state.timerSecs < 60 && test.timeLimit;
    
    div.innerHTML = `
      <div class="test-header">
        <h2 style="margin:0">${escapeHtml(test.title)}</h2>
        ${test.timeLimit ? `<div class="timer ${isUrgent ? 'urgent' : ''}">${formatTime(state.timerSecs)}</div>` : ''}
      </div>
      <div class="test-progress-bar"><div class="test-progress-fill" style="width:${(answered / total * 100)}%"></div></div>
      <div style="text-align:right;font-size:12px;color:var(--text-muted);margin-top:-20px;margin-bottom:20px">Отвечено: ${answered} из ${total}</div>
      <div class="card">
        <div class="question-counter">Вопрос ${state.currentQuestion + 1} из ${total}</div>
        <div class="question-text">${escapeHtml(q.text)}</div>
        <div class="answers-grid" id="answers-grid"></div>
        <div class="nav-btns">
          <button class="btn btn-ghost" ${state.currentQuestion === 0 ? 'disabled' : ''} id="prev-btn">← Назад</button>
          <div><button class="btn btn-primary" id="next-btn">${state.currentQuestion < total - 1 ? 'Далее →' : '✔ Завершить тест'}</button></div>
        </div>
        <div class="q-dots" id="q-dots"></div>
      </div>
    `;
    
    const letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];
    const answersGrid = div.querySelector('#answers-grid');
    q.answers.forEach((ans, i) => {
      const isSelected = state.testAnswers[q.id] === ans.id;
      const btn = document.createElement('button');
      btn.className = `answer-option ${isSelected ? 'selected' : ''}`;
      btn.innerHTML = `<div class="answer-bubble">${letters[i]}</div><span>${escapeHtml(ans.text)}</span>`;
      btn.addEventListener('click', () => { state.testAnswers[q.id] = ans.id; render(); });
      answersGrid.appendChild(btn);
    });
    
    const prevBtn = div.querySelector('#prev-btn');
    prevBtn.addEventListener('click', () => { state.currentQuestion--; render(); });
    
    const nextBtn = div.querySelector('#next-btn');
    nextBtn.addEventListener('click', () => {
      if (state.currentQuestion < total - 1) { state.currentQuestion++; render(); }
      else { 
        const unanswered = total - answered; 
        if (unanswered === 0 || confirm(`Вы не ответили на ${unanswered} вопрос(а). Завершить тест?`)) submitTest(); 
      }
    });
    
    const dotsDiv = div.querySelector('#q-dots');
    test.questions.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `q-dot ${state.testAnswers[test.questions[i].id] ? 'answered' : ''} ${i === state.currentQuestion ? 'current' : ''}`;
      dot.textContent = i + 1;
      dot.addEventListener('click', () => { state.currentQuestion = i; render(); });
      dotsDiv.appendChild(dot);
    });
    
    return div;
  }
  
  function renderResult() {
    const r = state.lastResult;
    if (!r) return document.createElement('div');
    const pct = r.score;
    const passed = r.isPassed;
    const circumference = 2 * Math.PI * 54;
    const offset = circumference * (1 - pct / 100);
    const div = document.createElement('div');
    div.className = 'page';
    div.innerHTML = `
      <div class="result-score-ring">
        <svg viewBox="0 0 120 120">
          <circle class="ring-bg" cx="60" cy="60" r="54" stroke-dasharray="${circumference}" stroke-dashoffset="0"></circle>
          <circle class="ring-fill ${passed ? 'ring-passed' : 'ring-failed'}" cx="60" cy="60" r="54" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
        </svg>
        <div class="score-text"><span class="score-num" style="color:${passed ? 'var(--green)' : 'var(--red)'}">${pct}%</span><span class="score-label">Результат</span></div>
      </div>
      <div class="result-status" style="text-align: center; font-family: var(--font-heading); font-size: 28px; font-weight: 700; margin-bottom: 16px; color: ${passed ? 'var(--green)' : 'var(--red)'}">${passed ? '🎉 Тест пройден!' : '😔 Тест не пройден'}</div>
      <div class="result-subtitle" style="text-align: center; color: var(--text-secondary); margin-bottom: 32px;">Правильных ответов: ${r.correctAnswers} из ${r.totalQuestions} (порог: ${r.passScore}%)</div>
      <div style="display:flex;gap:16px;justify-content:center;margin-bottom:48px;flex-wrap:wrap"><button class="btn btn-primary" id="back-to-tests">↩ К тестам</button><button class="btn btn-outline" id="retake-test">🔄 Пересдать</button></div>
      <div class="card"><h2 style="margin-bottom:20px">Разбор ответов</h2><div id="review"></div></div>
    `;
    
    const backBtn = div.querySelector('#back-to-tests');
    backBtn.addEventListener('click', () => navigate('tests'));
    const retakeBtn = div.querySelector('#retake-test');
    retakeBtn.addEventListener('click', () => startTest(r.testId)); 
    
    const reviewDiv = div.querySelector('#review');
    r.review.forEach((item, i) => {
      const ri = document.createElement('div');
      ri.className = 'review-item';
      ri.innerHTML = `<div class="review-q">${i + 1}. ${escapeHtml(item.questionText)}</div>${item.selectedAnswerText ? `<span class="review-answer ${item.isCorrect ? 'review-correct' : 'review-wrong'}">${item.isCorrect ? '✓' : '✗'} Ваш ответ: ${escapeHtml(item.selectedAnswerText)}</span>` : `<span class="review-answer" style="background:var(--bg-secondary);color:var(--text-muted)">Нет ответа</span>`}${!item.isCorrect ? `<div style="margin-top:8px; font-size: 13px;">✅ Правильно: <span class="badge badge-pass" style="margin-left: 8px;">${escapeHtml(item.correctAnswerText)}</span></div>` : ''}`;
      reviewDiv.appendChild(ri);
    });
    return div;
  }