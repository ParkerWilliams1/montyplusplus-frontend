import { api, createSocket, requireAuth, clearSession } from './api';

const session = requireAuth();
if (!session) throw new Error('unauthenticated');

let ws: WebSocket | null = null;
let currentMatch: { matchId: string; mode: string; problem: any } | null = null;
let timerInterval: ReturnType<typeof setInterval> | null = null;

const screens: Record<string, HTMLElement> = {
  lobby:   document.getElementById('screen-lobby')!,
  waiting: document.getElementById('screen-waiting')!,
  game:    document.getElementById('screen-game')!,
  result:  document.getElementById('screen-result')!,
};

const el = (id: string) => document.getElementById(id)!;

function showScreen(name: string) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

el('user-name').textContent = session.name;

const profileBtn = document.getElementById('profile-btn') as HTMLAnchorElement | null;
if (profileBtn) profileBtn.href = '/profile.html?id=' + session.id;

el('logout-btn').addEventListener('click', () => {
  clearSession();
  location.href = '/auth.html';
});



document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});

el('find-match-btn').addEventListener('click', () => {
  const selected = document.querySelector<HTMLElement>('.mode-card.selected');
  if (!selected) return showFlash('lobby-flash', 'Select a mode first.', 'error');
  startMatchmaking(selected.dataset.mode!);
});

el('cancel-btn').addEventListener('click', () => {
  if (ws) { ws.close(); ws = null; }
  showScreen('lobby');
});

function startMatchmaking(mode: string) {
  showScreen('waiting');
  el('waiting-mode').textContent = mode.toUpperCase();
  ws = createSocket(handleMessage);
  ws.addEventListener('open', () => {
    ws!.send(JSON.stringify({ type: 'matchmake', userId: session.id, mode }));
  });
  ws.addEventListener('close', () => {
    if (currentMatch) return;
    showScreen('lobby');
  });
}

function handleMessage(msg: any) {
  switch (msg.event) {
    case 'waiting':
      break;
    case 'match_found':
      currentMatch = { matchId: msg.matchId, mode: msg.mode, problem: msg.problem };
      loadGame(msg);
      break;
    case 'judging':
      (el('submit-btn') as HTMLButtonElement).disabled = true;
      el('submit-status').textContent = 'Judging...';
      el('submit-status').className = 'flash flash-info';
      el('submit-status').classList.remove('hidden');
      break;
    case 'submit_result':
      (el('submit-btn') as HTMLButtonElement).disabled = false;
      handleSubmitResult(msg);
      break;
    case 'opponent_submitted':
      el('opponent-status').textContent = 'Opponent submitted — judging in progress';
      el('opponent-status').classList.remove('hidden');
      break;
    case 'match_ended':
      handleMatchEnded(msg);
      break;
    case 'error':
      showFlash('game-flash', msg.message, 'error');
      break;
  }
}

function loadGame(msg: any) {
  const p = msg.problem;
  el('game-title').textContent = p.title;
  el('game-mode').textContent = msg.mode.toUpperCase();
  el('game-description').textContent = p.description;
  el('game-input-format').textContent = p.input_format;
  el('game-output-format').textContent = p.output_format;
  el('game-examples').innerHTML = p.public_test_cases.map((tc: any, i: number) => `
    <div class="test-case">
      <div class="test-case-header">Example ${i + 1}</div>
      <div class="test-case-body">
        <div class="test-row"><span class="test-row-label">In</span><pre>${tc.input}</pre></div>
        <div class="test-row"><span class="test-row-label">Out</span><pre>${tc.output}</pre></div>
      </div>
    </div>`).join('');
  el('submit-status').classList.add('hidden');
  el('opponent-status').classList.add('hidden');
  (el('code-input') as HTMLTextAreaElement).value = '';
  if (timerInterval) clearInterval(timerInterval);
  if (msg.mode === 'golf' || msg.mode === 'trials') {
    startTimer(5 * 60 * 1000);
  } else {
    el('timer').classList.add('hidden');
  }
  showScreen('game');
}

function startTimer(ms: number) {
  const timerEl = el('timer');
  timerEl.classList.remove('hidden', 'urgent');
  let remaining = ms;
  const update = () => {
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (remaining <= 30000) timerEl.classList.add('urgent');
  };
  update();
  timerInterval = setInterval(() => {
    remaining -= 1000;
    if (remaining <= 0) { clearInterval(timerInterval!); timerEl.textContent = '00:00'; }
    else update();
  }, 1000);
}

el('submit-btn').addEventListener('click', () => {
  const code = (el('code-input') as HTMLTextAreaElement).value.trim();
  if (!code || !currentMatch || !ws) return;
  ws.send(JSON.stringify({ type: 'submit', userId: session.id, matchId: currentMatch.matchId, code }));
});

function handleSubmitResult(msg: any) {
  const s = el('submit-status');
  s.className = 'flash';
  s.classList.remove('hidden');
  if (msg.status === 'accepted') {
    s.textContent = '✓ Accepted';
    s.classList.add('flash-success');
  } else if (msg.status === 'compile_error') {
    s.textContent = `Compile error: ${msg.detail}`;
    s.classList.add('flash-error');
  } else if (msg.status === 'wrong_answer') {
    s.textContent = msg.detail || 'Wrong answer';
    s.classList.add('flash-error');
  } else if (msg.status === 'too_late') {
    s.textContent = 'Match already ended.';
    s.classList.add('flash-info');
  }
}

function handleMatchEnded(msg: any) {
  if (timerInterval) clearInterval(timerInterval);
  currentMatch = null;
  const won  = msg.winnerId === session.id;
  const draw = !msg.winnerId;
  const badge   = el('result-badge');
  const heading = el('result-heading');
  if (draw) {
    badge.textContent = '🤝';
    badge.className = 'result-badge draw';
    heading.textContent = 'No winner';
    heading.className = 'result-heading draw';
  } else if (won) {
    badge.textContent = '🏆';
    badge.className = 'result-badge win';
    heading.textContent = 'Victory';
    heading.className = 'result-heading win';
  } else {
    badge.textContent = '💀';
    badge.className = 'result-badge loss';
    heading.textContent = 'Defeated';
    heading.className = 'result-heading loss';
  }
  el('result-reason').textContent = formatReason(msg.reason);
  showScreen('result');
}

function formatReason(reason: string): string {
  return ({
    first_correct:        'First correct solution',
    both_solved:          'Both solved — tiebreak applied',
    timeout:              'Time expired',
    timeout_no_solutions: 'Time expired with no passing solutions',
    forfeit:              'Opponent disconnected',
    complete:             '',
  } as Record<string, string>)[reason] ?? reason;
}

el('play-again-btn').addEventListener('click', () => {
  if (ws) { ws.close(); ws = null; }
  showScreen('lobby');
});

el('back-lobby-btn').addEventListener('click', () => {
  if (ws) { ws.close(); ws = null; }
  showScreen('lobby');
});

function showFlash(id: string, msg: string, type: string) {
  const el2 = el(id);
  if (!el2) return;
  el2.textContent = msg;
  el2.className = `flash flash-${type}`;
  el2.classList.remove('hidden');
  setTimeout(() => el2.classList.add('hidden'), 4000);
}
