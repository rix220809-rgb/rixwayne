
/* Our Memories V10.2 — Cycle Engine + Dashboard */
const PERIOD_CYCLE_LOCAL_KEY = 'ourMemories.periodCycles.v10.2';
const PERIOD_CYCLE_MAX_OPEN_DAYS = 14;

function cycleDateLabel(date){
  return isISODate(date) ? fmt(date) : '—';
}

function normalizeCycleRows(rows){
  return (rows || [])
    .map(row => ({
      id: row.id,
      start: row.start_date || row.start,
      end: row.end_date || row.end || null,
      note: row.note || '',
      created_at: row.created_at || ''
    }))
    .filter(row => isISODate(row.start))
    .sort((a,b) => b.start.localeCompare(a.start));
}

async function getPeriodCycles(){
  if(db){
    const {data, error} = await db
      .from('period_cycles')
      .select('*')
      .eq('space_id', CLOUD_SPACE_ID)
      .order('start_date', {ascending:false});

    if(!error) return normalizeCycleRows(data);
    console.warn('period_cycles unavailable; using compatibility mode', error);
  }

  const local = loadJSON(PERIOD_CYCLE_LOCAL_KEY, []);
  if(local.length) return normalizeCycleRows(local);

  // Compatibility migration from completed period_records.
  const oldRecords = await getPeriodRecords();
  return normalizeCycleRows(oldRecords.map(r => ({
    id: r.id,
    start_date: r.start,
    end_date: r.end,
    note: r.note || ''
  })));
}

async function getActivePeriodCycle(){
  const cycles = await getPeriodCycles();
  return cycles.find(cycle => !cycle.end) || null;
}

async function createPeriodCycle(startDate=todayISO()){
  const current = await getActivePeriodCycle();
  if(current){
    throw new Error(`目前已有從 ${fmt(current.start)} 開始、尚未結束的經期。`);
  }

  const payload = {
    start_date: startDate,
    end_date: null,
    note: '由 Cycle Engine 建立'
  };

  if(db){
    const {data, error} = await db
      .from('period_cycles')
      .insert({...payload, space_id:CLOUD_SPACE_ID})
      .select()
      .single();
    if(error) throw error;
    return normalizeCycleRows([data])[0];
  }

  const cycles = loadJSON(PERIOD_CYCLE_LOCAL_KEY, []);
  const record = {id:Date.now(), start:payload.start_date, end:null, note:payload.note};
  cycles.unshift(record);
  saveJSON(PERIOD_CYCLE_LOCAL_KEY, cycles);
  return record;
}

async function endPeriodCycle(endDate=todayISO()){
  const current = await getActivePeriodCycle();
  if(!current) throw new Error('目前沒有進行中的經期。');
  if(dayDiff(endDate, current.start) < 0) throw new Error('結束日不能早於開始日。');

  if(db){
    const {error} = await db
      .from('period_cycles')
      .update({end_date:endDate, updated_at:new Date().toISOString()})
      .eq('id', current.id)
      .eq('space_id', CLOUD_SPACE_ID);
    if(error) throw error;
  }else{
    const cycles = loadJSON(PERIOD_CYCLE_LOCAL_KEY, []);
    const target = cycles.find(c => String(c.id) === String(current.id));
    if(target) target.end = endDate;
    saveJSON(PERIOD_CYCLE_LOCAL_KEY, cycles);
  }

  return {...current, end:endDate};
}

async function getCycleEngineState(){
  const cycles = await getPeriodCycles();
  const active = cycles.find(c => !c.end) || null;
  const today = todayISO();

  if(active){
    const day = dayDiff(today, active.start) + 1;
    return {
      active,
      day: Math.max(1, day),
      cycles,
      status: 'active'
    };
  }

  const completed = cycles.filter(c => c.end);
  const starts = completed.map(c => c.start).sort();
  const cycleLength = getCycleLength(completed.map(c => ({start:c.start,end:c.end})));
  const latest = completed[0] || null;
  const nextStart = latest ? addDaysISO(latest.start, cycleLength) : null;

  return {
    active:null,
    day:null,
    cycles,
    status:'idle',
    cycleLength,
    nextStart
  };
}


