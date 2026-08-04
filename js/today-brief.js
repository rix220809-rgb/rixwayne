/* Our Memories V10.6 — Today Brief Engine */
(() => {
  const VERSION = '10.6.0';
  const TEXT_URL = `data/today_brief_texts.json?v=${VERSION}`;
  const DAY_KEY_PREFIX = 'ourMemories.todayBrief.seen.v10.6';
  let textLibrary = null;
  let currentQueue = [];
  let currentIndex = 0;
  let briefOpening = false;

  function getToday(){
    return typeof todayISO === 'function' ? todayISO() : new Date().toISOString().slice(0,10);
  }

  function seededIndex(key, length){
    if(!length) return 0;
    let hash = 0;
    for(const ch of String(key)) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
    return Math.abs(hash) % length;
  }

  async function loadTextLibrary(){
    if(textLibrary) return textLibrary;
    try{
      const response = await fetch(TEXT_URL, {cache:'no-store'});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      textLibrary = await response.json();
    }catch(error){
      console.warn('Today Brief text library failed', error);
      textLibrary = {};
    }
    return textLibrary;
  }

  function pickText(type, seed){
    const pool = textLibrary?.[type] || [];
    return pool[seededIndex(`${getToday()}-${type}-${seed}`, pool.length)] || null;
  }

  function fillTemplate(value, vars){
    return String(value || '').replace(/\{(\w+)\}/g, (_, key) =>
      vars[key] !== undefined ? String(vars[key]) : `{${key}}`
    );
  }

  function buildBrief({key, type, priority, emoji, image, vars = {}, fallbackTitle, fallbackBody, fallbackTask}){
    const copy = pickText(type, key);
    return {
      key,
      type,
      priority,
      emoji,
      image: image || null,
      title: fillTemplate(copy?.title || fallbackTitle || '今日提醒', vars),
      paragraphs: (copy?.body || fallbackBody || []).map(line => fillTemplate(line, vars)),
      task: fillTemplate(copy?.task || fallbackTask || '', vars)
    };
  }

  async function collectPeriodBriefs(force = false){
    const briefs = [];
    try{
      const today = getToday();
      const state = typeof getCycleEngineState === 'function'
        ? await getCycleEngineState()
        : (typeof getRecordedPeriodState === 'function' ? await getRecordedPeriodState() : null);

      if(state?.active && Number(state.day) === 1){
        const mood = typeof getDailyAngryPhoto === 'function' ? getDailyAngryPhoto() : null;
        briefs.push(buildBrief({
          key:`period-start-${today}`,
          type:'period_start',
          priority:100,
          emoji:'🌸',
          image:mood?.src,
          vars:{day:1},
          fallbackTitle:'🚨 小舜警報 Lv.MAX',
          fallbackBody:['小舜今天正式進入經期模式。','今日建議：多一點耐心，少一點大道理。'],
          fallbackTask:'今天多照顧小舜一點。'
        }));
        return briefs;
      }

      if(!state?.active && typeof getPeriodPrediction === 'function'){
        const info = await getPeriodPrediction();
        const days = Number(info?.warningDays);
        if(Number.isFinite(days) && days >= 1 && days <= 3){
          const mood = typeof getDailyAngryPhoto === 'function' ? getDailyAngryPhoto() : null;
          briefs.push(buildBrief({
            key:`period-pre-${days}-${today}`,
            type:'period_pre3',
            priority:95,
            emoji:'⚠️',
            image:mood?.src,
            vars:{days},
            fallbackTitle:'⚠️ 小舜警報',
            fallbackBody:[`預估還有 ${days} 天進入經期模式。`,`懷寶請自動切換成溫柔照顧模式。`],
            fallbackTask:'今天降低白目值。'
          }));
        }
      }
    }catch(error){
      console.warn('Today Brief period collection failed', error);
    }
    return briefs;
  }

  function collectMilestoneBriefs(){
    const briefs = [];
    try{
      if(typeof relationshipMilestoneState !== 'function') return briefs;
      const state = relationshipMilestoneState(getToday());
      if(state?.isMilestone && state.currentDay > 0){
        briefs.push(buildBrief({
          key:`milestone-${state.currentDay}`,
          type:'milestone',
          priority:90,
          emoji:'❤️',
          vars:{day:state.currentDay,nextDay:state.currentDay+100},
          fallbackTitle:`✨ 成就解鎖：Together Day ${state.currentDay}`,
          fallbackBody:[`你們已經一起走了 ${state.currentDay} 天。`,`今天很適合再留下一個新的回憶。`],
          fallbackTask:'今天拍一張新的合照。'
        }));
      }
    }catch(error){
      console.warn('Today Brief milestone collection failed', error);
    }
    return briefs;
  }

  function collectSpecialEventBriefs(){
    const briefs = [];
    try{
      if(typeof specialEventOccurrences !== 'function') return briefs;
      const today = getToday();
      const eventsToday = specialEventOccurrences(today).filter(event => event.date === today);

      for(const event of eventsToday){
        const typeMap = {
          'anniversary':'anniversary',
          'wayne-birthday':'wayne-birthday',
          'shun-birthday':'shun-birthday',
          'valentine':'valentine',
          'white-day':'white-day',
          'qixi':'qixi',
          'christmas':'christmas'
        };
        const type = typeMap[event.id] || event.id;
        briefs.push(buildBrief({
          key:`event-${event.id}-${today}`,
          type,
          priority:event.id.includes('birthday') ? 92 : event.id === 'anniversary' ? 91 : 88,
          emoji:event.emoji || '✨',
          vars:{name:event.name},
          fallbackTitle:`${event.emoji || '✨'} ${event.name}`,
          fallbackBody:[`今天是${event.name}。`,`請把今天留一點給彼此。`],
          fallbackTask:'今天留下一個新的回憶。'
        }));
      }
    }catch(error){
      console.warn('Today Brief special-event collection failed', error);
    }
    return briefs;
  }

  function seenKey(brief){
    return `${DAY_KEY_PREFIX}.${getToday()}.${brief.key}`;
  }

  function isSeen(brief){
    try{return localStorage.getItem(seenKey(brief)) === '1';}catch{return false;}
  }

  function markSeen(brief){
    try{localStorage.setItem(seenKey(brief), '1');}catch{}
  }

  async function collectTodayBriefs({force=false, onlyTypes=null} = {}){
    await loadTextLibrary();
    let queue = [
      ...(await collectPeriodBriefs(force)),
      ...collectMilestoneBriefs(),
      ...collectSpecialEventBriefs()
    ];

    if(Array.isArray(onlyTypes) && onlyTypes.length){
      queue = queue.filter(item => onlyTypes.includes(item.type));
    }

    const unique = new Map();
    for(const item of queue){
      if(!unique.has(item.key)) unique.set(item.key, item);
    }

    queue = [...unique.values()].sort((a,b) => b.priority - a.priority);
    if(!force) queue = queue.filter(item => !isSeen(item));
    return queue;
  }

  function ensureOverlay(){
    let overlay = document.querySelector('#todayBriefOverlay');
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'todayBriefOverlay';
    overlay.className = 'today-brief-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="today-brief-shell" role="dialog" aria-modal="true" aria-labelledby="todayBriefTitle">
        <div class="today-brief-progress" id="todayBriefProgress"></div>
        <article class="today-brief-card" id="todayBriefCard"></article>
      </section>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function renderCurrent(){
    const overlay = ensureOverlay();
    const brief = currentQueue[currentIndex];
    if(!brief){
      closeBrief();
      return;
    }

    const progress = overlay.querySelector('#todayBriefProgress');
    progress.innerHTML = currentQueue.map((_, index) =>
      `<span class="${index <= currentIndex ? 'active' : ''}"></span>`
    ).join('');

    const card = overlay.querySelector('#todayBriefCard');
    const isLast = currentIndex === currentQueue.length - 1;
    card.className = `today-brief-card type-${brief.type}`;
    card.innerHTML = `
      <div class="today-brief-count">${currentIndex + 1} / ${currentQueue.length}</div>
      ${brief.image ? `<div class="today-brief-image-wrap"><img src="${typeof assetUrl === 'function' ? assetUrl(brief.image) : brief.image}" alt="Today Brief"></div>` : `<div class="today-brief-symbol">${brief.emoji || '✨'}</div>`}
      <div class="today-brief-copy">
        <p class="today-brief-kicker">TODAY BRIEF</p>
        <h2 id="todayBriefTitle">${brief.title}</h2>
        <div class="today-brief-paragraphs">
          ${brief.paragraphs.map(text => `<p>${text}</p>`).join('')}
        </div>
        ${brief.task ? `
          <div class="today-brief-task">
            <span>📌 今日任務</span>
            <strong>${brief.task}</strong>
          </div>` : ''}
        <p class="today-brief-signoff">—— 今天也正在變成未來的回憶。</p>
      </div>
      <button type="button" class="today-brief-next" id="todayBriefNext">
        ${isLast ? '開始今天' : '下一則'}
      </button>
    `;

    card.querySelector('#todayBriefNext').addEventListener('click', () => {
      markSeen(brief);
      if(isLast){
        closeBrief();
      }else{
        currentIndex += 1;
        renderCurrent();
      }
    });

    if(typeof bindImageFallbacks === 'function') bindImageFallbacks(card);
  }

  function closeBrief(){
    const overlay = ensureOverlay();
    overlay.hidden = true;
    document.body.classList.remove('today-brief-open');
    currentQueue = [];
    currentIndex = 0;
    briefOpening = false;
  }

  async function showTodayBrief(options = {}){
    if(briefOpening || !document.body) return;
    briefOpening = true;
    try{
      const queue = await collectTodayBriefs(options);
      if(!queue.length){
        briefOpening = false;
        return;
      }
      currentQueue = queue;
      currentIndex = 0;
      const overlay = ensureOverlay();
      overlay.hidden = false;
      document.body.classList.add('today-brief-open');
      renderCurrent();
    }catch(error){
      console.warn('Today Brief failed', error);
      briefOpening = false;
    }
  }

  window.showTodayBrief = showTodayBrief;
  window.collectTodayBriefs = collectTodayBriefs;
  window.resetTodayBriefForTesting = () => {
    try{
      const prefix = `${DAY_KEY_PREFIX}.${getToday()}.`;
      Object.keys(localStorage).filter(key => key.startsWith(prefix)).forEach(key => localStorage.removeItem(key));
    }catch{}
  };
})();
