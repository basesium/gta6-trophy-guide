// Leonida Platinum — offline GTA VI trophy tracker.
// Loads its own data/trophies.json, renders the checklist, saves progress
// in localStorage, and offers export / import. No network at run time.

const STORAGE_KEY = 'gta6-trophy-guide-v1';
const DATA_URL = 'data/trophies.json';

const KIND_LABELS = {
  all: 'All 55',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

const KIND_HINTS = {
  all: 'Showing every trophy. Tick a trophy when you earn it — progress saves in this browser.',
  story: 'Story trophies: chapters, story missions and side-story finales. They unlock as you play; only the Chapter 1 meditation can be missed.',
  missable: 'The one trophy that can be missed. Do the Chapter 1 balcony meditation before that chapter ends.',
  collectibles: 'Counted sets to finish across Leonida: card sets, WAiNK spots, vehicles, places, vaults and one unique animal.',
  activities: 'Open-world activities, races, robberies, challenges and one-off feats. Most stay open after the story.',
  online: 'GTA VI has no online trophies — the whole list is single-player, so this filter is empty by design.',
};

// Six stages of the road to the platinum, by trophy id (1-based, in
// data/trophies.json order). Built from the official descriptions.
const ROADMAP = [
  {
    title: 'Play the story, Chapters 1–4',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 28],
    text: 'Finish Gone Fishing, all four chapters, the final mission and the six big story missions (Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory). Do Lucia\u2019s balcony meditation in Chapter 1 before that chapter ends — it is the list\u2019s only missable step.',
  },
  {
    title: 'Side stories across Leonida',
    ids: [22, 23, 24, 26, 27, 25, 29],
    text: 'Finish the stranger strands to their finales: Andy, Kenton, Billy, Randy and Tyrone each have a final mission, eight strands in all count toward Strangers & Freaks, and Bret\u2019s hunting strand ends with a unique animal.',
  },
  {
    title: 'Partner & free-roam firsts',
    ids: [33, 34, 47, 36, 37, 38, 39, 41, 19, 20, 21],
    text: 'Once Jason and Lucia can play together, use the partner for the co-op feats: lose a 4-star Wanted level together, rob three shops back-to-back, train together to max Strength. Around the same time, try the one-offs: the VCIA jet, the tank, the jewelry store, the armored truck, races, fishing against Cal and an arcade game.',
  },
  {
    title: 'Robberies & money',
    ids: [40, 43, 52, 53, 54, 55],
    text: 'Bank vaults open late in Chapter 4, then rob one illegal operation for each of the nine gangs, launder $250,000 of Marked Bills through your contacts, spend $100,000 across the shops, buy all eight garages and register ten vehicles to the Scooter Bros app.',
  },
  {
    title: 'Collectibles & exploration',
    ids: [30, 31, 35, 42, 15, 17, 18],
    text: 'The long counts: 3 Collectible Card sets, WAiNK at 100 locations, 100 vehicles discovered, all 52 places of Leonida explored, 250 stunts, gold in all 42 Shooting Range challenges and a Top Fun drone race win at every one of the 14 locations.',
  },
  {
    title: 'Clean-up & the platinum',
    ids: [1, 14, 16, 32, 44, 45, 46, 48, 49, 50, 51],
    text: 'After the credits the 100% checklist appears under Progress > Stats > 100% Completion. Finish the last 50 Challenges, try each of the 9 activity types once, mop up the hidden one-offs (bowling, the cocktail, the showroom, the 500 criminal-profile actions), and Vice Got a Price! pops with the platinum.',
  },
];

let trophies = [];
let earned = new Set();
let spoilersOn = true;
let activeKind = 'all';
let searchText = '';

