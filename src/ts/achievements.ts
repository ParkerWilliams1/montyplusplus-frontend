interface Achievement {
  icon: string;
  name: string;
  desc: string;
  quote: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  date?: string;
}

const achievements: Achievement[] = [
  {
    icon: '🐴',
    name: 'Clip Clop Compiler',
    desc: 'Submit your very first solution.',
    quote: '"It\'s just a flesh wound." — First bug encountered',
    rarity: 'common',
    unlocked: true,
    date: 'Mar 1'
  },
  {
    icon: '🐇',
    name: 'Run Away!',
    desc: 'Reset your code 5 times on a single problem without submitting.',
    quote: '"Run away! Run away!" — King Arthur',
    rarity: 'common',
    unlocked: true,
    date: 'Mar 3'
  },
  {
    icon: '🌴',
    name: 'African or European?',
    desc: 'Solve a problem involving string parsing.',
    quote: '"What is the airspeed velocity of an unladen swallow?"',
    rarity: 'common',
    unlocked: true,
    date: 'Mar 8'
  },
  {
    icon: '🗡️',
    name: 'None Shall Pass',
    desc: 'Achieve a perfect runtime on any hard problem.',
    quote: '"None shall pass." — The Black Knight',
    rarity: 'rare',
    unlocked: true,
    date: 'Mar 12'
  },
  {
    icon: '🐟',
    name: 'Strange Women in Ponds',
    desc: 'Solve 3 problems using dynamic programming.',
    quote: '"Strange women lying in ponds distributing swords is no basis for a system of government."',
    rarity: 'rare',
    unlocked: false
  },
  {
    icon: '💀',
    name: 'Bring Out Yer Dead',
    desc: 'Have 10 submissions time out.',
    quote: '"I\'m not dead yet!" — Your TLE solution',
    rarity: 'common',
    unlocked: false
  },
  {
    icon: '🐓',
    name: 'Knights Who Say Neet',
    desc: 'Complete all array & hashing problems.',
    quote: '"We are the knights who say... Neet!"',
    rarity: 'epic',
    unlocked: false
  },
  {
    icon: '🔵',
    name: 'Blue! No, Yellow!',
    desc: 'Fail a problem by one edge case after 10 attempts.',
    quote: '"Blue. No, yel—" *[screaming]*',
    rarity: 'rare',
    unlocked: false
  },
  {
    icon: '🐰',
    name: 'Killer Rabbit of Caerbannog',
    desc: 'Solve an Easy-rated problem that has a <15% acceptance rate.',
    quote: '"That\'s the most foul, cruel, and bad-tempered rodent you ever set eyes on!"',
    rarity: 'epic',
    unlocked: false
  },
  {
    icon: '🏰',
    name: 'Castle Aaaargh',
    desc: 'Submit a solution and immediately close the tab.',
    quote: '"It\'s only a model." — Patsy',
    rarity: 'common',
    unlocked: false
  },
  {
    icon: '✝️',
    name: 'Holy Hand Grenade',
    desc: 'Solve a problem with a one-liner.',
    quote: '"...And the Lord spake, saying, First shalt thou take out the Holy Pin."',
    rarity: 'legendary',
    unlocked: false
  },
  {
    icon: '👑',
    name: 'King of the Britons',
    desc: 'Reach #1 on the weekly leaderboard.',
    quote: '"I am Arthur, King of the Britons!" — You, hopefully',
    rarity: 'legendary',
    unlocked: false
  }
];

const grid = document.getElementById('grid') as HTMLDivElement;

function renderCards(list: Achievement[]): void {
  grid.innerHTML = '';
  list.forEach(a => {
    const card = document.createElement('div');
    card.className = 'card ' + (a.unlocked ? 'unlocked' : 'locked');
    card.dataset.rarity = a.rarity;
    card.dataset.unlocked = String(a.unlocked);
    card.innerHTML = `
      <div class="card-icon">${a.icon}</div>
      <div class="card-body">
        <div class="card-name">${a.name}</div>
        <div class="card-desc">${a.desc}</div>
        <div class="card-quote">${a.quote}</div>
        <div class="card-meta">
          <span class="card-rarity rarity-${a.rarity}">${a.rarity}</span>
          <span class="card-status">
            <span class="status-dot"></span>
            ${a.unlocked ? 'Unlocked ' + a.date : 'Locked'}
          </span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function filterCards(filter: string, btn: HTMLButtonElement): void {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  let filtered = achievements;
  if (filter === 'unlocked') filtered = achievements.filter(a => a.unlocked);
  if (filter === 'locked') filtered = achievements.filter(a => !a.unlocked);
  if (filter === 'legendary') filtered = achievements.filter(a => a.rarity === 'legendary');
  renderCards(filtered);
}

// Make filterCards available globally for onclick handlers
(window as any).filterCards = filterCards;

renderCards(achievements);