async function getPillEngineState(){
  const cycles = await getPeriodCycles();
  const today = todayISO();
  const latest = cycles
    .filter(c => isISODate(c.start) && dayDiff(today, c.start) >= 0)
    .sort((a,b) => b.start.localeCompare(a.start))[0] || null;

  if(!latest){
    return {status:'waiting',pillDay:null,periodDay:null,cycle:null,shouldRemind:false,
      title:'等待第一次經期開始',
      detail:'開始一個週期後，系統會從第 5 天起計算 28 天提醒。'};
  }

  const periodDay = dayDiff(today, latest.start) + 1;

  if(periodDay >= 1 && periodDay <= 4){
    return {status:'paused',pillDay:null,periodDay,cycle:latest,shouldRemind:false,
      title:'避孕藥提醒暫停',
      detail:`經期 Day ${periodDay}，第 1～4 天不提醒。`};
  }

  const pillDay = periodDay - 4;

  if(pillDay >= 1 && pillDay <= 28){
    return {status:'reminding',pillDay,periodDay,cycle:latest,shouldRemind:true,
      title:`避孕藥第 ${pillDay}/28 天`,
      detail:'今晚 21:00 提醒；實際服用仍以醫師與藥袋指示為準。'};
  }

  return {status:'completed',pillDay:28,periodDay,cycle:latest,shouldRemind:false,
    title:'本輪 28 天提醒已完成',
    detail:'等待下一次經期開始後，Day 1～4 暫停，Day 5 重新開始。'};
}

async function startCycleFromUI(){
  const date = $('#periodLogDate')?.value || todayISO();
  const button = $('#periodCycleStartBtn');
  if(button){ button.disabled = true; button.textContent = '建立中…'; }
  try{
    await createPeriodCycle(date);
    if($('#periodLogHas')) $('#periodLogHas').value = 'yes';
    toast(`已將 ${fmt(date)} 設為本次經期第 1 天`);
    await renderPeriod();
    await renderDashboard();
    setTimeout(() => showHomePeriodPopup(true), 350);
  }catch(e){
    console.error('start cycle failed', e);
    toast(e?.message || '無法開始經期');
  }finally{
    if(button){ button.disabled = false; button.textContent = '🩸 今天開始經期'; }
  }
}

async function endCycleFromUI(){
  const date = $('#periodLogDate')?.value || todayISO();
  const button = $('#periodCycleEndBtn');
  if(button){ button.disabled = true; button.textContent = '結束中…'; }
  try{
    await endPeriodCycle(date);
    toast(`本次經期已結束於 ${fmt(date)}`);
    await renderPeriod();
    await renderDashboard();
  }catch(e){
    console.error('end cycle failed', e);
    toast(e?.message || '無法結束經期');
  }finally{
    if(button){ button.disabled = false; button.textContent = '✅ 今天經期結束'; }
  }
}

// Override: daily logs are attached to the active cycle and never create a new Day 1.
async function savePeriodDailyLog(){
  const button = $('#periodDailyLogBtn');
  const state = await getCycleEngineState();
  if(!state.active){
    toast('請先按「今天開始經期」，再儲存當天狀況。');
    return;
  }

  const date = $('#periodLogDate')?.value || todayISO();
  if(dayDiff(date, state.active.start) < 0){
    toast('紀錄日期不能早於本次經期開始日。');
    return;
  }

  const payload = {
    cycle_id: state.active.id,
    log_date: date,
    has_period: true,
    flow: $('#periodLogFlow')?.value || '',
    pain: Number($('#periodLogPain')?.value || 0),
    mood: $('#periodLogMood')?.value || '',
    symptoms: $('#periodLogSymptoms')?.value.trim() || '',
    note: $('#periodLogNote')?.value.trim() || ''
  };

  if(button){ button.disabled = true; button.textContent = '儲存中…'; }

  try{
    if(db){
      const {error} = await db
        .from('period_daily_logs')
        .upsert({...payload, space_id:CLOUD_SPACE_ID}, {
          onConflict:'space_id,log_date'
        });
      if(error) throw error;
    }else{
      const logs = loadJSON(PERIOD_DAILY_LOG_KEY, []);
      const rest = logs.filter(l => l.date !== date);
      rest.unshift({
        id:Date.now(),
        date,
        cycle_id:state.active.id,
        has_period:true,
        flow:payload.flow,
        pain:payload.pain,
        mood:payload.mood,
        symptoms:payload.symptoms,
        note:payload.note
      });
      saveJSON(PERIOD_DAILY_LOG_KEY, rest.slice(0,300));
    }

    toast(`已儲存本次經期 Day ${dayDiff(date,state.active.start)+1}`);
    await renderPeriod();
    await renderDashboard();
  }catch(e){
    console.error('cycle daily log save failed', e);
    toast(e?.message || '當天狀況沒有寫入成功');
  }finally{
    if(button){ button.disabled = false; button.textContent = '儲存當天狀況'; }
  }
}

