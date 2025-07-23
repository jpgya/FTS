/* ---------- 共通 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  if (window.PAGE_TYPE) loadMaps(window.PAGE_TYPE);
  if (document.getElementById('vodForm')) initVodForm();
});

/* ナビの active クラス付与 */
function highlightActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

/* ---------- マップ一覧 ---------- */
async function loadMaps(type) {
  const listEl = document.getElementById('mapList');
  const searchInput = document.getElementById('searchInput');
  try {
    const res = await fetch('maps/maps.json');
    const data = await res.json();
    let maps = data.filter(m => m.type === type);

    /* 検索 */
    searchInput?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      render(maps.filter(m => m.title.toLowerCase().includes(q) || m.creator.toLowerCase().includes(q)));
    });

    render(maps);
  } catch (err) {
    listEl.innerHTML = '<p class="loading">読み込みに失敗しました…</p>';
  }

  function render(arr) {
    listEl.innerHTML = arr.length
      ? arr.map(mapCard).join('')
      : '<p class="loading">該当するマップがありません。</p>';
    /* コピー機能 */
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = 'コピー'), 1000);
      });
    });
  }

  function mapCard(m) {
    return `
      <article class="map-card">
        <img src="${m.thumbnail}" alt="" class="map-thumb">
        <div class="map-body">
          <h3 class="map-title">${m.title}</h3>
          <p class="map-creator">by ${m.creator}</p>
          <span class="map-code">${m.code}</span>
          <button class="btn-outline map-copy" data-copy="${m.code}">コピー</button>
        </div>
      </article>`;
  }
}

/* ---------- VOD フォーム ---------- */
function initVodForm() {
  const form = document.getElementById('vodForm');
  const exportBtn = document.getElementById('exportBtn');
  const statusMsg = document.getElementById('statusMsg');
  const STORAGE_KEY = 'fts-vod-form';

  /* 初期表示 */
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  Object.keys(saved).forEach(k => {
    if (form.elements[k]) form.elements[k].value = saved[k];
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    /* 保存 */
    const data = Object.fromEntries(new FormData(form));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    statusMsg.textContent = '保存しました！';
    setTimeout(() => (statusMsg.textContent = ''), 1500);
  });

  /* クリップボードコピー */
  exportBtn.addEventListener('click', () => {
    const data = Object.fromEntries(new FormData(form));
    const text = `【VOD 反省】
日付: ${data.date}
概要: ${data.summary}
良かった点: ${data.good}
改善点: ${data.bad}
次のアクション: ${data.next}`;
    navigator.clipboard.writeText(text).then(() => {
      statusMsg.textContent = 'コピーしました！';
      setTimeout(() => (statusMsg.textContent = ''), 1500);
    });
  });
}
