function parseLessonContentWithQuizzes(content) {
    const quizRegex = /\[QUIZ:\s*(.*?)\s*\|(.*?)CORRECT:\s*(\d+)\]/g;
    let quizCount = 0;
    
    let html = content.replace(quizRegex, (match, question, answersStr, correctIdx) => {
      quizCount++;
      const qid = 'quiz_' + Math.floor(Math.random() * 10000);
      
      const answers = answersStr.split('|').map(a => a.trim()).filter(a => a.length > 0);
        
      let buttonsHtml = '';
      answers.forEach((ans, index) => {
        buttonsHtml += `
          <button class="btn btn-outline quiz-btn" style="flex: 1 1 45%; padding: 14px; font-size: 15px;" 
                  data-qid="${qid}" 
                  data-ans="${index}" 
                  data-correct="${correctIdx}">${escapeHtml(ans)}</button>
        `;
      });
  
      return `
        <div class="quiz-box" data-quiz="true" data-answered="false">
          <h4>⚡ Проверка знаний: ${escapeHtml(question)}</h4>
          <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top: 20px;">
            ${buttonsHtml}
          </div>
          <div class="quiz-feedback" id="fb-${qid}"></div>
        </div>
      `;
    });
    
    return { html, quizCount };
  }