async function getRecordedPeriodState(){
  const state = await getCycleEngineState();
  const logs = await getPeriodDailyLogs();
  if(!state.active){
    return {active:false, day:null, start:null, end:null, logs};
  }
  return {
    active:true,
    day:state.day,
    start:state.active.start,
    end:null,
    cycleId:state.active.id,
    logs
  };
}

async function getPeriodPrediction(){
  const cycles = await getPeriodCycles();
  const completed = cycles.filter(c => c.end);
  const records = completed.map(c => ({
    id:c.id,
    start:c.start,
    end:c.end,
    note:c.note || ''
  }));
  const cycle = getCycleLength(records);
  const avgDays = averagePeriodDays(records);
  const active = cycles.find(c => !c.end) || null;

  if(active){
    return {
      records,
      cycle,
      avgDays,
      nextStart:null,
      nextEnd:null,
      warningDays:null,
      activeCycle:active
    };
  }

  const latest = completed[0] || null;
  const nextStart = latest ? addDaysISO(latest.start, cycle) : null;
  return {
    records,
    cycle,
    avgDays,
    nextStart,
    nextEnd: nextStart ? addDaysISO(nextStart, Math.max(1,avgDays-1)) : null,
    warningDays: nextStart ? dayDiff(nextStart,todayISO()) : null,
    activeCycle:null
  };
}

async function renderCycleControls(state){
  const panel = $('#cycleStatusPanel');
  const badge = $('#cycleStatusBadge');
  const startBtn = $('#periodCycleStartBtn');
  const endBtn = $('#periodCycleEndBtn');
  const hint = $('#cycleLogHint');
  const dailyBtn = $('#periodDailyLogBtn');

  if(state.active){
    if(badge) badge.textContent = `Day ${state.day}`;
    if(panel) panel.innerHTML = `
      <div class="cycle-big-day"><b>Day ${state.day}</b><span>本次經期進行中</span></div>
      <div class="cycle-meta"><span>開始日 ${fmt(state.active.start)}</span><span>尚未結束</span></div>`;
    if(startBtn) startBtn.disabled = true;
    if(endBtn) endBtn.disabled = false;
    if(hint) hint.textContent = `目前是本次經期 Day ${state.day}，每天儲存只會更新狀況，不會重設 Day 1。`;
    if(dailyBtn) dailyBtn.disabled = false;
  }else{
    if(badge) badge.textContent = '尚未開始';
    if(panel) panel.innerHTML = state.nextStart
      ? `<div class="cycle-big-day"><b>${fmt(state.nextStart)}</b><span>下次預估開始日</span></div>`
      : `<div class="cycle-big-day"><b>待開始</b><span>按下開始按鈕建立新週期</span></div>`;
    if(startBtn) startBtn.disabled = false;
    if(endBtn) endBtn.disabled = true;
    if(hint) hint.textContent = '目前沒有進行中的經期；請先按「今天開始經期」。';
    if(dailyBtn) dailyBtn.disabled = true;
  }
}

