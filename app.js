/* MoonHongTAROT — 배열법 선택 → 덱에서 뽑기 → 뒤집기 → 자리별 풀이
 * 배열 좌표: [이름, 설명, 열, 줄, 가로놓임?]. 줄(row) 하나가 카드 반 장이라 반 칸씩 어긋난 배열을 그릴 수 있다.
 */
(function () {
  'use strict';
  const CARDS = window.CARDS;
  const SUITS = window.SUITS;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const SPREADS = {
    c1: { name: '원 카드', sub: '1장', blurb: '오늘의 메시지, 예·아니오에 가까운 짧은 질문에.', cols: 1, max: 220,
      pos: [['메시지', '지금 이 질문에 카드가 건네는 답', 1, 1]] },
    c2: { name: '투 카드', sub: '2장', blurb: '나와 상대, 혹은 상황과 조언을 나란히.', cols: 2, max: 190,
      pos: [['나 · 상황', '지금 내 쪽의 마음과 형편', 1, 1], ['상대 · 조언', '상대의 마음, 혹은 이 상황에 건네는 조언', 2, 1]] },
    c3: { name: '쓰리 카드', sub: '3장', blurb: '과거·현재·미래로 흐름을 한눈에.', cols: 3, max: 180,
      pos: [['과거', '여기까지 오게 한 일', 1, 1], ['현재', '지금 서 있는 자리', 2, 1], ['미래', '이대로 갈 때 닿는 곳', 3, 1]] },
    c6: { name: '식스 카드', sub: '6장', blurb: '시간의 흐름에 두 사람의 마음과 결과를 더해서.', cols: 3, max: 150,
      pos: [['과거', '이 일의 뿌리', 1, 1], ['현재', '지금의 상황', 2, 1], ['가까운 미래', '곧 다가올 흐름', 3, 1],
        ['나의 마음', '내가 품은 속내와 태도', 1, 3], ['상대 · 주변', '상대의 마음, 주변의 영향', 2, 3], ['결과', '이 흐름이 닿는 곳', 3, 3]] },
    c8: { name: '에이트 카드', sub: '8장', blurb: '원인과 장애, 조언까지 짚는 넉넉한 배열.', cols: 4, max: 140,
      pos: [['현재', '지금의 상황', 1, 1], ['과거 · 원인', '여기까지 오게 한 일', 2, 1], ['장애물', '앞을 가로막는 것', 3, 1], ['나의 속마음', '겉으로 드러내지 않은 마음', 4, 1],
        ['상대 · 주변', '상대의 마음, 주변의 영향', 1, 3], ['조언', '지금 취할 태도', 2, 3], ['가까운 미래', '곧 다가올 흐름', 3, 3], ['결과', '이 흐름이 닿는 곳', 4, 3]] },
    choice: { name: '양자택일', sub: '5장', blurb: '두 갈래 길 앞에서, 각각의 흐름과 끝을 견주어.', cols: 3, max: 140,
      pos: [['현재', '선택 앞에 선 지금의 나', 2, 4], ['A의 흐름', 'A를 고르면 펼쳐지는 과정', 1, 3], ['A의 결과', 'A를 고른 끝', 1, 1],
        ['B의 흐름', 'B를 고르면 펼쳐지는 과정', 3, 3], ['B의 결과', 'B를 고른 끝', 3, 1]] },
    magic7: { name: '매직 세븐', sub: '7장', blurb: '육각별 모양. 흐름과 대책, 주변과 장애를 함께.', cols: 3, max: 130,
      pos: [['과거', '이 일의 지나온 배경', 2, 1], ['현재', '지금의 상황', 3, 4], ['가까운 미래', '곧 다가올 흐름', 1, 4],
        ['조언 · 대책', '내가 할 수 있는 일', 2, 5], ['주변 상황', '상대와 주위 사람들의 영향', 1, 2], ['장애 · 소망', '가로막는 것, 혹은 내가 바라고 두려워하는 것', 3, 2],
        ['결과', '이 모든 것이 모여 닿는 곳', 2, 3]] },
    celtic: { name: '켈틱 크로스', sub: '10장', blurb: '한 가지 문제를 열 방향에서 깊이 들여다보는 배열.', cols: 4, max: 124,
      pos: [['현재', '문제의 한가운데, 지금의 나', 2, 4], ['장애물', '가로질러 길을 막는 것', 2, 4, true], ['의식 · 목표', '머리로 바라는 것', 2, 2],
        ['무의식 · 뿌리', '밑바닥에 깔린 진짜 이유', 2, 6], ['과거', '지나가고 있는 영향', 1, 4], ['가까운 미래', '곧 다가올 일', 3, 4],
        ['나의 태도', '이 문제를 대하는 나', 4, 7], ['주변 환경', '상대, 주위 사람과 여건', 4, 5], ['희망과 두려움', '바라면서도 겁내는 것', 4, 3], ['최종 결과', '이대로 갈 때의 끝', 4, 1]] }
  };
  const ORDER = ['c1', 'c2', 'c3', 'c6', 'c8', 'choice', 'magic7', 'celtic'];
  const TOPICS = [['all', '전체'], ['love', '애정'], ['rel', '관계'], ['money', '금전'], ['work', '일·학업'], ['health', '몸·마음']];
  const TOPIC_KO = Object.fromEntries(TOPICS);

  const state = { key: 'c3', topic: 'all', question: '', optA: '', optB: '', deck: [], picks: [], flipped: new Set() };

  /* ── 그림 ─────────────────────────── */
  function faceHTML(c, lazy) {
    return `<span class="face"><img src="cards/${c.id}.jpg" alt="${esc(c.ko)} 카드 그림" width="440" height="733"${lazy ? ' loading="lazy"' : ''}></span>`;
  }
  const BACK_SVG = '<svg class="back-art" viewBox="0 0 100 166" preserveAspectRatio="none" aria-hidden="true">' +
    '<rect class="b-ground" width="100" height="166"/>' +
    '<rect class="b-frame" x="5" y="5" width="90" height="156" rx="4"/>' +
    '<circle class="b-ring" cx="50" cy="83" r="30"/>' +
    '<path class="b-star" d="M50 55L54 79L78 83L54 87L50 111L46 87L22 83L46 79Z"/>' +
    '<path class="b-dot" d="M22 30l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5zM80 128l1.2 3.6 3.6 1.2-3.6 1.2-1.2 3.6-1.2-3.6-3.6-1.2 3.6-1.2z"/>' +
    '</svg>';

  /* ── 해설 조각 ─────────────────────── */
  function numLabel(c) {
    if (c.major) return String(c.n);
    return SUITS[c.suit].ko[0] + (c.n <= 10 ? (c.n === 1 ? 'A' : c.n) : ['P', 'N', 'Q', 'K'][c.n - 11]);
  }
  function tagsHTML(c) {
    if (c.major) return `<div class="tags"><span class="tag is-major">메이저 아르카나 ${c.n}</span></div>`;
    return `<div class="tags"><span class="tag">${SUITS[c.suit].ko} · ${SUITS[c.suit].el}</span>` +
      (c.court ? '<span class="tag is-court">인물 카드</span>' : '') + '</div>';
  }
  function topicRow(c, key, focus) {
    return `<div${focus ? ' class="is-focus"' : ''}><dt>${TOPIC_KO[key]}</dt><dd>${esc(c[key])}</dd></div>`;
  }
  function bodyHTML(c, topic) {
    const keys = TOPICS.slice(1).map((t) => t[0]);
    let topics;
    if (topic && topic !== 'all') {
      const rest = keys.filter((k) => k !== topic);
      topics = `<dl class="topics">${topicRow(c, topic, true)}</dl>` +
        `<details class="more"><summary>다른 주제의 풀이 보기</summary><dl class="topics">${rest.map((k) => topicRow(c, k)).join('')}</dl></details>`;
    } else {
      topics = `<dl class="topics">${keys.map((k) => topicRow(c, k)).join('')}</dl>`;
    }
    return `${tagsHTML(c)}` +
      `<ul class="kw">${c.kw.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>` +
      `<p class="desc">${esc(c.desc)}</p>` +
      `<dl class="duo"><div class="light"><dt>빛</dt><dd>${esc(c.light)}</dd></div><div class="shadow"><dt>그림자</dt><dd>${esc(c.shadow)}</dd></div></dl>` +
      topics +
      `<div class="counsel"><p class="adv"><b>조언으로 읽을 때</b>${esc(c.advice)}</p><p class="warn"><b>주의로 읽을 때</b>${esc(c.warn)}</p></div>`;
  }
  function readingHTML(i, label, hint, c) {
    return `<div class="reading-card">${faceHTML(c)}</div><div class="reading-body">` +
      `<p class="pos"><b>${i + 1}</b>${esc(label)}<span>${esc(hint)}</span></p>` +
      `<h3>${esc(c.ko)} <span>${esc(c.en)}</span></h3>${bodyHTML(c, state.topic)}</div>`;
  }
  function dialogHTML(c) {
    return `<div class="dialog-head"><div class="reading-card">${faceHTML(c)}</div>` +
      `<h3 id="dialogTitle">${esc(c.ko)} <span>${esc(c.en)}</span></h3></div>` +
      `<div class="dialog-sections">${bodyHTML(c, 'all')}</div>`;
  }

  /* 여러 장을 한꺼번에 볼 때: 메이저 비율, 몰린 묶음, 인물 카드 */
  const SUIT_NOTE = {
    w: '완드가 몰려 나왔습니다. 의욕과 행동, 일을 밀고 나가는 힘이 이 질문의 중심입니다.',
    c: '컵이 몰려 나왔습니다. 감정과 관계, 마음이 어떻게 오가는지가 이 질문의 중심입니다.',
    s: '소드가 몰려 나왔습니다. 생각과 말, 갈등과 결단이 이 질문의 중심입니다.',
    p: '펜타클이 몰려 나왔습니다. 돈과 현실, 손에 잡히는 결과가 이 질문의 중심입니다.'
  };
  function togetherHTML(cards) {
    const n = cards.length;
    const cnt = { major: 0, w: 0, c: 0, s: 0, p: 0 };
    cards.forEach((c) => { cnt[c.suit] += 1; });
    const courts = cards.filter((c) => c.court).length;
    const tally = ['major', 'w', 'c', 's', 'p'].filter((k) => cnt[k]).map((k) => `<span>${SUITS[k].ko} ${cnt[k]}</span>`).join('');
    const notes = [];
    if (cnt.major === 0) notes.push('메이저가 한 장도 없습니다. 일상의 선택과 노력으로 충분히 달라질 수 있는 일입니다.');
    else if (cnt.major * 2 >= n) notes.push(`메이저가 ${cnt.major}장입니다. 내 뜻만으로 바꾸기 어려운 큰 흐름이 걸려 있으니, 거스르기보다 흐름을 읽는 쪽이 낫습니다.`);
    else notes.push(`메이저 ${cnt.major}장이 놓인 자리가 이 배열의 요점입니다. 그 자리부터 읽으세요.`);
    const minors = ['w', 'c', 's', 'p'].sort((a, b) => cnt[b] - cnt[a]);
    if (cnt[minors[0]] >= 2 && cnt[minors[0]] > cnt[minors[1]]) notes.push(SUIT_NOTE[minors[0]]);
    const missing = minors.filter((k) => cnt[k] === 0);
    if (n >= 6 && missing.length === 1) notes.push(`${SUITS[missing[0]].ko}(${SUITS[missing[0]].el})가 한 장도 없습니다. 이 일에서 비어 있는 부분일 수 있습니다.`);
    if (courts >= 2) notes.push(`인물 카드가 ${courts}장입니다. 이 일에는 사람이 깊이 얽혀 있습니다. 각 인물이 누구인지 떠올려 보세요.`);
    return `<h3>함께 읽기</h3><p class="tally">${tally}</p><p>자리 하나하나를 보기 전에, 펼쳐진 카드 전체의 색부터 봅니다.</p>` +
      `<ul>${notes.map((t) => `<li>${t}</li>`).join('')}</ul>`;
  }

  /* ── 배열법 고르기 ─────────────────── */
  function miniHTML(s) {
    return `<span class="mini" style="--cols:${s.cols}" aria-hidden="true">` +
      s.pos.map((p, i) => `<i${p[4] ? ' class="is-cross"' : ''} style="--c:${p[2]};--r:${p[3]}">${i + 1}</i>`).join('') + '</span>';
  }
  function renderSetup() {
    $('spreadOptions').innerHTML = ORDER.map((k) => {
      const s = SPREADS[k];
      return `<label class="spread-option"><input type="radio" name="spread" value="${k}"${k === state.key ? ' checked' : ''}>` +
        `<span class="spread-card">${miniHTML(s)}<span><strong>${s.name} <em>${s.sub}</em></strong><p>${s.blurb}</p></span></span></label>`;
    }).join('');
    $('topicOptions').innerHTML = TOPICS.map(([k, ko]) =>
      `<button type="button" class="chip${k === state.topic ? ' is-on' : ''}" data-topic="${k}" aria-pressed="${k === state.topic}">${ko}</button>`).join('');
  }

  function positions() {
    const s = SPREADS[state.key];
    if (state.key !== 'choice') return s.pos;
    const a = state.optA || 'A';
    const b = state.optB || 'B';
    return s.pos.map((p) => {
      const name = p[0][0] === 'A' ? a : p[0][0] === 'B' ? b : '';
      if (!name) return p;
      return [name + p[0].slice(1), `‘${name}’ 쪽을${p[1].slice(2)}`, p[2], p[3], p[4]];
    });
  }

  /* ── 뽑기 ─────────────────────────── */
  function shuffled() {
    const a = CARDS.map((_, i) => i);
    const rnd = new Uint32Array(a.length);
    crypto.getRandomValues(rnd);
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = rnd[i] % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function updateStatus() {
    const n = SPREADS[state.key].pos.length;
    const k = state.picks.length;
    let t;
    if (k < n) t = `덱에서 마음이 가는 카드를 ${n}장 골라 주세요. (${k}/${n})`;
    else if (state.flipped.size < n) t = '카드를 눌러 한 장씩 뒤집어 보세요.';
    else t = '모두 펼쳤습니다. 아래에서 자리별 풀이를 읽어 보세요.';
    $('status').textContent = t;
  }

  function startReading() {
    const s = SPREADS[state.key];
    const pos = positions();
    state.deck = shuffled();
    state.picks = [];
    state.flipped = new Set();

    $('table').hidden = false;
    $('spreadTitle').textContent = `${s.name} · ${s.sub}`;
    $('asked').hidden = !state.question;
    $('asked').textContent = state.question;

    $('deck').classList.remove('is-done');
    $('deck').innerHTML = state.deck.map((_, i) =>
      `<button type="button" class="deck-card" style="--i:${i}" data-i="${i}" aria-label="${i + 1}번째 카드 뽑기">${BACK_SVG}</button>`).join('');

    const lay = $('layout');
    lay.dataset.spread = state.key;
    lay.style.setProperty('--cols', s.cols);
    lay.style.setProperty('--max', `${s.max}px`);
    lay.innerHTML = pos.map((p, i) =>
      `<div class="slot${p[4] ? ' is-cross' : ''}" data-pos="${i}" style="--c:${p[2]};--r:${p[3]}">` +
      `<span class="badge">${i + 1}</span><div class="slot-hole"></div></div>`).join('');

    $('legend').innerHTML = pos.map((p, i) =>
      `<li data-pos="${i}"><b>${i + 1}</b><span><strong>${esc(p[0])}</strong> · ${esc(p[1])}</span></li>`).join('');
    $('readings').innerHTML = pos.map((_, i) => `<article class="reading" data-pos="${i}" id="reading-${i}" hidden></article>`).join('');
    $('together').hidden = true;
    $('tableActions').hidden = true;
    $('flipAll').hidden = false;
    updateStatus();
  }

  function pick(deckIndex) {
    const n = SPREADS[state.key].pos.length;
    if (state.picks.length >= n) return;
    const i = state.picks.length;
    const c = CARDS[state.deck[deckIndex]];
    state.picks.push(c);
    const slot = $('layout').querySelector(`.slot[data-pos="${i}"]`);
    slot.querySelector('.slot-hole').outerHTML =
      `<button type="button" class="flip" data-pos="${i}" aria-label="${i + 1}번 자리 카드 뒤집기">` +
      `<span class="flip-inner"><span class="side back">${BACK_SVG}</span><span class="side front">${faceHTML(c)}</span></span></button>`;
    if (state.picks.length === n) {
      $('deck').classList.add('is-done');
      $('tableActions').hidden = false;
      $('layout').scrollIntoView({ block: 'center' });
    }
    updateStatus();
  }

  function flip(i, quiet) {
    i = Number(i);
    if (state.flipped.has(i) || !state.picks[i]) return;
    state.flipped.add(i);
    const c = state.picks[i];
    const pos = positions();
    const n = pos.length;
    const btn = $('layout').querySelector(`.flip[data-pos="${i}"]`);
    btn.classList.add('is-flipped');
    btn.setAttribute('aria-label', `${i + 1}번 자리 ${pos[i][0]}: ${c.ko}`);

    const li = $('legend').querySelector(`li[data-pos="${i}"]`);
    li.insertAdjacentHTML('beforeend', `<a href="#reading-${i}">${esc(c.ko)}</a>`);

    const article = $('readings').querySelector(`.reading[data-pos="${i}"]`);
    article.innerHTML = readingHTML(i, pos[i][0], pos[i][1], c);
    article.hidden = false;

    const done = state.flipped.size === n;
    if (done) $('flipAll').hidden = true;
    if (done && n > 1) {
      $('together').innerHTML = togetherHTML(state.picks);
      $('together').hidden = false;
    }
    updateStatus();
    if (!quiet && done) {
      const target = n === 1 ? article : $('together');
      setTimeout(() => target.scrollIntoView({ block: 'start' }), 700);
    }
  }

  /* ── 도감 ─────────────────────────── */
  const GROUPS = [['all', '전체'], ['major', '메이저'], ['w', '완드'], ['c', '컵'], ['s', '소드'], ['p', '펜타클']];
  function renderLibrary() {
    $('filters').innerHTML = GROUPS.map(([k, ko], i) => {
      const n = k === 'all' ? CARDS.length : CARDS.filter((c) => c.suit === k).length;
      return `<button type="button" class="chip${i ? '' : ' is-on'}" data-suit="${k}" aria-pressed="${!i}">${ko} <span>${n}</span></button>`;
    }).join('');
    $('cardGrid').innerHTML = CARDS.map((c, i) =>
      `<button type="button" class="card-tile" data-i="${i}" data-suit="${c.suit}" aria-label="${esc(c.ko)} 풀이 보기">` +
      `${faceHTML(c, true)}<span class="tile-name"><b>${numLabel(c)}</b>${esc(c.ko)}</span></button>`).join('');
  }

  function setChips(box, chip) {
    box.querySelectorAll('.chip').forEach((b) => {
      const on = b === chip;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  /* ── 이벤트 ───────────────────────── */
  $('spreadOptions').addEventListener('change', (e) => {
    $('choiceNames').hidden = e.target.value !== 'choice';
  });
  $('topicOptions').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.topic = chip.dataset.topic;
    setChips($('topicOptions'), chip);
  });

  $('setup').addEventListener('submit', (e) => {
    e.preventDefault();
    const checked = document.querySelector('input[name="spread"]:checked');
    if (checked) state.key = checked.value;
    state.question = $('question').value.trim();
    state.optA = $('optA').value.trim();
    state.optB = $('optB').value.trim();
    startReading();
    $('table').scrollIntoView({ block: 'start' });
  });

  $('deck').addEventListener('click', (e) => {
    const btn = e.target.closest('.deck-card');
    if (!btn || btn.classList.contains('is-taken')) return;
    btn.classList.add('is-taken');
    btn.disabled = true;
    pick(Number(btn.dataset.i));
  });

  $('layout').addEventListener('click', (e) => {
    const btn = e.target.closest('.flip');
    if (btn) flip(btn.dataset.pos);
  });

  $('flipAll').addEventListener('click', () => {
    const rest = state.picks.map((_, i) => i).filter((i) => !state.flipped.has(i));
    rest.forEach((p, k) => setTimeout(() => flip(p, k < rest.length - 1), k * 240));
  });

  $('redraw').addEventListener('click', () => {
    startReading();
    $('table').scrollIntoView({ block: 'start' });
  });

  $('filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    setChips($('filters'), chip);
    const suit = chip.dataset.suit;
    $('cardGrid').querySelectorAll('.card-tile').forEach((t) => {
      t.hidden = suit !== 'all' && t.dataset.suit !== suit;
    });
  });

  const dialog = $('cardDialog');
  $('cardGrid').addEventListener('click', (e) => {
    const tile = e.target.closest('.card-tile');
    if (!tile) return;
    $('dialogBody').innerHTML = dialogHTML(CARDS[Number(tile.dataset.i)]);
    dialog.showModal();
    dialog.scrollTop = 0;
  });
  $('dialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  renderSetup();
  renderLibrary();
})();
