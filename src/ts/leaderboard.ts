import { api } from './api';

const container = document.getElementById('lb-rows')!;

function rankClass(i: number) {
  if (i === 0) return 'lb-rank top-1';
  if (i === 1) return 'lb-rank top-2';
  if (i === 2) return 'lb-rank top-3';
  return 'lb-rank';
}

async function load() {
  try {
    const data = await api.leaderboard(100);

    if (!data.length) {
      container.innerHTML = '<div class="lb-empty">No players ranked yet.</div>';
      return;
    }

    container.innerHTML = data.map((p: any, i: number) => {
      const winRate = p.matchesPlayed > 0
        ? Math.round((p.wins / p.matchesPlayed) * 100) + '%'
        : '—';
      return `
        <div class="lb-row">
          <span class="${rankClass(i)}">#${i + 1}</span>
          <span class="lb-name">${p.name}</span>
          <span class="lb-rating">${p.rating}</span>
          <span class="lb-wins">${p.wins}</span>
          <span class="lb-losses">${p.losses}</span>
          <span class="lb-winrate">${winRate}</span>
        </div>`;
    }).join('');
  } catch {
    container.innerHTML = '<div class="lb-error">Failed to load leaderboard.</div>';
  }
}

load();