async function renderPeriod(){
  const info = await getPeriodPrediction();
  const state = await getCycleEngineState();
  const logs = await getPeriodDailyLogs();
  const mood = getDailyAngryPhoto();
  const warningText = getPeriodWarning();
  const alertActive = !!state.active && state.day <= 4;
  const pillState = await getPillEngineState();
  const pillActive = pillState.shouldRemind;

  $('#periodCard').innerHTML = `${alertActive
      ? `<div class="period-img-wrap"><img class="feature-img" src="${assetUrl(mood.src)}" alt="小舜警報照片"><div class="period-alert-chip">🚨 經期第 ${state.day} 天</div></div>`
      : renderCutePeriodImage()}
    <div class="feature-body">
      <div class="badge-row">
        <span class="badge">智慧週期 ${info.cycle} 天</span>
        <span class="badge">平均經期 ${info.avgDays} 天</span>
        ${state.active
          ? `<span class="badge">本次 Day ${state.day}</span>`
          : `<span class="badge">下次 ${cycleDateLabel(info.nextStart)}</span>`}
      </div>
      <h3>${state.active ? `🌸 本次經期 Day ${state.day}` : '🌸 漂亮小舜'}</h3>
      <p>${state.active
        ? (alertActive ? warningText : '本次經期仍在進行中。系統會一直從開始日計算 Day 數，直到你按下「今天經期結束」。')
        : '目前沒有進行中的經期。開始後，每日紀錄都會歸在同一個週期。'}</p>
      <div class="pill-inline-alert ${pillState.status}">
        💊 ${pillState.title}<br><small>${pillState.detail}</small>
      </div>
      <button type="button" class="notification-enable-btn" onclick="requestPeriodNotifications()">開啟手機通知</button>
    </div>`;

  await renderCycleControls(state);

  const groupedLogs = groupByMonth(logs,'date');
  const completed = info.records || [];
  const groupedRanges = groupByMonth(completed,'start');
  const allKeys = [...new Set([...groupedLogs.map(x=>x[0]), ...groupedRanges.map(x=>x[0])])].sort().reverse();

  $('#periodTable').innerHTML = `<div class="period-table glass">
    <div class="period-table-head"><b>經期歷史數據</b><span>平均週期 ${info.cycle} 天 / 平均 ${info.avgDays} 天</span></div>
    ${allKeys.length ? allKeys.map(key=>{
      const monthLogs=(groupedLogs.find(x=>x[0]===key)||[key,[]])[1];
      const monthRanges=(groupedRanges.find(x=>x[0]===key)||[key,[]])[1];
      return `<details class="month-accordion"><summary><b>${monthTitle(key,'經期狀況')}</b><span>${summarizePeriodMonth(monthRanges,monthLogs)}</span></summary>
        ${monthRanges.map(r=>`<div class="record-row"><div><b>${fmt(r.start)}～${fmt(r.end)}</b><p>${dayDiff(r.end,r.start)+1} 天${r.note?`・${r.note}`:''}</p></div></div>`).join('')}
        ${monthLogs.map(l=>`<div class="record-row daily-log-row"><div><b>${fmt(l.date)}</b><p>流量：${l.flow||'—'}｜疼痛：${l.pain||0}｜情緒：${l.mood||'—'}${l.symptoms?`<br>狀況：${l.symptoms}`:''}${l.note?`<br>備註：${l.note}`:''}</p></div><button onclick="deletePeriodDailyLog('${l.id}')">刪除</button></div>`).join('')}
      </details>`;
    }).join('') : '<div class="empty-card">尚無已完成的經期紀錄。</div>'}
  </div>`;

  const periodLogDate = $('#periodLogDate');
  if(periodLogDate && !periodLogDate.value) periodLogDate.value = todayISO();
  const startBtn = $('#periodCycleStartBtn');
  const endBtn = $('#periodCycleEndBtn');
  const dailyBtn = $('#periodDailyLogBtn');
  if(startBtn) startBtn.onclick = startCycleFromUI;
  if(endBtn) endBtn.onclick = endCycleFromUI;
  if(dailyBtn) dailyBtn.onclick = savePeriodDailyLog;
  bindImageFallbacks($('#periodCard'));
}

