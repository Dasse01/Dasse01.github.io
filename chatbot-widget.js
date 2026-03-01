(function() {
  // ─── 설정 ─────────────────────────────────────────────
  // ★ 아래 URL을 실제 서버 주소로 변경하세요
  const API_URL = 'https://ai-chatbot-server-34um.onrender.com';
  // 개발 시: const API_URL = 'http://localhost:5001';

  let sessionId = localStorage.getItem('chatbot_session') || '';
  let isOpen = false;
  let isStreaming = false;

  // ─── 스타일 주입 ──────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');

    /* 챗봇 토글 버튼 */
    #hw-chat-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4), 0 0 40px rgba(124, 58, 237, 0.15);
      z-index: 99998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    #hw-chat-toggle:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(79, 70, 229, 0.5), 0 0 50px rgba(124, 58, 237, 0.2);
    }

    #hw-chat-toggle svg {
      width: 28px;
      height: 28px;
      fill: white;
      transition: transform 0.3s ease;
    }

    #hw-chat-toggle.open svg {
      transform: rotate(90deg);
    }

    /* 알림 뱃지 */
    #hw-chat-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
      display: none;
    }

    /* 챗봇 컨테이너 */
    #hw-chat-container {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 120px);
      border-radius: 20px;
      overflow: hidden;
      z-index: 99999;
      font-family: 'Noto Sans KR', -apple-system, sans-serif;
      display: none;
      flex-direction: column;
      box-shadow: 0 12px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    #hw-chat-container.visible {
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* 모바일 반응형 */
    @media (max-width: 480px) {
      #hw-chat-container {
        width: calc(100vw - 16px);
        height: calc(100vh - 80px);
        max-height: calc(100vh - 80px);
        bottom: 8px;
        right: 8px;
        border-radius: 16px;
      }

      #hw-chat-toggle {
        bottom: 16px;
        right: 16px;
      }
    }

    /* 헤더 */
    #hw-chat-header {
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f5e 100%);
      padding: 20px 20px 16px;
      position: relative;
      overflow: hidden;
    }

    #hw-chat-header::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      top: -80px;
      right: -60px;
      border-radius: 50%;
    }

    .hw-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }

    .hw-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hw-header-avatar {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
    }

    .hw-header-text h3 {
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .hw-header-text p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
      margin: 2px 0 0;
    }

    .hw-status-dot {
      width: 8px;
      height: 8px;
      background: #34d399;
      border-radius: 50%;
      display: inline-block;
      margin-right: 4px;
      animation: hw-pulse 2s ease-in-out infinite;
    }

    @keyframes hw-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .hw-header-actions {
      display: flex;
      gap: 4px;
    }

    .hw-header-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 14px;
    }

    .hw-header-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    /* 메시지 영역 */
    #hw-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #0d1129;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }

    #hw-chat-messages::-webkit-scrollbar {
      width: 4px;
    }

    #hw-chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    #hw-chat-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    /* 메시지 버블 */
    .hw-msg {
      display: flex;
      gap: 8px;
      animation: hw-fadeIn 0.3s ease;
    }

    @keyframes hw-fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hw-msg-avatar {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .hw-msg-bot .hw-msg-bubble {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.88);
      border-radius: 4px 16px 16px 16px;
    }

    .hw-msg-user {
      flex-direction: row-reverse;
    }

    .hw-msg-user .hw-msg-bubble {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      border-radius: 16px 4px 16px 16px;
      border: none;
    }

    .hw-msg-bubble {
      max-width: 280px;
      padding: 12px 16px;
      font-size: 13.5px;
      line-height: 1.65;
      letter-spacing: -0.01em;
      word-break: keep-all;
      overflow-wrap: break-word;
    }

    .hw-msg-bubble p { margin: 0 0 8px; }
    .hw-msg-bubble p:last-child { margin-bottom: 0; }
    .hw-msg-bubble strong { color: #a5b4fc; font-weight: 600; }
    .hw-msg-bubble ul, .hw-msg-bubble ol { margin: 4px 0; padding-left: 20px; }
    .hw-msg-bubble li { margin-bottom: 4px; }
    .hw-msg-bubble code {
      background: rgba(255,255,255,0.08);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 12px;
    }

    /* 타이핑 인디케이터 */
    .hw-typing {
      display: flex;
      gap: 4px;
      padding: 4px 0;
    }

    .hw-typing span {
      width: 6px;
      height: 6px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      animation: hw-typing 1.4s ease-in-out infinite;
    }

    .hw-typing span:nth-child(2) { animation-delay: 0.2s; }
    .hw-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes hw-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    /* 퀵 액션 버튼 */
    .hw-quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 16px 4px;
      background: #0d1129;
    }

    .hw-quick-btn {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid rgba(99, 102, 241, 0.3);
      background: rgba(99, 102, 241, 0.08);
      color: #a5b4fc;
      font-size: 12px;
      font-family: 'Noto Sans KR', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .hw-quick-btn:hover {
      background: rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.5);
      color: white;
    }

    /* 입력 영역 */
    #hw-chat-input-area {
      padding: 12px 16px 14px;
      background: #0f1336;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .hw-input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 4px 4px 4px 16px;
      transition: border-color 0.2s;
    }

    .hw-input-wrapper:focus-within {
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    #hw-chat-input {
      flex: 1;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-family: 'Noto Sans KR', sans-serif;
      padding: 8px 0;
      outline: none;
      resize: none;
      max-height: 80px;
      line-height: 1.5;
    }

    #hw-chat-input::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }

    #hw-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    #hw-send-btn:hover {
      background: linear-gradient(135deg, #4338ca, #4f46e5);
      transform: scale(1.05);
    }

    #hw-send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }

    #hw-send-btn svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    .hw-footer-text {
      text-align: center;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.2);
      margin-top: 6px;
      letter-spacing: -0.01em;
    }

    /* 웰컴 메시지 */
    .hw-welcome {
      text-align: center;
      padding: 30px 20px;
    }

    .hw-welcome-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
      font-size: 24px;
    }

    .hw-welcome h4 {
      color: white;
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 6px;
    }

    .hw-welcome p {
      color: rgba(255,255,255,0.45);
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  // ─── HTML 구조 생성 ───────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'hw-chatbot-widget';
  widget.innerHTML = `
    <!-- 토글 버튼 -->
    <button id="hw-chat-toggle" aria-label="채팅 열기">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
      <div id="hw-chat-badge"></div>
    </button>

    <!-- 챗봇 창 -->
    <div id="hw-chat-container">
      <!-- 헤더 -->
      <div id="hw-chat-header">
        <div class="hw-header-top">
          <div class="hw-header-info">
            <div class="hw-header-avatar">H5</div>
            <div class="hw-header-text">
              <h3>AI 입시 상담</h3>
              <p><span class="hw-status-dot"></span>김휘창입시컨설팅</p>
            </div>
          </div>
          <div class="hw-header-actions">
            <button class="hw-header-btn" id="hw-btn-reset" title="대화 초기화">↺</button>
            <button class="hw-header-btn" id="hw-btn-close" title="닫기">✕</button>
          </div>
        </div>
      </div>

      <!-- 메시지 영역 -->
      <div id="hw-chat-messages">
        <div class="hw-welcome">
          <div class="hw-welcome-icon">🎓</div>
          <h4>AI 입시 상담에 오신 것을 환영합니다!</h4>
          <p>수시·정시·학생부·면접 등<br>입시에 대해 무엇이든 물어보세요.</p>
        </div>
      </div>

      <!-- 퀵 액션 -->
      <div class="hw-quick-actions" id="hw-quick-actions">
        <button class="hw-quick-btn" data-msg="수시 전형 종류와 준비 방법을 알려주세요">📚 수시 전형</button>
        <button class="hw-quick-btn" data-msg="정시 배치 상담을 받고 싶습니다">📊 정시 배치</button>
        <button class="hw-quick-btn" data-msg="학생부 분석은 어떻게 하나요?">📝 학생부 분석</button>
        <button class="hw-quick-btn" data-msg="면접 준비 방법을 알려주세요">🎤 면접 준비</button>
      </div>

      <!-- 입력 영역 -->
      <div id="hw-chat-input-area">
        <div class="hw-input-wrapper">
          <textarea id="hw-chat-input" placeholder="입시에 대해 물어보세요..." rows="1"></textarea>
          <button id="hw-send-btn" aria-label="전송">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <div class="hw-footer-text">김휘창입시컨설팅 · AI 입시 에이전트</div>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // ─── 요소 참조 ────────────────────────────────────────
  const toggle = document.getElementById('hw-chat-toggle');
  const container = document.getElementById('hw-chat-container');
  const messages = document.getElementById('hw-chat-messages');
  const input = document.getElementById('hw-chat-input');
  const sendBtn = document.getElementById('hw-send-btn');
  const closeBtn = document.getElementById('hw-btn-close');
  const resetBtn = document.getElementById('hw-btn-reset');
  const quickActions = document.getElementById('hw-quick-actions');
  const badge = document.getElementById('hw-chat-badge');

  // ─── 토글 ─────────────────────────────────────────────
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      container.style.display = 'flex';
      requestAnimationFrame(() => {
        container.classList.add('visible');
      });
      toggle.classList.add('open');
      badge.style.display = 'none';
      input.focus();
    } else {
      closeChat();
    }
  });

  closeBtn.addEventListener('click', closeChat);

  function closeChat() {
    isOpen = false;
    container.classList.remove('visible');
    toggle.classList.remove('open');
    setTimeout(() => {
      container.style.display = 'none';
    }, 350);
  }

  // ─── 메시지 전송 ──────────────────────────────────────
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // textarea 자동 높이 조절
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isStreaming) return;

    // 퀵 액션 숨기기
    quickActions.style.display = 'none';

    // 사용자 메시지 표시
    addMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';

    // 타이핑 표시
    const typingEl = addTyping();
    isStreaming = true;
    sendBtn.disabled = true;

    try {
      // 스트리밍 API 호출
      const response = await fetch(API_URL + '/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      // 타이핑 제거, 봇 메시지 생성
      typingEl.remove();
      const botBubble = addMessage('', 'bot');
      const bubbleContent = botBubble.querySelector('.hw-msg-bubble');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.session_id) {
                sessionId = data.session_id;
                localStorage.setItem('chatbot_session', sessionId);
              }

              if (data.text) {
                fullText += data.text;
                bubbleContent.innerHTML = formatMessage(fullText);
                scrollToBottom();
              }

              if (data.error) {
                bubbleContent.textContent = data.error;
              }
            } catch (e) {
              // JSON 파싱 오류 무시
            }
          }
        }
      }

    } catch (error) {
      typingEl.remove();

      // 스트리밍 실패 시 일반 API로 폴백
      try {
        const res = await fetch(API_URL + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, session_id: sessionId })
        });
        const data = await res.json();

        if (data.response) {
          sessionId = data.session_id || sessionId;
          localStorage.setItem('chatbot_session', sessionId);
          const bubble = addMessage(data.response, 'bot');
          bubble.querySelector('.hw-msg-bubble').innerHTML = formatMessage(data.response);
        } else {
          addMessage(data.error || '응답을 받지 못했습니다.', 'bot');
        }
      } catch (e2) {
        addMessage('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', 'bot');
      }
    }

    isStreaming = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ─── 메시지 렌더링 ────────────────────────────────────
  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `hw-msg hw-msg-${sender}`;

    if (sender === 'bot') {
      div.innerHTML = `
        <div class="hw-msg-avatar">AI</div>
        <div class="hw-msg-bubble">${formatMessage(text)}</div>
      `;
    } else {
      div.innerHTML = `
        <div class="hw-msg-bubble">${escapeHtml(text)}</div>
      `;
    }

    messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'hw-msg hw-msg-bot';
    div.innerHTML = `
      <div class="hw-msg-avatar">AI</div>
      <div class="hw-msg-bubble">
        <div class="hw-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  }

  // ─── 마크다운 간이 렌더링 ──────────────────────────────
  function formatMessage(text) {
    if (!text) return '';

    let html = escapeHtml(text);

    // 볼드
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 인라인 코드
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // 리스트
    html = html.replace(/^[-•] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // 번호 리스트
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // 줄바꿈
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // 이모지 체크마크
    html = html.replace(/✔/g, '<span style="color:#34d399">✔</span>');

    if (!html.startsWith('<')) html = '<p>' + html + '</p>';

    return html;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ─── 퀵 액션 ──────────────────────────────────────────
  quickActions.addEventListener('click', (e) => {
    const btn = e.target.closest('.hw-quick-btn');
    if (btn) {
      input.value = btn.dataset.msg;
      sendMessage();
    }
  });

  // ─── 초기화 ───────────────────────────────────────────
  resetBtn.addEventListener('click', async () => {
    if (!confirm('대화 내용을 초기화하시겠습니까?')) return;

    try {
      await fetch(API_URL + '/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
    } catch (e) { /* ignore */ }

    sessionId = '';
    localStorage.removeItem('chatbot_session');

    // 메시지 영역 초기화
    messages.innerHTML = `
      <div class="hw-welcome">
        <div class="hw-welcome-icon">🎓</div>
        <h4>AI 입시 상담에 오신 것을 환영합니다!</h4>
        <p>수시·정시·학생부·면접 등<br>입시에 대해 무엇이든 물어보세요.</p>
      </div>
    `;
    quickActions.style.display = 'flex';
  });

  // ─── 3초 후 뱃지 표시 (첫 방문 유도) ─────────────────
  setTimeout(() => {
    if (!isOpen) badge.style.display = 'block';
  }, 3000);

})();
