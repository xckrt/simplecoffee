async function loadLessons() {
    state.loading = true;
    render();
    try { state.lessons = await apiFetch('/lessons'); } 
    catch (e) { throw e; }
    finally { state.loading = false; render(); }
  }
  
  async function completeLesson(id) {
    try {
      await apiFetch(`/lessons/${id}/complete`, { method: 'POST' });
      showToast('Отлично! Урок отмечен как пройденный.');
    } catch (e) { showToast(e.message, 'error'); }
    state.activeLessonId = null;
    await loadLessons();
  }
  
  async function createLesson(title, content) {
    await apiFetch('/lessons', {
      method: 'POST',
      body: JSON.stringify({ title, content, sortOrder: state.lessons.length + 1 })
    });
    await loadLessons();
  }
  
  function renderLessons() {
    const div = document.createElement('div');
    div.className = 'page-wide';
    div.innerHTML = `<h1>База знаний</h1><div class="subtitle">Учебные материалы, стандарты и мини-тесты</div>`;
    
    if (state.auth?.role === 'Manager') {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-outline';
      addBtn.style.marginBottom = '24px';
      addBtn.textContent = '+ Добавить новый урок';
      addBtn.addEventListener('click', showAddLessonModal);
      div.appendChild(addBtn);
    }
    
    if (state.activeLessonId) {
      const lesson = state.lessons.find(l => l.id === state.activeLessonId);
      return renderLessonView(lesson);
    }
    
    if (state.lessons.length === 0) { 
      div.innerHTML += '<div class="empty"><div class="empty-icon">📖</div><h3>Уроков пока нет</h3></div>'; 
      return div; 
    }
    
    const grid = document.createElement('div');
    grid.className = 'menu-grid';
    state.lessons.forEach(lesson => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => { state.activeLessonId = lesson.id; render(); });
      card.innerHTML = `
        <div class="menu-card-content">
          <div class="menu-card-cat">Урок ${lesson.sortOrder || 1}</div>
          <div class="menu-card-name">${escapeHtml(lesson.title)}</div>
          <div style="margin-top:12px;font-size:13px;color:${lesson.isCompleted ? 'var(--green)' : 'var(--accent)'}">${lesson.isCompleted ? '✅ Пройден' : '⏳ Требует изучения'}</div>
        </div>
      `;
      grid.appendChild(card);
    });
    div.appendChild(grid);
    return div;
  }
  
  function renderLessonView(lesson) {
    const div = document.createElement('div');
    div.className = 'page';
    state.quizzesPassed = 0;
    div.innerHTML = `
      <button class="btn btn-ghost" style="margin-bottom:24px" id="back-to-lessons">← К списку уроков</button>
      <h1 style="margin-bottom:24px">${escapeHtml(lesson.title)}</h1>
      ${lesson.videoUrl && lesson.videoUrl.includes('http') ? `<iframe src="${lesson.videoUrl}" width="100%" height="400" style="border:none; border-radius:var(--r-md); margin-bottom:24px; box-shadow:var(--shadow-sm)"></iframe>` : ''}
      <div class="lesson-content card" id="lesson-content" style="padding: 40px;"></div>
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid var(--border)" id="action-div"></div>
    `;
    
    const backBtn = div.querySelector('#back-to-lessons');
    backBtn.addEventListener('click', () => { state.activeLessonId = null; render(); });
    
    const parsed = parseLessonContentWithQuizzes(lesson.content);
    const contentDiv = div.querySelector('#lesson-content');
    contentDiv.innerHTML = parsed.html;
    const actionDiv = div.querySelector('#action-div');
    
    if (lesson.isCompleted) {
      actionDiv.innerHTML = '<div class="success-msg" style="text-align:center;font-size:16px">✅ Урок успешно пройден!</div>';
    } else {
      const completeBtn = document.createElement('button');
      completeBtn.className = 'btn btn-primary';
      completeBtn.style.width = '100%';
      completeBtn.style.padding = '16px';
      completeBtn.style.fontSize = '16px';
      completeBtn.textContent = '✔ Я изучил материал';
      if (parsed.quizCount > 0) {
        completeBtn.disabled = true;
        completeBtn.textContent = `Сначала решите мини-тесты (Осталось: ${parsed.quizCount})`;
      }
      completeBtn.addEventListener('click', () => completeLesson(lesson.id));
      actionDiv.appendChild(completeBtn);
      
      setTimeout(() => {
        const quizBtns = document.querySelectorAll('.quiz-btn');
        quizBtns.forEach(btn => {
          btn.addEventListener('click', function(e) {
            const box = this.closest('.quiz-box');
            if (box.dataset.answered === "true") return;
  
            const isCorrect = this.dataset.ans === this.dataset.correct;
            const fb = document.getElementById(`fb-${this.dataset.qid}`);
            
            if (isCorrect) {
              fb.style.color = 'var(--green)';
              fb.textContent = '✅ Верно!';
              this.style.background = 'var(--green)';
              this.style.color = 'white';
              this.style.borderColor = 'var(--green)';
              box.dataset.answered = "true";
  
              const allBtnsInBox = box.querySelectorAll('.quiz-btn');
              allBtnsInBox.forEach(b => {
                b.disabled = true;
                b.style.cursor = 'default';
                if (b !== this) b.style.opacity = '0.4';
              });
  
              state.quizzesPassed++;
              if (state.quizzesPassed >= parsed.quizCount) {
                completeBtn.disabled = false;
                completeBtn.textContent = '✔ Я изучил материал (Тесты пройдены!)';
              } else {
                completeBtn.textContent = `Сначала решите мини-тесты (Осталось: ${parsed.quizCount - state.quizzesPassed})`;
              }
            } else {
              fb.style.color = 'var(--red)';
              fb.textContent = '❌ Ошибка. Выбери другой вариант.';
              this.disabled = true;
              this.style.opacity = '0.4';
              this.style.cursor = 'default';
            }
          });
        });
      }, 100);
    }
    return div;
  }