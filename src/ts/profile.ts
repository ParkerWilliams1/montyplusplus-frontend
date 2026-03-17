import { api, getSession, clearSession } from './api';

const session = getSession();
const params  = new URLSearchParams(location.search);
const profileId = params.get('id') || session?.id;
const isOwn   = session && profileId === String(session.id);

const el = (id: string) => document.getElementById(id)!;

el('logout-btn').addEventListener('click', () => {
  clearSession();
  location.href = '/auth.html';
});

if (!isOwn) {
  el('logout-btn').classList.add('hidden');
}

function initials(name: string) {
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function loadProfile() {
  if (!profileId) {
    location.href = '/auth.html';
    return;
  }

  try {
    const user = await api.getProfile(profileId);

    el('profile-avatar').textContent = initials(user.name);
    el('profile-name').textContent   = user.name;
    el('profile-meta').textContent   = `Rank #${user.rank} · Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    el('stat-rating').textContent    = user.rating;
    el('stat-rank').textContent      = `#${user.rank}`;
    el('stat-wins').textContent      = user.wins;
    el('stat-losses').textContent    = user.losses;

    const total = user.wins + user.losses;
    const winPct = total > 0 ? (user.wins / total) * 100 : 0;
    (el('record-wins-bar') as HTMLElement).style.width  = `${winPct}%`;
    (el('record-losses-bar') as HTMLElement).style.width = `${100 - winPct}%`;
    el('legend-wins').textContent   = `${user.wins} win${user.wins !== 1 ? 's' : ''}`;
    el('legend-losses').textContent = `${user.losses} loss${user.losses !== 1 ? 'es' : ''}`;
    if (user.winRate !== null) {
      el('legend-winrate').textContent = `${user.winRate}% win rate`;
    }

    if (isOwn) renderEditPanel(user);
  } catch {
    el('profile-name').textContent = 'Player not found';
  }
}

function renderEditPanel(user: any) {
  const panel = el('edit-panel');
  panel.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">Edit profile</span>
    </div>
    <div class="edit-form">
      <div class="form-group">
        <label for="edit-name">Display name</label>
        <div class="edit-row">
          <input id="edit-name" type="text" value="${user.name}" placeholder="Display name">
          <button id="save-name-btn" class="btn btn-primary btn-sm">Save</button>
        </div>
        <div id="name-msg" class="flash hidden"></div>
      </div>
      <div class="divider"></div>
      <div class="form-group">
        <label>Change password</label>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <input id="cur-password" type="password" placeholder="Current password">
          <input id="new-password" type="password" placeholder="New password (8+ chars)">
        </div>
        <div style="margin-top:0.5rem;">
          <button id="save-password-btn" class="btn btn-ghost btn-sm">Update password</button>
        </div>
        <div id="password-msg" class="flash hidden"></div>
      </div>
    </div>`;

  el('save-name-btn').addEventListener('click', async () => {
    const btn  = el('save-name-btn') as HTMLButtonElement;
    const name = (el('edit-name') as HTMLInputElement).value.trim();
    const msg  = el('name-msg');
    msg.className = 'flash hidden';
    if (!name) return;
    btn.disabled = true;
    try {
      await api.updateProfile(profileId!, name);
      msg.textContent = 'Name updated.';
      msg.className = 'flash flash-success';
      el('profile-name').textContent = name;
      el('profile-avatar').textContent = initials(name);
    } catch (err: any) {
      msg.textContent = err.message;
      msg.className = 'flash flash-error';
    } finally {
      btn.disabled = false;
    }
  });

  el('save-password-btn').addEventListener('click', async () => {
    const btn  = el('save-password-btn') as HTMLButtonElement;
    const cur  = (el('cur-password') as HTMLInputElement).value;
    const next = (el('new-password') as HTMLInputElement).value;
    const msg  = el('password-msg');
    msg.className = 'flash hidden';
    if (!cur || !next) return;
    btn.disabled = true;
    try {
      await api.changePassword(profileId!, cur, next);
      msg.textContent = 'Password updated.';
      msg.className = 'flash flash-success';
      (el('cur-password') as HTMLInputElement).value = '';
      (el('new-password') as HTMLInputElement).value = '';
    } catch (err: any) {
      msg.textContent = err.message;
      msg.className = 'flash flash-error';
    } finally {
      btn.disabled = false;
    }
  });
}

async function loadHistory() {
  if (!profileId) return;
  try {
    const { matches } = await api.matchHistory(profileId, 20);
    if (!matches.length) {
      el('history-rows').innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-3);font-size:0.875rem;">No matches yet.</div>';
      return;
    }
    el('history-rows').innerHTML = matches.map((m: any) => `
      <div class="history-row">
        <span class="history-outcome ${m.outcome}">${m.outcome === 'in_progress' ? 'Live' : m.outcome.toUpperCase()}</span>
        <span class="history-problem">${m.problemTitle || '—'}</span>
        <span class="history-mode">${m.mode || '—'}</span>
        <span class="history-date">${m.startedAt ? timeAgo(m.startedAt) : '—'}</span>
      </div>`).join('');
  } catch {
    el('history-rows').innerHTML = '<div style="padding:2rem;text-align:center;color:var(--red);font-size:0.875rem;">Failed to load history.</div>';
  }
}

loadProfile();
loadHistory();