const listEl = document.getElementById('trophyList');
const summaryEl = document.getElementById('listSummary');
const progressTextEl = document.getElementById('progressText');
const progressChipEl = document.getElementById('progressChip');
const progressBarEl = document.getElementById('progressBar');
const progressFillEl = document.getElementById('progressFill');
const hintEl = document.getElementById('filterHint');
const emptyEl = document.getElementById('emptyState');
const spoilerBtn = document.getElementById('spoilerBtn');

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.earned)) earned = new Set(saved.earned.map(Number));
    if (typeof saved.spoilers === 'boolean') spoilersOn = saved.spoilers;
  } catch (err) {
    earned = new Set();
    spoilersOn = true;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    earned: [...earned].sort((a, b) => a - b),
    spoilers: spoilersOn,
  }));
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isHiddenBySpoilers(trophy) {
  return spoilersOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

function trophyCard(trophy) {
  const article = document.createElement('article');
  article.className = 'trophy' + (earned.has(trophy.id) ? ' earned' : '');
  article.id = 'trophy-' + trophy.id;

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'trophy-check';
  check.checked = earned.has(trophy.id);
  check.setAttribute('aria-label', 'Earned: ' + trophy.name);
  check.addEventListener('change', () => {
    if (check.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveState();
    render();
    renderRoadmap();
  });
  article.appendChild(check);

  const body = document.createElement('div');
  body.className = 'trophy-body';

  const heading = document.createElement('h3');
  if (isHiddenBySpoilers(trophy)) {
    const hidden = document.createElement('span');
    hidden.className = 'hidden-name';
    hidden.textContent = 'Hidden story trophy — earn it to reveal its name';
    heading.appendChild(hidden);
  } else {
    heading.appendChild(document.createTextNode(trophy.name));
  }
  body.appendChild(heading);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isHiddenBySpoilers(trophy)
    ? 'Hidden until earned. Turn spoilers on to keep story trophies secret, or earn this one to reveal it.'
    : trophy.description;
  body.appendChild(desc);

  const meta = document.createElement('p');
  meta.className = 'trophy-meta';
  const kind = document.createElement('span');
  kind.className = 'kind-tag';
  kind.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  meta.appendChild(kind);
  const grade = document.createElement('span');
  grade.className = 'grade-tag ' + trophy.grade;
  grade.textContent = gradeLabel(trophy.grade);
  meta.appendChild(document.createTextNode(' '));
  meta.appendChild(grade);
  const bits = [];
  if (trophy.hidden) bits.push('Hidden on PSN');
  if (trophy.count) bits.push('PSN tracks ' + trophy.count + ' of ' + trophy.target);
  if (trophy.stage) bits.push('Roadmap stage ' + trophy.stage);
  if (bits.length) meta.appendChild(document.createTextNode(' · ' + bits.join(' · ')));
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'missable-flag';
    flag.textContent = 'MISSABLE';
    meta.appendChild(flag);
  }
  body.appendChild(meta);
  article.appendChild(body);

  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Guide & sources';
  details.appendChild(summary);
  const guide = document.createElement('p');
  guide.textContent = trophy.guide;
  details.appendChild(guide);
  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.innerHTML = '<strong>Missable:</strong> the Chapter 1 balcony meditation counts toward this trophy and disappears once Chapter 1 ends. Keep a manual save from the start of Chapter 1.';
    details.appendChild(warn);
  }
  const sources = document.createElement('p');
  sources.className = 'sources';
  sources.appendChild(document.createTextNode('Sources: '));
  (trophy.sources || []).forEach((source, i) => {
    if (i > 0) sources.appendChild(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.rel = 'noopener';
    sources.appendChild(link);
  });
  details.appendChild(sources);
  article.appendChild(details);

  return article;
}

function visibleTrophies() {
  const query = searchText.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (activeKind !== 'all' && trophy.kind !== activeKind) return false;
    if (!query) return true;
    const haystack = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
    return haystack.includes(query);
  });
}

function render() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(trophyCard));
  emptyEl.hidden = shown.length !== 0;
  const earnedCount = earned.size;
  summaryEl.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies — ' + earnedCount + ' earned.';
  progressTextEl.textContent = earnedCount + ' of ' + trophies.length + ' trophies earned';
  progressChipEl.textContent = earnedCount + '/' + trophies.length + ' earned';
  progressBarEl.setAttribute('aria-valuenow', String(earnedCount));
  progressFillEl.style.width = (earnedCount / Math.max(trophies.length, 1)) * 100 + '%';
  hintEl.textContent = KIND_HINTS[activeKind] || KIND_HINTS.all;
  spoilerBtn.textContent = spoilersOn ? 'Spoilers: hidden' : 'Spoilers: shown';
  spoilerBtn.setAttribute('aria-pressed', String(spoilersOn));
  document.querySelectorAll('#kindFilters button').forEach((button) => {
    const active = button.dataset.kind === activeKind;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderRoadmap() {
  const roadmapEl = document.getElementById('roadmapList');
  roadmapEl.replaceChildren(...ROADMAP.map((stage) => {
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    item.appendChild(heading);
    const count = document.createElement('p');
    count.className = 'stage-count';
    const done = stage.ids.filter((id) => earned.has(id)).length;
    count.textContent = done + ' of ' + stage.ids.length + ' trophies in this stage';
    item.appendChild(count);
    const text = document.createElement('p');
    text.textContent = stage.text;
    item.appendChild(text);
    return item;
  }));
}

function exportProgress() {
  const data = {
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    spoilers: spoilersOn,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'gta6-trophy-progress.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!Array.isArray(data.earned)) throw new Error('no earned list');
      earned = new Set(data.earned.map(Number).filter((id) => Number.isInteger(id) && id >= 1 && id <= trophies.length));
      if (typeof data.spoilers === 'boolean') spoilersOn = data.spoilers;
      saveState();
      render();
      renderRoadmap();
    } catch (err) {
      alert('That file is not a Leonida Platinum export (it needs an "earned" list).');
    }
  };
  reader.readAsText(file);
}

function applyHash() {
  const hash = window.location.hash;
  if (hash === '#spoilers-off') {
    spoilersOn = false;
    saveState();
    render();
    return;
  }
  const match = hash.match(/^#trophy-(\d+)$/);
  if (match) {
    const card = document.getElementById('trophy-' + match[1]);
    if (card) {
      const details = card.querySelector('details');
      if (details) details.open = true;
      card.scrollIntoView({ block: 'center' });
    }
  }
}

document.getElementById('searchBox').addEventListener('input', (event) => {
  searchText = event.target.value;
  render();
});

document.getElementById('kindFilters').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-kind]');
  if (!button) return;
  activeKind = button.dataset.kind;
  render();
});

spoilerBtn.addEventListener('click', () => {
  spoilersOn = !spoilersOn;
  saveState();
  render();
});

document.getElementById('exportBtn').addEventListener('click', exportProgress);

document.getElementById('importFile').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) importProgress(file);
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all progress? This clears every ticked trophy in this browser.')) return;
  earned = new Set();
  saveState();
  render();
  renderRoadmap();
});

window.addEventListener('hashchange', applyHash);

loadState();
const response = await fetch(DATA_URL);
const data = await response.json();
trophies = data.trophies;
render();
renderRoadmap();
applyHash();