async function dashboardQuestionState(){
  const answers = await getDailyCoupleAnswers();
  const answered = new Set(answers.map(a=>a.author));
  return {
    shun: answered.has('蕭小舜'),
    wayne: answered.has('懷寶'),
    complete: answered.has('蕭小舜') && answered.has('懷寶')
  };
}

async function renderDashboard(){
  const grid = $('#dashboardGrid');
  if(!grid) return;

  const [cycleState, questionState, kapiRecords] = await Promise.all([
    getCycleEngineState(),
    dashboardQuestionState(),
    getKapiRecords()
  ]);

  const lastKapi = [...kapiRecords].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0] || null;
  const kapiRange = nextKapiRange(lastKapi);
  const today = todayISO();
  const pillState = await getPillEngineState();
  const pillStatus = {
    icon: pillState.status === 'paused' ? '⏸️' : '💊',
    title: pillState.title,
    detail: pillState.detail
  };

  const nextEvent = getNextSpecialEvent();

  const cards = [
    {
      icon:'❤️',
      title:'在一起',
      value:`${daysTogether()} 天`,
      detail:'蕭小舜 ♡ 懷寶',
      tab:'home'
    },
    {
      icon:'🌸',
      title:cycleState.active ? '本次經期' : '經期狀態',
      value:cycleState.active ? `Day ${cycleState.day}` : (cycleState.nextStart ? fmt(cycleState.nextStart) : '待開始'),
      detail:cycleState.active ? `開始於 ${fmt(cycleState.active.start)}・尚未結束` : '下一次預估／等待開始',
      tab:'period'
    },
    {
      icon:pillStatus.icon,
      title:pillStatus.title,
      value:pillState.status === 'reminding'
        ? `${pillState.pillDay}/28`
        : (pillState.status === 'paused' ? `Day ${pillState.periodDay}` : '—'),
      detail:pillStatus.detail,
      tab:'period'
    },
    {
      icon:'🎮',
      title:'今日必答',
      value:questionState.complete ? '兩人完成' : `${Number(questionState.shun)+Number(questionState.wayne)}/2`,
      detail:`小舜 ${questionState.shun?'✓':'○'}・懷寶 ${questionState.wayne?'✓':'○'}`,
      tab:'game'
    },
    {
      icon:'🦎',
      title:'卡皮',
      value:kapiRange ? `${fmt(kapiRange.start)}～${fmt(kapiRange.end)}` : '待紀錄',
      detail:kapiRange ? kapiStatusText(kapiRange) : '新增餵食紀錄後開始推算',
      tab:'kapi'
    },
    {
      icon:nextEvent?.emoji || '📅',
      title:'下一個重要日子',
      value:nextEvent ? nextEvent.name : '尚無日期',
      detail:nextEvent ? `${fmt(nextEvent.date)}・${specialEventCountdownText(nextEvent)}` : '等待設定',
      tab:'home'
    },
    {
      icon:'📷',
      title:'回憶照片',
      value:`${photos.length} 張`,
      detail:'每天首頁隨機回顧一張',
      tab:'home'
    }
  ];

  $('#dashboardDate').textContent = today;
  grid.innerHTML = cards.map(card=>`
    <button class="dashboard-card" type="button" onclick="showTab('${card.tab}')">
      <span class="dashboard-icon">${card.icon}</span>
      <span class="dashboard-copy"><small>${card.title}</small><b>${card.value}</b><em>${card.detail}</em></span>
    </button>`).join('');
}

// Extend initialization without changing the rest of the app.
const originalInitV102 = init;
init = async function(){
  await originalInitV102();
  await renderDashboard().catch(error => console.warn('dashboard failed', error));
};

// Refresh dashboard after tab visits and writes.
const originalShowTabV102 = showTab;
showTab = function(id){
  originalShowTabV102(id);
  if(id === 'home') renderDashboard().catch(()=>{});
};

window.startCycleFromUI = startCycleFromUI;
window.endCycleFromUI = endCycleFromUI;
window.renderDashboard = renderDashboard;
window.getPillEngineState = getPillEngineState;
