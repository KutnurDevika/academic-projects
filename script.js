// ══════════════════════════════════════════════════════════
//  ACADMAP — COMPLETE FEATURE SET (10/10 features)
// ══════════════════════════════════════════════════════════

// ── PAGE ROUTER ───────────────────────────────────────────
let _chartInstance = null;
let _skillDetailChart = null;

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + name);
  if (!target) return;
  target.classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'dashboard') { _initDashboard(); }
  if (['landing','features','about'].includes(name)) {
    setTimeout(() => {
      document.querySelectorAll('#page-' + name + ' .reveal').forEach(el => { el.classList.remove('visible'); setTimeout(() => el.classList.add('visible'), 80); });
      document.querySelectorAll('#page-' + name + ' .feat-card, #page-' + name + ' .about-card').forEach((c,i) => setTimeout(() => c.classList.add('visible'), i*100));
    }, 60);
  }
}

// ── THEME ─────────────────────────────────────────────────
(function applyTheme() {
  const t = localStorage.getItem('theme');
  if (t !== 'dark') { document.documentElement.classList.add('light'); if (!t) localStorage.setItem('theme','light'); }
})();

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  _toast(isLight ? '☀️ Light mode on' : '🌙 Dark mode on');
}

// ── SIDEBAR COLLAPSE ──────────────────────────────────────
function toggleSidebar() {
  const sb = document.getElementById('dashSidebar');
  if (!sb) return;
  sb.classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', sb.classList.contains('collapsed') ? '1' : '0');
}
function _restoreSidebar() {
  const sb = document.getElementById('dashSidebar');
  if (sb && localStorage.getItem('sidebarCollapsed') === '1') sb.classList.add('collapsed');
}

// ── STORAGE ───────────────────────────────────────────────
const store = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch(e) { return []; } },
  set: (k,d) => localStorage.setItem(k, JSON.stringify(d)),
  getObj: (k,def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v || def; } catch(e) { return def; } }
};

// ── SKILL DATA (core to feature 1,4,8,10) ────────────────
const SKILLS = [
  { name:'DSA',      target:90, color:'#6c63ff', suggestions:['Practice LeetCode arrays/trees','Study recursion & DP','Complete NPTEL DSA course'], resources:['GeeksforGeeks DSA','LeetCode 75','MIT OpenCourseWare 6.006'] },
  { name:'Web Dev',  target:90, color:'#00d4aa', suggestions:['Build 3 full-stack projects','Learn React/Node.js','Deploy on Vercel or Netlify'], resources:['The Odin Project','freeCodeCamp','MDN Web Docs'] },
  { name:'AI/ML',    target:85, color:'#ff6b6b', suggestions:['Complete Andrew Ng ML course','Practice on Kaggle datasets','Study neural networks basics'], resources:['Coursera ML by Andrew Ng','fast.ai','Kaggle Learn'] },
  { name:'DBMS',     target:90, color:'#a78bfa', suggestions:['Write 50 SQL queries daily','Study normalization forms','Practice ER diagram design'], resources:['SQLZoo','Khan Academy SQL','Stanford DB Course'] },
  { name:'Cloud',    target:80, color:'#ffd166', suggestions:['Get AWS Cloud Practitioner cert','Deploy a cloud-native app','Study serverless architecture'], resources:['AWS Skill Builder','Google Cloud Skills Boost','A Cloud Guru'] },
  { name:'Networks', target:85, color:'#06b6d4', suggestions:['Study OSI & TCP/IP models','Practice Cisco Packet Tracer','Learn about DNS, HTTP, TLS'], resources:['Cisco NetAcad','Professor Messer CompTIA','Computerphile YouTube'] },
];

function getSkillScores() {
  const saved = store.getObj('skillScores', null);
  if (saved) return saved;
  return { DSA:60, 'Web Dev':70, 'AI/ML':40, DBMS:80, Cloud:50, Networks:55 };
}

// ── SESSION ───────────────────────────────────────────────
function _initSession() {
  const session = JSON.parse(localStorage.getItem('acadmap_session') || 'null');
  if (!session) { showPage('login'); return; }
  const name = session.name || 'Student';
  const first = name.split(' ')[0];
  const sn = document.getElementById('sidebarName'); if (sn) sn.textContent = first;
  const sa = document.getElementById('sidebarAvatar'); if (sa) sa.textContent = first.charAt(0).toUpperCase();
  const greet = document.getElementById('greetName'); if (greet) greet.textContent = first;
}

function logout() {
  if (confirm('Sign out of AcadMap?')) { localStorage.removeItem('acadmap_session'); showPage('login'); }
}

// ── TOAST ─────────────────────────────────────────────────
function _toast(msg) {
  const el = document.getElementById('toast'); if (!el) return;
  document.getElementById('toastMsg').textContent = msg;
  el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2800);
}
function toast(msg) { _toast(msg); }

// ── ACTIVITY ──────────────────────────────────────────────
let _activities = [];
function addActivity(text) {
  const now = new Date();
  _activities.unshift({ text, time: now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) });
  if (_activities.length > 10) _activities.pop();
  _renderActivity();
}
function _renderActivity() {
  const feed = document.getElementById('activityFeed'); if (!feed) return;
  feed.innerHTML = _activities.length
    ? _activities.map(a => `<div class="activity-item"><div class="activity-dot"></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></div>`).join('')
    : '<div class="empty-state" style="padding:16px"><i class="fa fa-clock" style="font-size:20px"></i><p>No activity yet.</p></div>';
}

// ── NOTIFICATIONS ─────────────────────────────────────────
let _notifs = [];
function addNotif(msg) {
  _notifs.unshift(msg);
  const dot = document.getElementById('notifDot'); if (dot) dot.style.display = 'block';
}
function showNotifPanel() {
  const card = document.getElementById('notifCard'); if (!card) return;
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
  const list = document.getElementById('notifList');
  if (list) list.innerHTML = _notifs.length
    ? _notifs.map(n => `<div class="notif-item"><i class="fa fa-circle-info" style="color:var(--accent)"></i> ${n}</div>`).join('')
    : '<p style="color:var(--muted);font-size:13px">No notifications.</p>';
  const dot = document.getElementById('notifDot'); if (dot) dot.style.display = 'none';
}

// ── SECTION NAV ───────────────────────────────────────────
const _pageTitles = {
  overview:['Overview','Dashboard'], planner:['Task','Planner'], roadmap:['Academic','Roadmap'],
  timeline:['Event','Timeline'], pbl:['PBL','Tracker'], skills:['Skill Gap','Engine'], admin:['Admin','Panel'], ai:['AI','Advisor']
};
function showSection(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById(id); if (sec) sec.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  const t = _pageTitles[id]; const pt = document.getElementById('pageTitle');
  if (pt && t) pt.innerHTML = `${t[0]} <span>${t[1]}</span>`;
  if (id === 'overview') updateOverview();
  if (id === 'skills')   { renderSkillEditor(); renderSkillSuggestions(); renderSkillDetailChart(); }
  if (id === 'admin')    renderAdminMonitor();
  if (id === 'roadmap')  renderRoadmap();
  if (id === 'ai')       initAIAdvisor();
}

// ── FEATURE 1 & 10: SKILL GAP DETECTION ENGINE ───────────
function detectGaps() {
  const scores = getSkillScores();
  return SKILLS.filter(s => (scores[s.name] || 0) < 60);
}

function renderGapAlerts() {
  const gaps = detectGaps();
  const scores = getSkillScores();
  const el = document.getElementById('gapAlertList'); if (!el) return;
  const gc = document.getElementById('gapCount'); if (gc) gc.textContent = gaps.length;

  if (!gaps.length) {
    el.innerHTML = '<div class="gap-ok"><i class="fa fa-check-circle" style="color:var(--accent2);font-size:22px"></i><p style="color:var(--accent2);font-weight:600;margin-top:8px">No skill gaps detected! Great work 🎉</p></div>';
    return;
  }
  el.innerHTML = gaps.map(s => {
    const score = scores[s.name] || 0;
    const deficit = s.target - score;
    return `
    <div class="gap-alert-item">
      <div class="gap-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="gap-badge" style="background:${s.color}20;color:${s.color}">${s.name}</div>
          <span class="gap-score">${score}% <span style="color:var(--muted);font-weight:400;font-size:12px">/ ${s.target}% target (−${deficit}%)</span></span>
        </div>
        <div class="gap-bar-wrap"><div class="gap-bar" style="width:${score}%;background:${s.color}"></div></div>
      </div>
      <div class="gap-suggestions">
        ${s.suggestions.map(sg => `<div class="gap-tip"><i class="fa fa-arrow-right" style="color:${s.color}"></i> ${sg}</div>`).join('')}
        <div class="gap-resources-label">📚 Recommended Resources:</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
          ${s.resources.map(r => `<span class="resource-chip">${r}</span>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── FEATURE 2: ROADMAP GENERATOR ─────────────────────────
function addMilestone() {
  const title   = document.getElementById('rmTitle').value.trim();
  const sem     = document.getElementById('rmSemester').value;
  const subject = document.getElementById('rmSubject').value;
  const date    = document.getElementById('rmDate').value;
  const status  = document.getElementById('rmStatus').value;
  if (!title) { toast('Please enter a milestone title.'); return; }
  const ms = store.get('milestones');
  ms.push({ title, sem, subject, date, status, id: Date.now() });
  store.set('milestones', ms);
  document.getElementById('rmTitle').value = '';
  document.getElementById('rmDate').value = '';
  renderRoadmap(); addActivity(`Milestone added: "${title}"`); toast('Milestone added!');
}

function deleteMilestone(id) {
  store.set('milestones', store.get('milestones').filter(m => m.id !== id));
  renderRoadmap(); toast('Milestone removed.');
}

function changeMilestoneStatus(id, status) {
  const ms = store.get('milestones'); const m = ms.find(x => x.id === id);
  if (m) { m.status = status; store.set('milestones', ms); renderRoadmap(); }
}

function renderRoadmap() {
  const ms = store.get('milestones');
  const el = document.getElementById('roadmapView'); if (!el) return;
  if (!ms.length) { el.innerHTML = '<div class="empty-state"><i class="fa fa-map"></i><p>No milestones yet. Add your first!</p></div>'; return; }

  // Group by semester
  const grouped = {};
  ms.forEach(m => { if (!grouped[m.sem]) grouped[m.sem] = []; grouped[m.sem].push(m); });

  const statusIcon = s => s === 'Completed' ? '✅' : s === 'In Progress' ? '🔄' : '⏳';
  const statusClass = s => s === 'Completed' ? 'badge-done' : s === 'In Progress' ? 'badge-progress' : 'badge-started';

  el.innerHTML = Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([sem, items]) => `
    <div class="rm-semester-block">
      <div class="rm-sem-header"><i class="fa fa-graduation-cap"></i> ${sem}</div>
      <div class="rm-items">
        ${items.map(m => `
        <div class="rm-item">
          <div class="rm-dot" style="background:${SKILLS.find(s=>s.name===m.subject)?.color||'var(--accent)'}"></div>
          <div class="rm-content">
            <div class="rm-title-row">
              <span class="rm-title">${m.title}</span>
              <span class="badge ${statusClass(m.status)}">${statusIcon(m.status)} ${m.status}</span>
            </div>
            <div class="rm-meta">
              <span class="rm-subject" style="color:${SKILLS.find(s=>s.name===m.subject)?.color||'var(--accent)'}">${m.subject}</span>
              ${m.date ? `<span><i class="fa fa-calendar" style="font-size:10px"></i> ${m.date}</span>` : ''}
            </div>
            <div class="rm-actions">
              <button class="btn-xs" onclick="changeMilestoneStatus(${m.id},'In Progress')" style="background:rgba(108,99,255,0.12);color:var(--accent)">▶ Start</button>
              <button class="btn-xs" onclick="changeMilestoneStatus(${m.id},'Completed')" style="background:rgba(0,212,170,0.12);color:var(--accent2)">✓ Done</button>
              <button class="btn-xs btn-danger" onclick="deleteMilestone(${m.id})"><i class="fa fa-trash"></i></button>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>`).join('');
}

// ── FEATURE 3: DYNAMIC STUDY PLANNER ─────────────────────
let _currentFilter = 'all';

function addTask() {
  const name    = document.getElementById('taskName').value.trim();
  const date    = document.getElementById('taskDate').value;
  const subject = document.getElementById('taskSubject').value;
  const priority= document.getElementById('taskPriority').value;
  const status  = document.getElementById('taskStatus').value;
  if (!name) { toast('Please enter a task name.'); return; }
  const tasks = store.get('tasks');
  tasks.push({ name, date, subject, priority, status, id: Date.now() });
  store.set('tasks', tasks);
  document.getElementById('taskName').value = '';
  document.getElementById('taskDate').value = '';
  renderTasks(); addActivity(`Task added: "${name}"`);
  addNotif(`📌 New task: <b>${name}</b>`);
  updateOverview(); toast('Task added!');
}

function deleteTask(id) {
  store.set('tasks', store.get('tasks').filter(t => t.id !== id));
  renderTasks(); updateOverview(); toast('Task deleted.');
}

function toggleTask(id) {
  const tasks = store.get('tasks'); const t = tasks.find(t => t.id === id); if (!t) return;
  t.status = t.status === 'Completed' ? 'Not Started' : 'Completed';
  store.set('tasks', tasks); renderTasks(); updateOverview();
  addActivity(t.status === 'Completed' ? `✅ Completed: "${t.name}"` : `↩ Reopened: "${t.name}"`);
}

function filterTasks(f, btn) {
  _currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTasks();
}

function renderTasks() {
  let tasks = store.get('tasks');
  const total = tasks.length; const done = tasks.filter(t => t.status === 'Completed').length;
  const tt = document.getElementById('tTotal'); if (tt) tt.textContent = total;
  const td = document.getElementById('tDone');  if (td) td.textContent = done;
  const tl = document.getElementById('tLeft');  if (tl) tl.textContent = total - done;
  const tp = document.getElementById('taskProgress'); if (tp) tp.style.width = (total ? done/total*100 : 0) + '%';
  if (_currentFilter === 'Completed') tasks = tasks.filter(t => t.status === 'Completed');
  else if (_currentFilter !== 'all')  tasks = tasks.filter(t => t.priority === _currentFilter);
  const el = document.getElementById('taskList'); if (!el) return;
  if (!tasks.length) { el.innerHTML = '<div class="empty-state"><i class="fa fa-clipboard-list"></i><p>No tasks found.</p></div>'; return; }
  const sc = s => s === 'Completed' ? 'badge-done' : s === 'In Progress' ? 'badge-progress' : 'badge-started';
  const pc = p => p === 'High' ? 'badge-high' : p === 'Medium' ? 'badge-medium' : 'badge-low';
  const today = new Date(); today.setHours(0,0,0,0);
  el.innerHTML = tasks.map(t => {
    const due = t.date ? new Date(t.date) : null;
    const overdue = due && due < today && t.status !== 'Completed';
    return `<div class="task-item" data-priority="${t.priority}">
      <div class="task-check ${t.status==='Completed'?'done':''}" onclick="toggleTask(${t.id})">${t.status==='Completed'?'<i class="fa fa-check" style="font-size:10px"></i>':''}</div>
      <div class="task-body">
        <div class="task-name ${t.status==='Completed'?'done-text':''}">${t.name}${overdue?'<span class="overdue-tag">OVERDUE</span>':''}</div>
        <div class="task-meta">
          ${t.subject ? `<span class="task-subject">${t.subject}</span>` : ''}
          ${t.date ? `<span class="task-date ${overdue?'overdue-date':''}"><i class="fa fa-calendar" style="font-size:10px;margin-right:3px"></i>${t.date}</span>` : ''}
          <span class="badge ${pc(t.priority)}">${t.priority}</span>
          <span class="badge ${sc(t.status)}">${t.status}</span>
        </div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})"><i class="fa fa-trash"></i></button>
    </div>`;
  }).join('');
}

// ── FEATURE 4: PROGRESS ANALYTICS ────────────────────────
function updateOverview() {
  _updateGreetName();
  const tasks    = store.get('tasks');
  const projects = store.get('projects');
  const events   = store.get('events');
  const done  = tasks.filter(t => t.status === 'Completed').length;
  const pdone = projects.filter(p => p.status === 'Completed').length;

  _animateNum('taskCount',    tasks.length);
  _animateNum('projectCount', projects.length);
  _animateNum('eventCount',   events.length);

  const pct  = tasks.length    ? Math.round(done  / tasks.length    * 100) : 0;
  const ppct = projects.length ? Math.round(pdone / projects.length * 100) : 0;
  const tcp = document.getElementById('taskComplPct'); if (tcp) tcp.textContent = pct + '%';
  const pcp = document.getElementById('projCompPct'); if (pcp) pcp.textContent = ppct + '%';
  const ring = document.getElementById('ringFill'); if (ring) ring.style.strokeDashoffset = 314 - 314*pct/100;
  const rp = document.getElementById('ringPct'); if (rp) rp.textContent = pct + '%';

  renderGapAlerts();
  renderUpcomingDeadlines();
  renderSkillLegend();
}

function _updateGreetName() {
  const session = JSON.parse(localStorage.getItem('acadmap_session') || 'null');
  const name = session ? session.name.split(' ')[0] : 'Student';
  const el = document.getElementById('greetName'); if (el) el.textContent = name;
}

function _animateNum(id, target) {
  const el = document.getElementById(id); if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const dur = 600, t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderSkillLegend() {
  const el = document.getElementById('skillLegend'); if (!el) return;
  const scores = getSkillScores();
  el.innerHTML = SKILLS.map(s => {
    const score = scores[s.name] || 0;
    const isGap = score < 60;
    return `<div class="skill-row">
      <div class="skill-info">
        <span class="skill-dot" style="background:${s.color}"></span>
        <span class="skill-name">${s.name}</span>
        ${isGap ? '<span class="gap-tag">GAP</span>' : ''}
        <span class="skill-pct" style="color:${isGap?'#ff6b6b':s.color}">${score}%</span>
      </div>
      <div class="skill-track"><div class="skill-bar" style="width:${score}%;background:${s.color}"></div></div>
    </div>`;
  }).join('');
}

// ── FEATURE 5: TIMELINE ───────────────────────────────────
function addEvent() {
  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  const cat  = document.getElementById('eventCategory').value;
  if (!name) { toast('Please enter an event name.'); return; }
  const events = store.get('events');
  events.push({ name, date, cat, id: Date.now() });
  store.set('events', events);
  document.getElementById('eventName').value = '';
  document.getElementById('eventDate').value = '';
  renderEvents(); addActivity(`Event added: "${name}"`);
  addNotif(`📅 Upcoming: <b>${name}</b> on ${date || 'TBD'}`);
  updateOverview(); toast('Event added!');
}

function deleteEvent(id) {
  store.set('events', store.get('events').filter(e => e.id !== id));
  renderEvents(); updateOverview(); toast('Event removed.');
}

function renderEvents() {
  const events = store.get('events');
  const el = document.getElementById('eventList'); if (!el) return;
  if (!events.length) { el.innerHTML = '<div class="empty-state"><i class="fa fa-calendar-xmark"></i><p>No events yet. Add your first event!</p></div>'; return; }
  const today = new Date(); today.setHours(0,0,0,0);
  const sorted = [...events].sort((a,b) => new Date(a.date) - new Date(b.date));
  el.innerHTML = `<div class="tl-list">${sorted.map(e => {
    const d = e.date ? new Date(e.date) : null;
    const daysLeft = d ? Math.ceil((d - today) / 86400000) : null;
    const tag = daysLeft !== null ? (daysLeft < 0 ? `<span class="tl-tag overdue">Passed</span>` : daysLeft === 0 ? `<span class="tl-tag today">Today!</span>` : daysLeft <= 3 ? `<span class="tl-tag soon">${daysLeft}d left</span>` : `<span class="tl-tag upcoming">${daysLeft}d</span>`) : '';
    return `<div class="tl-item">
      <div class="tl-name">${e.cat} ${e.name} ${tag}</div>
      <div class="tl-date"><i class="fa fa-calendar" style="font-size:10px;margin-right:4px"></i>${e.date || 'No date set'}</div>
      <div class="tl-actions"><button class="btn btn-danger btn-sm" onclick="deleteEvent(${e.id})"><i class="fa fa-trash"></i> Remove</button></div>
    </div>`;
  }).join('')}</div>`;
}

// ── FEATURE 6: PBL TRACKER ────────────────────────────────
const _pblIcons = ['💡','🔬','🧠','🖥️','🌐','📡','🤖','📊'];

function addProject() {
  const name    = document.getElementById('projectName').value.trim();
  const subject = document.getElementById('projectSubject').value.trim();
  const date    = document.getElementById('projectDate').value;
  const status  = document.getElementById('projectStatus').value;
  if (!name) { toast('Please enter a project name.'); return; }
  const projects = store.get('projects');
  const newProj = { name, subject, date, status, id: Date.now(), icon: _pblIcons[Math.floor(Math.random()*_pblIcons.length)], githubPushed: false, githubUrl: '', completedDate: status === 'Completed' ? new Date().toLocaleDateString() : '' };
  projects.push(newProj);
  store.set('projects', projects);
  document.getElementById('projectName').value = '';
  document.getElementById('projectSubject').value = '';
  document.getElementById('projectDate').value = '';
  renderProjects(); addActivity(`Project added: "${name}"`); updateOverview(); toast('Project added!');
  if (status === 'Completed') setTimeout(() => showGitHubNotification(newProj.id), 500);
}

function deleteProject(id) {
  store.set('projects', store.get('projects').filter(p => p.id !== id));
  renderProjects(); updateOverview(); toast('Project removed.');
}

function changeProjectStatus(id, status) {
  const projects = store.get('projects'); const p = projects.find(p => p.id === id);
  if (!p) return;
  const wasCompleted = p.status === 'Completed';
  p.status = status;
  if (status === 'Completed' && !p.completedDate) p.completedDate = new Date().toLocaleDateString();
  store.set('projects', projects);
  renderProjects(); updateOverview(); addActivity(`Project "${p.name}" → ${status}`);
  // 🔔 When a project is newly marked Completed, prompt GitHub upload
  if (status === 'Completed' && !wasCompleted && !p.githubPushed) {
    setTimeout(() => showGitHubNotification(id), 400);
  }
}

function renderProjects() {
  const projects = store.get('projects'); const el = document.getElementById('projectList'); if (!el) return;
  if (!projects.length) { el.innerHTML = '<div class="empty-state"><i class="fa fa-lightbulb"></i><p>No projects yet. Start your first!</p></div>'; return; }
  const sb = s => s === 'Completed' ? 'badge-done' : s === 'In Progress' ? 'badge-progress' : 'badge-started';
  el.innerHTML = `<div class="pbl-grid">${projects.map(p => {
    const today = new Date(); today.setHours(0,0,0,0);
    const due = p.date ? new Date(p.date) : null;
    const daysLeft = due ? Math.ceil((due - today)/86400000) : null;
    const overdue = daysLeft !== null && daysLeft < 0 && p.status !== 'Completed';
    const ghBadge = p.status === 'Completed'
      ? (p.githubPushed
          ? `<span class="github-badge pushed" title="Pushed to GitHub ✓"><i class="fa-brands fa-github"></i> Pushed</span>`
          : `<span class="github-badge not-pushed" onclick="showGitHubModal(${p.id})" title="Upload to GitHub"><i class="fa-brands fa-github"></i> Push to GitHub</span>`)
      : '';
    const ghClass = p.status === 'Completed' ? (p.githubPushed ? 'github-done' : 'needs-github') : '';
    return `<div class="pbl-card ${ghClass}" data-status="${p.status}">
      <div class="pbl-icon">${p.icon}</div>
      <div class="pbl-name">${p.name}</div>
      ${p.subject ? `<div style="font-size:12px;color:var(--muted);margin-bottom:6px">${p.subject}</div>` : ''}
      ${p.date ? `<div style="font-size:11px;color:${overdue?'#ff6b6b':'var(--muted)'};margin-bottom:10px"><i class="fa fa-calendar"></i> ${p.date}${overdue?' · OVERDUE':daysLeft===0?' · Due today':daysLeft&&daysLeft<=3?` · ${daysLeft}d left`:''}</div>` : ''}
      ${p.githubUrl ? `<div style="font-size:11px;margin-bottom:8px"><i class="fa-brands fa-github" style="color:#00d4aa;margin-right:4px"></i><a href="${p.githubUrl}" target="_blank" style="color:var(--accent2);text-decoration:none;word-break:break-all">${p.githubUrl}</a></div>` : ''}
      <div class="pbl-status-row">
        <span class="badge ${sb(p.status)}">${p.status}</span>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          ${ghBadge}
          <button class="btn-sm" style="background:rgba(108,99,255,0.15);color:#a5b4fc;font-family:'DM Sans',sans-serif" onclick="changeProjectStatus(${p.id},'In Progress')">▶</button>
          <button class="btn-sm" style="background:rgba(0,212,170,0.15);color:var(--accent2);font-family:'DM Sans',sans-serif" onclick="changeProjectStatus(${p.id},'Completed')">✓</button>
          <button class="btn-sm btn-danger" onclick="deleteProject(${p.id})"><i class="fa fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

// ── GITHUB INTEGRATION ────────────────────────────────────
function showGitHubNotification(projectId) {
  const projects = store.get('projects');
  const p = projects.find(pr => pr.id === projectId);
  if (!p || p.githubPushed) return;

  // Remove any existing reminder toast
  document.querySelectorAll('.gh-reminder-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'gh-reminder-toast';
  toast.id = 'ghToast_' + projectId;
  toast.innerHTML = `
    <div class="gh-rt-title">
      <i class="fa-brands fa-github" style="font-size:18px;color:#00d4aa"></i>
      🎉 Project Completed! Upload to GitHub
    </div>
    <div class="gh-rt-body">
      <b style="color:#fff">"${p.name}"</b> is done! Push it to GitHub to showcase your work and keep your portfolio up to date.
    </div>
    <div class="gh-rt-actions">
      <button class="gh-rt-btn gh-rt-btn-primary" onclick="showGitHubModal(${projectId});this.closest('.gh-reminder-toast').remove()">
        <i class="fa-brands fa-github"></i> Upload Now
      </button>
      <button class="gh-rt-btn gh-rt-btn-dismiss" onclick="this.closest('.gh-reminder-toast').remove()">
        Later
      </button>
    </div>`;
  document.body.appendChild(toast);
  // Auto-dismiss after 12s
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 12000);
}

function showGitHubModal(projectId) {
  const projects = store.get('projects');
  const p = projects.find(pr => pr.id === projectId);
  if (!p) return;

  // Remove existing modal
  document.getElementById('ghModalOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'gh-modal-overlay';
  overlay.id = 'ghModalOverlay';
  overlay.innerHTML = `
    <div class="gh-modal">
      <h3><i class="fa-brands fa-github"></i> Push to GitHub</h3>
      <p>Enter the GitHub repository URL where you've uploaded <b style="color:#fff">"${p.name}"</b>. This will be saved in your PBL Tracker and daily reminders will stop.</p>
      <div class="form-group">
        <label class="form-label">GitHub Repository URL</label>
        <input type="url" id="ghRepoUrl" placeholder="https://github.com/yourusername/project-name" value="${p.githubUrl || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Commit Message (optional)</label>
        <input type="text" id="ghCommitMsg" placeholder="e.g. Initial commit - ${p.name}">
      </div>
      <div class="gh-modal-btns">
        <button class="gh-btn-confirm" onclick="confirmGitHubPush(${projectId})">
          <i class="fa-brands fa-github"></i> Confirm GitHub Push
        </button>
        <button class="gh-btn-cancel" onclick="document.getElementById('ghModalOverlay').remove()">Cancel</button>
      </div>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('ghRepoUrl')?.focus(), 100);
}

function confirmGitHubPush(projectId) {
  const url = document.getElementById('ghRepoUrl')?.value.trim();
  const msg = document.getElementById('ghCommitMsg')?.value.trim();
  if (!url) { _toast('Please enter a GitHub repository URL.'); return; }
  if (!url.startsWith('http')) { _toast('Please enter a valid URL starting with https://'); return; }

  const projects = store.get('projects');
  const p = projects.find(pr => pr.id === projectId);
  if (!p) return;

  p.githubPushed = true;
  p.githubUrl = url;
  p.githubMsg = msg || '';
  p.githubDate = new Date().toLocaleDateString();
  store.set('projects', projects);

  // Cancel daily reminders for this project
  cancelGitHubReminder(projectId);

  document.getElementById('ghModalOverlay')?.remove();
  renderProjects();
  updateOverview();
  // Refresh overview banner (may remove it if no more pending)
  showGitHubOverviewReminders();
  addActivity(`🐙 GitHub push: "${p.name}" → ${url}`);
  addNotif(`✅ <b>${p.name}</b> pushed to GitHub on ${p.githubDate}`);

  _toast('🎉 GitHub push recorded! Great work!');
}

// ── DAILY GITHUB REMINDERS ────────────────────────────────
let _ghReminderIntervals = {};

function showGitHubOverviewReminders() {
  // Remove any existing banner
  document.getElementById('ghOverviewBanner')?.remove();

  const projects = store.get('projects');
  const pending = projects.filter(p => p.status === 'Completed' && !p.githubPushed);
  if (!pending.length) return;

  // Build in-page banner inside the overview section
  const overview = document.getElementById('overview');
  if (!overview) return;

  const banner = document.createElement('div');
  banner.id = 'ghOverviewBanner';
  banner.style.cssText = `
    background:linear-gradient(135deg,rgba(45,164,78,0.12),rgba(108,99,255,0.1));
    border:1px solid rgba(45,164,78,0.4);border-radius:16px;padding:20px 24px;
    margin-bottom:20px;animation:slideUp 0.4s cubic-bezier(.22,1,.36,1);
  `;
  banner.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
      <div style="font-size:28px;line-height:1">🐙</div>
      <div style="flex:1;min-width:200px">
        <div style="font-weight:700;font-size:15px;color:#fff;margin-bottom:4px;display:flex;align-items:center;gap:8px">
          <i class="fa-brands fa-github"></i>
          ${pending.length === 1 ? 'Project ready for GitHub!' : `${pending.length} projects ready for GitHub!`}
          <span style="background:rgba(255,107,107,0.2);color:#ff6b6b;border-radius:50px;padding:2px 10px;font-size:11px;font-weight:700;border:1px solid rgba(255,107,107,0.3)">⏰ Daily Reminder</span>
        </div>
        <p style="font-size:13px;color:rgba(255,255,255,0.65);margin:0 0 14px;line-height:1.6">
          ${pending.length === 1
            ? `<b style="color:#fff">"${pending[0].name}"</b> is completed but not pushed to GitHub yet. Upload it to showcase your work!`
            : `You have <b style="color:#fff">${pending.length} completed projects</b> not yet pushed to GitHub. Keep your portfolio up to date!`}
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${pending.map(p => `
            <button onclick="showGitHubModal(${p.id})" style="
              padding:8px 16px;background:linear-gradient(135deg,#2da44e,#1a7f37);color:#fff;
              border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;
              font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;
              transition:all 0.2s;box-shadow:0 4px 12px rgba(45,164,78,0.3)
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='none'">
              <i class="fa-brands fa-github"></i> Push "${p.name}"
            </button>`).join('')}
        </div>
      </div>
      <button onclick="document.getElementById('ghOverviewBanner').remove()" style="
        background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);
        width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s
      " title="Dismiss">✕</button>
    </div>`;

  // Insert at the very top of the overview section, before all child elements
  overview.insertBefore(banner, overview.firstChild);

  // Also show a toast for extra visibility
  pending.forEach((p, i) => {
    setTimeout(() => showGitHubToastReminder(p.id), 800 + i * 300);
  });

  // Add to notifications
  pending.forEach(p => {
    const key = 'gh_notif_' + p.id + '_' + new Date().toDateString();
    if (!localStorage.getItem(key)) {
      addNotif(`⏰ Daily Reminder: <b>${p.name}</b> is done — push it to GitHub!`);
      localStorage.setItem(key, '1');
    }
  });
}

function showGitHubToastReminder(projectId) {
  const projects = store.get('projects');
  const p = projects.find(pr => pr.id === projectId);
  if (!p || p.githubPushed) return;

  // Only show toast once per day per project
  const key = 'gh_toast_' + projectId + '_' + new Date().toDateString();
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');

  document.querySelectorAll('.gh-reminder-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'gh-reminder-toast';
  toast.innerHTML = `
    <div class="gh-rt-title">
      <i class="fa-brands fa-github" style="font-size:18px;color:#ffd166"></i>
      ⏰ Push "${p.name}" to GitHub!
    </div>
    <div class="gh-rt-body">
      Project completed${p.completedDate ? ` on ${p.completedDate}` : ''} but not yet on GitHub. Upload it to your portfolio!
    </div>
    <div class="gh-rt-actions">
      <button class="gh-rt-btn gh-rt-btn-primary" onclick="showGitHubModal(${projectId});this.closest('.gh-reminder-toast').remove()">
        <i class="fa-brands fa-github"></i> Upload Now
      </button>
      <button class="gh-rt-btn gh-rt-btn-dismiss" onclick="this.closest('.gh-reminder-toast').remove()">
        Dismiss
      </button>
    </div>`;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 12000);
}

function cancelGitHubReminder(projectId) {
  clearInterval(_ghReminderIntervals[projectId]);
  delete _ghReminderIntervals[projectId];
  // Clear daily keys for this project
  const todayKey = 'gh_toast_' + projectId + '_' + new Date().toDateString();
  localStorage.removeItem(todayKey);
}

// ── FEATURE 7: SMART NOTIFICATIONS & REMINDERS ───────────
function runSmartReminders() {
  const tasks    = store.get('tasks');
  const projects = store.get('projects');
  const events   = store.get('events');
  const today    = new Date(); today.setHours(0,0,0,0);
  let count = 0;

  tasks.forEach(t => {
    if (t.status === 'Completed') return;
    const d = t.date ? new Date(t.date) : null;
    if (!d) return;
    const days = Math.ceil((d - today) / 86400000);
    if (days < 0)    { addNotif(`🔴 OVERDUE task: <b>${t.name}</b> was due ${t.date}`); count++; }
    else if (days === 0) { addNotif(`🟡 Task due TODAY: <b>${t.name}</b>`); count++; }
    else if (days <= 3)  { addNotif(`🟠 Task due in ${days}d: <b>${t.name}</b>`); count++; }
  });

  projects.forEach(p => {
    if (p.status === 'Completed') return;
    const d = p.date ? new Date(p.date) : null;
    if (!d) return;
    const days = Math.ceil((d - today) / 86400000);
    if (days < 0)    { addNotif(`🔴 OVERDUE project: <b>${p.name}</b>`); count++; }
    else if (days <= 5) { addNotif(`🟠 Project due in ${days}d: <b>${p.name}</b>`); count++; }
  });

  events.forEach(e => {
    const d = e.date ? new Date(e.date) : null;
    if (!d) return;
    const days = Math.ceil((d - today) / 86400000);
    if (days === 0)   { addNotif(`📅 Event TODAY: <b>${e.name}</b>`); count++; }
    else if (days <=3){ addNotif(`📅 Upcoming in ${days}d: <b>${e.name}</b>`); count++; }
  });

  // Skill gap reminders
  const gaps = detectGaps();
  gaps.forEach(g => { addNotif(`🧠 Skill gap: Study <b>${g.name}</b> — currently below 60%`); count++; });

  // Incomplete tasks with no due date
  const noDue = tasks.filter(t => !t.date && t.status !== 'Completed');
  if (noDue.length) { addNotif(`⚠️ ${noDue.length} task(s) have no due date set`); count++; }

  toast(count > 0 ? `🔔 ${count} reminder(s) generated!` : '✅ All clear — no urgent reminders!');
}

function renderUpcomingDeadlines() {
  const el = document.getElementById('upcomingDeadlines'); if (!el) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const items = [];

  store.get('tasks').forEach(t => {
    if (!t.date || t.status === 'Completed') return;
    const d = new Date(t.date); const days = Math.ceil((d-today)/86400000);
    if (days <= 7) items.push({ label: t.name, date: t.date, days, type:'task', priority: t.priority });
  });
  store.get('events').forEach(e => {
    if (!e.date) return;
    const d = new Date(e.date); const days = Math.ceil((d-today)/86400000);
    if (days <= 7) items.push({ label: e.name, date: e.date, days, type:'event' });
  });
  store.get('projects').forEach(p => {
    if (!p.date || p.status === 'Completed') return;
    const d = new Date(p.date); const days = Math.ceil((d-today)/86400000);
    if (days <= 7) items.push({ label: p.name, date: p.date, days, type:'project' });
  });

  items.sort((a,b) => a.days - b.days);
  if (!items.length) { el.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:8px 0">No upcoming deadlines in the next 7 days 🎉</p>'; return; }

  const typeIcon = t => t === 'task' ? '📌' : t === 'event' ? '📅' : '🔬';
  const urgency  = d => d < 0 ? 'color:#ff6b6b' : d === 0 ? 'color:var(--accent4)' : d <= 2 ? 'color:#ff9f43' : 'color:var(--accent2)';
  const dLabel   = d => d < 0 ? 'OVERDUE' : d === 0 ? 'TODAY' : d === 1 ? 'Tomorrow' : `${d} days`;

  el.innerHTML = `<div class="deadline-list">${items.map(i => `
    <div class="deadline-item">
      <span class="dl-icon">${typeIcon(i.type)}</span>
      <span class="dl-label">${i.label}</span>
      <span class="dl-date">${i.date}</span>
      <span class="dl-days" style="${urgency(i.days)}">${dLabel(i.days)}</span>
    </div>`).join('')}</div>`;
}

// ── FEATURE 8: SKILL EDITOR & DETAIL CHART ───────────────
function renderSkillEditor() {
  const scores = getSkillScores();
  const el = document.getElementById('skillEditorList'); if (!el) return;
  el.innerHTML = SKILLS.map(s => {
    const score = scores[s.name] || 0;
    return `<div class="skill-edit-row">
      <div class="skill-edit-label" style="color:${s.color}">${s.name}</div>
      <input type="range" min="0" max="100" value="${score}" id="skill_${s.name.replace(/\//g,'_').replace(/ /g,'_')}"
        oninput="document.getElementById('sv_${s.name.replace(/\//g,'_').replace(/ /g,'_')}').textContent=this.value+'%'"
        style="accent-color:${s.color};flex:1">
      <span class="skill-edit-val" id="sv_${s.name.replace(/\//g,'_').replace(/ /g,'_')}">${score}%</span>
    </div>`;
  }).join('');
}

function saveSkillScores() {
  const scores = {};
  SKILLS.forEach(s => {
    const key = s.name.replace(/\//g,'_').replace(/ /g,'_');
    const el = document.getElementById('skill_' + key);
    if (el) scores[s.name] = parseInt(el.value);
  });
  store.set('skillScores', JSON.stringify(scores));
  localStorage.setItem('skillScores', JSON.stringify(scores));
  renderSkillSuggestions();
  renderSkillDetailChart();
  updateChartData();
  renderGapAlerts();
  renderSkillLegend();
  updateOverview();
  toast('✅ Skill scores updated & analysed!');
  addActivity('Skill scores updated');
}

function renderSkillSuggestions() {
  const scores = getSkillScores();
  const el = document.getElementById('skillSuggestions'); if (!el) return;
  const all = SKILLS.map(s => ({ ...s, score: scores[s.name] || 0 })).sort((a,b) => a.score - b.score);
  const gaps = all.filter(s => s.score < 60);
  const good = all.filter(s => s.score >= 80);

  if (!gaps.length) {
    el.innerHTML = `<div style="padding:20px;text-align:center"><i class="fa fa-trophy" style="font-size:32px;color:var(--accent4)"></i><p style="margin-top:12px;font-weight:600;color:var(--accent2)">All skills above gap threshold! Focus on maintaining and advancing. 🚀</p></div>`;
    return;
  }

  el.innerHTML = gaps.map(s => `
    <div class="suggestion-card" style="border-left:4px solid ${s.color}">
      <div class="sug-header">
        <span class="sug-subject" style="color:${s.color}">${s.name}</span>
        <span class="sug-score">${s.score}% → target ${s.target}%</span>
        <div class="sug-bar-wrap"><div class="sug-bar" style="width:${s.score}%;background:${s.color}"></div><div class="sug-target" style="left:${s.target}%"></div></div>
      </div>
      <div class="sug-section-title">📋 Recommended Actions:</div>
      <ul class="sug-list">${s.suggestions.map(sg => `<li>${sg}</li>`).join('')}</ul>
      <div class="sug-section-title">📚 Learning Resources:</div>
      <div class="resource-chips">${s.resources.map(r => `<span class="resource-chip">${r}</span>`).join('')}</div>
    </div>`).join('')
  + (good.length ? `<div class="card" style="margin-top:16px;background:rgba(0,212,170,0.06);border:1px solid rgba(0,212,170,0.2)">
      <div class="card-title" style="color:var(--accent2)"><i class="fa fa-star"></i> Strong Skills — Keep it up!</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${good.map(s => `<span class="resource-chip" style="background:${s.color}20;color:${s.color}">${s.name} ${s.score}%</span>`).join('')}</div>
    </div>` : '');
}

function renderSkillDetailChart() {
  const scores = getSkillScores();
  const ctx = document.getElementById('skillDetailChart'); if (!ctx) return;
  if (_skillDetailChart) { _skillDetailChart.destroy(); _skillDetailChart = null; }
  _skillDetailChart = new Chart(ctx.getContext('2d'), {
    type: 'radar',
    data: {
      labels: SKILLS.map(s => s.name),
      datasets: [{
        label: 'Current', data: SKILLS.map(s => scores[s.name] || 0),
        backgroundColor: 'rgba(108,99,255,0.15)', borderColor: '#6c63ff', borderWidth: 2, pointBackgroundColor: '#6c63ff'
      },{
        label: 'Target', data: SKILLS.map(s => s.target),
        backgroundColor: 'rgba(0,212,170,0.08)', borderColor: '#00d4aa', borderWidth: 2, borderDash:[5,5], pointBackgroundColor: '#00d4aa'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: 'var(--text)', font: { family:'DM Sans',size:12 } } } },
      scales: { r: { min:0, max:100, ticks: { color:'var(--muted)', stepSize:20 }, grid: { color:'rgba(255,255,255,0.07)' }, pointLabels: { color:'var(--text)', font:{family:'DM Sans',size:12} } } }
    }
  });
}

// ── FEATURE 9: ADMIN MONITORING ───────────────────────────
const _avatarColors = ['#6c63ff','#00d4aa','#ff6b6b','#ffd166','#06b6d4','#a78bfa'];

function addUser() {
  const name = document.getElementById('userName').value.trim();
  const role = document.getElementById('userRole').value;
  if (!name) { toast('Please enter a name.'); return; }
  const users = store.get('users');
  users.push({ name, role, id: Date.now(), color: _avatarColors[users.length % _avatarColors.length] });
  store.set('users', users);
  document.getElementById('userName').value = '';
  renderUsers(); renderAdminMonitor(); addActivity(`User added: "${name}"`); toast('User added!');
}

function deleteUser(id) {
  store.set('users', store.get('users').filter(u => u.id !== id));
  renderUsers(); renderAdminMonitor(); toast('User removed.');
}

function renderUsers() {
  const users = store.get('users'); const el = document.getElementById('userList'); if (!el) return;
  if (!users.length) { el.innerHTML = '<div class="empty-state"><i class="fa fa-user-slash"></i><p>No users yet.</p></div>'; return; }
  el.innerHTML = users.map(u => `
    <div class="user-card">
      <div class="user-av" style="background:${u.color}">${u.name.charAt(0).toUpperCase()}</div>
      <div style="flex:1"><div class="user-card-name">${u.name}</div><div class="user-card-sub">${u.role}</div></div>
      <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})"><i class="fa fa-trash"></i></button>
    </div>`).join('');
}

function renderAdminMonitor() {
  const tasks    = store.get('tasks');
  const projects = store.get('projects');
  const events   = store.get('events');
  const scores   = getSkillScores();
  const gaps     = detectGaps();

  const el1 = document.getElementById('adminAcademicStats');
  if (el1) {
    const done = tasks.filter(t => t.status === 'Completed').length;
    const pct  = tasks.length ? Math.round(done/tasks.length*100) : 0;
    el1.innerHTML = `
      <div class="admin-stat"><span>Total Tasks</span><b>${tasks.length}</b></div>
      <div class="admin-stat"><span>Completed</span><b style="color:var(--accent2)">${done} (${pct}%)</b></div>
      <div class="admin-stat"><span>Pending</span><b style="color:var(--accent4)">${tasks.length - done}</b></div>
      <div class="admin-stat"><span>Total Events</span><b>${events.length}</b></div>
      <div class="admin-stat"><span>Milestones</span><b>${store.get('milestones').length}</b></div>
      <div class="admin-prog"><div class="admin-prog-fill" style="width:${pct}%"></div></div>
      <p style="font-size:11px;color:var(--muted);margin-top:6px">Overall task completion: ${pct}%</p>`;
  }

  const el2 = document.getElementById('adminGapMonitor');
  if (el2) {
    el2.innerHTML = gaps.length
      ? gaps.map(g => `<div class="admin-gap-item"><span class="admin-gap-name" style="color:${g.color}">${g.name}</span><span class="admin-gap-score" style="color:#ff6b6b">${scores[g.name] || 0}%</span></div>`).join('')
        + `<p style="font-size:11px;color:var(--muted);margin-top:10px">${gaps.length} skill gap(s) require attention</p>`
      : '<p style="color:var(--accent2);font-size:13px;margin-top:8px">✅ No skill gaps detected</p>';
  }

  const el3 = document.getElementById('adminProjectMonitor');
  if (el3) {
    const pdone = projects.filter(p => p.status === 'Completed').length;
    const pip   = projects.filter(p => p.status === 'In Progress').length;
    const pns   = projects.filter(p => p.status === 'Not Started').length;
    const ppct  = projects.length ? Math.round(pdone/projects.length*100) : 0;
    el3.innerHTML = `
      <div class="admin-stat"><span>Total Projects</span><b>${projects.length}</b></div>
      <div class="admin-stat"><span>Completed</span><b style="color:var(--accent2)">${pdone}</b></div>
      <div class="admin-stat"><span>In Progress</span><b style="color:#ffd166">${pip}</b></div>
      <div class="admin-stat"><span>Not Started</span><b style="color:var(--muted)">${pns}</b></div>
      <div class="admin-prog"><div class="admin-prog-fill" style="width:${ppct}%;background:var(--accent2)"></div></div>
      <p style="font-size:11px;color:var(--muted);margin-top:6px">Project completion: ${ppct}%</p>`;
  }
}

// ── MAIN CHART (skill bar chart) ──────────────────────────
function updateChartData() {
  if (!_chartInstance) return;
  const scores = getSkillScores();
  _chartInstance.data.datasets[0].data = SKILLS.map(s => scores[s.name] || 0);
  _chartInstance.update();
}

// ── DASHBOARD INIT ────────────────────────────────────────
function _initDashboard() {
  _initSession();
  _restoreSidebar();
  if (!_chartInstance) {
    const ctx = document.getElementById('skillChart');
    if (ctx) {
      const scores = getSkillScores();
      _chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: SKILLS.map(s => s.name),
          datasets: [{
            label: 'Current Level',
            data: SKILLS.map(s => scores[s.name] || 0),
            backgroundColor: SKILLS.map(s => s.color + 'bb'),
            borderColor: SKILLS.map(s => s.color),
            borderWidth: 2, borderRadius: 8, borderSkipped: false,
          },{
            label: 'Target Level',
            data: SKILLS.map(s => s.target),
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.2)',
            borderWidth: 2, borderRadius: 8, borderSkipped: false,
          }]
        },
        options: {
          responsive: true, animation: { duration:1000, easing:'easeOutQuart' },
          plugins: {
            legend: { labels: { color:'var(--muted)', font:{family:'DM Sans',size:12} } },
            tooltip: { backgroundColor:'#1c1f35', titleColor:'#e8eaf6', bodyColor:'#6b7280', borderColor:'rgba(108,99,255,0.3)', borderWidth:1, padding:12, cornerRadius:10 }
          },
          scales: {
            x: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'var(--muted)',font:{family:'DM Sans',size:12}} },
            y: { min:0, max:100, grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'var(--muted)',font:{family:'DM Sans',size:12}, callback:v=>v+'%'} }
          }
        }
      });
    }
  }
  renderTasks(); renderEvents(); renderProjects(); renderUsers();
  updateOverview(); runSmartReminders();
  // Show GitHub push reminders immediately on dashboard load
  showGitHubOverviewReminders();
}

// ── AUTH: TOGGLE PASSWORD ─────────────────────────────────
function togglePw(id, btn) {
  const input = document.getElementById(id); if (!input) return;
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.innerHTML = `<i class="fa fa-eye${isText?'':'-slash'}"></i>`;
}

// ── AUTH: LOGIN ───────────────────────────────────────────
function handleLogin() {
  const email    = (document.getElementById('loginEmail')   ||{}).value||'';
  const password = (document.getElementById('loginPassword')||{}).value||'';
  const err = document.getElementById('loginErrorMsg');
  const showErr = msg => { if (!err) return; err.innerHTML=`<i class="fa fa-circle-exclamation"></i> ${msg}`; err.classList.remove('show'); setTimeout(()=>err.classList.add('show'),10); };
  if (!email.trim() || !password.trim()) { showErr('Please fill in all fields.'); return; }
  const users = JSON.parse(localStorage.getItem('acadmap_users')||'[]');
  const match = users.find(u => u.email === email.trim() && u.password === password);
  if (match || (email.trim()==='demo@acadmap.com' && password==='demo123')) {
    const name = match ? match.name : 'Demo Student';
    localStorage.setItem('acadmap_session', JSON.stringify({name, email}));
    const dashUsers = JSON.parse(localStorage.getItem('users')||'[]');
    if (!dashUsers.find(u => u.name === name)) { dashUsers.unshift({name,role:'Student',id:Date.now(),color:'#6c63ff'}); localStorage.setItem('users',JSON.stringify(dashUsers)); }
    showPage('dashboard');
  } else { showErr('Invalid email or password.'); }
}

// ── AUTH: SIGNUP ──────────────────────────────────────────
function checkStrength(val) {
  const fill = document.getElementById('strengthFill'); const label = document.getElementById('strengthLabel');
  if (!fill || !label) return;
  let score = 0;
  if (val.length >= 8) score++; if (/[A-Z]/.test(val)) score++; if (/[0-9]/.test(val)) score++; if (/[^A-Za-z0-9]/.test(val)) score++;
  const c = [{w:'0%',bg:'#eee',txt:'Enter a password'},{w:'25%',bg:'#ff6b6b',txt:'Weak'},{w:'50%',bg:'#ffd166',txt:'Fair'},{w:'75%',bg:'#6c63ff',txt:'Good'},{w:'100%',bg:'#00d4aa',txt:'Strong ✓'}][score];
  fill.style.width=c.w; fill.style.background=c.bg; label.textContent=c.txt; label.style.color=score>0?c.bg:'#7b6ea8';
}

function handleSignup() {
  const first=(document.getElementById('firstName')||{}).value||''; const last=(document.getElementById('lastName')||{}).value||'';
  const email=(document.getElementById('signupEmail')||{}).value||''; const branch=(document.getElementById('branch')||{}).value||'';
  const pw=(document.getElementById('signupPassword')||{}).value||''; const cpw=(document.getElementById('confirmPassword')||{}).value||'';
  const terms=(document.getElementById('termsCheck')||{}).checked||false;
  const err=document.getElementById('signupErrorMsg');
  const showErr=msg=>{if(!err)return;err.innerHTML=`<i class="fa fa-circle-exclamation"></i> ${msg}`;err.classList.remove('show');setTimeout(()=>err.classList.add('show'),10);};
  if(!first.trim()||!last.trim()||!email.trim()||!pw) return showErr('Please fill in all required fields.');
  if(pw.length<6) return showErr('Password must be at least 6 characters.');
  if(pw!==cpw) return showErr('Passwords do not match.');
  if(!terms) return showErr('Please accept the terms to continue.');
  const users=JSON.parse(localStorage.getItem('acadmap_users')||'[]');
  if(users.find(u=>u.email===email.trim())) return showErr('An account with this email already exists.');
  const name=`${first.trim()} ${last.trim()}`;
  users.push({name,email:email.trim(),password:pw,branch}); localStorage.setItem('acadmap_users',JSON.stringify(users));
  localStorage.setItem('acadmap_session',JSON.stringify({name,email}));
  const dashUsers=JSON.parse(localStorage.getItem('users')||'[]');
  if(!dashUsers.find(u=>u.name===name)){dashUsers.unshift({name,role:'Student',id:Date.now(),color:'#6c63ff'});localStorage.setItem('users',JSON.stringify(dashUsers));}
  showPage('dashboard');
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if ((document.getElementById('page-login')||{}).classList?.contains('active'))  handleLogin();
  if ((document.getElementById('page-signup')||{}).classList?.contains('active')) handleSignup();
});

// ── BOOT ──────────────────────────────────────────────────
(function boot() {
  const session = JSON.parse(localStorage.getItem('acadmap_session')||'null');
  showPage(session ? 'dashboard' : 'landing');
  setTimeout(() => {
    document.querySelectorAll('#page-landing .reveal').forEach(el => el.classList.add('visible'));
    document.querySelectorAll('#page-landing .feat-card, #page-landing .about-card').forEach((c,i) => setTimeout(()=>c.classList.add('visible'),i*100));
  }, 200);
})();

// ══ AI ADVISOR ════════════════════════════════════════════
// Feature: AI-powered academic recommendations using Claude API

let _aiHistory = [];   // { role, content }
let _aiChatLog = [];   // { q, time } for history panel
let _aiReady = true;

const AI_SUGGESTIONS = [
  "What are my biggest academic weaknesses right now?",
  "Give me a 30-day plan to close my skill gaps",
  "Which projects should I work on this semester?",
  "How do I get better at DSA in 2 months?",
  "What certifications should I pursue for cloud?",
  "Help me balance study time across all subjects",
  "What jobs can I apply for with my current skills?",
  "Create a weekly revision schedule for exam prep",
];

function _buildAIContext() {
  const scores  = getSkillScores();
  const tasks   = store.get('tasks');
  const projects= store.get('projects');
  const events  = store.get('events');
  const ms      = store.get('milestones');
  const session = JSON.parse(localStorage.getItem('acadmap_session') || 'null');
  const gaps    = detectGaps();
  const done    = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status !== 'Completed');
  const today   = new Date(); today.setHours(0,0,0,0);
  const upcoming= events.filter(e => e.date && Math.ceil((new Date(e.date)-today)/86400000) <= 7);

  return `You are AcadMap AI Advisor — a highly intelligent, friendly academic coach embedded in the AcadMap dashboard.

STUDENT PROFILE:
- Name: ${session?.name || 'Student'}
- Tasks: ${tasks.length} total, ${done} completed (${tasks.length ? Math.round(done/tasks.length*100) : 0}% done)
- Pending tasks: ${pending.map(t => `${t.name} [${t.priority} priority, due:${t.date||'no date'}, subject:${t.subject||'general'}]`).join('; ') || 'none'}
- Projects: ${projects.length} total, ${projects.filter(p=>p.status==='Completed').length} completed, ${projects.filter(p=>p.status==='In Progress').length} in progress
- Events in next 7 days: ${upcoming.map(e => e.name + ' (' + e.date + ')').join(', ') || 'none'}
- Roadmap milestones: ${ms.length} set, ${ms.filter(m=>m.status==='Completed').length} completed

SKILL PROFICIENCY SCORES (out of 100):
${Object.entries(scores).map(([k,v]) => `- ${k}: ${v}% (target: ${SKILLS.find(s=>s.name===k)?.target||90}%) ${v < 60 ? '⚠️ GAP' : v >= 80 ? '✅ Strong' : '🔄 Improving'}`).join('\n')}

DETECTED SKILL GAPS (below 60%): ${gaps.length > 0 ? gaps.map(g => g.name).join(', ') : 'None — all skills above threshold!'}

INSTRUCTIONS:
- Give practical, specific, personalised advice based on the student's exact data above
- Use markdown formatting: **bold**, bullet points, numbered lists where helpful  
- Be encouraging but honest about gaps
- Keep responses focused and actionable (not too long)
- When suggesting resources, be specific (real websites, courses, platforms)
- If asked about tasks/projects, reference the actual ones listed above`;
}

function initAIAdvisor() {
  renderAIContext();
  renderAISuggestions();
  renderAIHistory();
}

function renderAIContext() {
  const el = document.getElementById('aiContextDisplay'); if (!el) return;
  const scores  = getSkillScores();
  const tasks   = store.get('tasks');
  const projects= store.get('projects');
  const gaps    = detectGaps();
  const done    = tasks.filter(t => t.status === 'Completed').length;
  const avgScore= Math.round(Object.values(scores).reduce((a,b)=>a+b,0) / Object.values(scores).length);

  el.innerHTML = `
    <div class="ai-context-item"><span class="ai-context-label">📌 Total Tasks</span><span class="ai-context-val">${tasks.length} (${done} done)</span></div>
    <div class="ai-context-item"><span class="ai-context-label">🔬 Projects</span><span class="ai-context-val">${projects.length}</span></div>
    <div class="ai-context-item"><span class="ai-context-label">🧠 Avg Skill Score</span><span class="ai-context-val" style="color:${avgScore<60?'#ff6b6b':avgScore>=80?'var(--accent2)':'var(--accent)'}">${avgScore}%</span></div>
    <div class="ai-context-item"><span class="ai-context-label">⚠️ Skill Gaps</span><span class="ai-context-val" style="color:${gaps.length?'#ff6b6b':'var(--accent2)'}">${gaps.length ? gaps.map(g=>g.name).join(', ') : '✅ None'}</span></div>
    <div class="ai-context-item"><span class="ai-context-label">🗺️ Milestones</span><span class="ai-context-val">${store.get('milestones').length}</span></div>
  `;
}

function renderAISuggestions() {
  const el = document.getElementById('aiSuggList'); if (!el) return;
  const shuffled = [...AI_SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
  el.innerHTML = shuffled.map(s =>
    `<div class="ai-sug-item" onclick="aiQuickPrompt('${s.replace(/'/g,"\'")}')">💬 ${s}</div>`
  ).join('');
}

function renderAIHistory() {
  const el = document.getElementById('aiHistoryList'); if (!el) return;
  if (!_aiChatLog.length) { el.innerHTML = '<p style="font-size:12px;color:var(--muted)">No history yet.</p>'; return; }
  el.innerHTML = _aiChatLog.slice(-6).reverse().map(h =>
    `<div class="ai-history-item" title="${h.q}" onclick="aiQuickPrompt('${h.q.replace(/'/g,"\'")}')">${h.q}</div>`
  ).join('');
}

function aiQuickPrompt(text) {
  const input = document.getElementById('aiInput');
  if (input) { input.value = text; input.focus(); }
  sendAIMessage();
}

function _appendMessage(role, content, avatarInitial) {
  const wrap = document.getElementById('aiMessages'); if (!wrap) return;
  const time  = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  const isBot = role === 'assistant';

  // Convert simple markdown to HTML
  let html = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<strong style="font-size:13px;display:block;margin:8px 0 4px">$1</strong>')
    .replace(/^## (.+)$/gm, '<strong style="font-size:14px;display:block;margin:10px 0 4px">$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul style="padding-left:16px;margin:6px 0">${m}</ul>`)
    .split('\n\n').map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '').join('');

  const div = document.createElement('div');
  div.className = `ai-msg ${isBot ? 'ai-msg-bot' : 'ai-msg-user'}`;
  div.innerHTML = `
    <div class="ai-msg-avatar">${isBot ? '<i class="fa fa-robot"></i>' : (avatarInitial || '<i class="fa fa-user"></i>')}</div>
    <div>
      <div class="ai-msg-bubble">${html || content}</div>
      <div class="ai-msg-time">${time}</div>
    </div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function _showThinking() {
  const wrap = document.getElementById('aiMessages'); if (!wrap) return null;
  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg-bot ai-thinking';
  div.id = 'aiThinkBubble';
  div.innerHTML = `
    <div class="ai-msg-avatar"><i class="fa fa-robot"></i></div>
    <div class="ai-msg-bubble">
      <span style="font-size:12px;color:var(--muted);margin-right:8px">Thinking</span>
      <span class="ai-thinking-dots"><span></span><span></span><span></span></span>
    </div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return div;
}

async function sendAIMessage() {
  const input = document.getElementById('aiInput'); if (!input) return;
  const text  = input.value.trim(); if (!text || !_aiReady) return;

  const session = JSON.parse(localStorage.getItem('acadmap_session') || 'null');
  const initial = session?.name?.charAt(0)?.toUpperCase() || 'U';

  _aiReady = false;
  input.value = '';
  input.style.height = 'auto';
  const sendBtn = document.getElementById('aiSendBtn');
  if (sendBtn) sendBtn.disabled = true;

  // Status
  const pill = document.getElementById('aiStatusPill');
  if (pill) pill.innerHTML = '<span class="ai-pulse-dot" style="background:#ffd166"></span> Thinking…';

  // Show user message
  _appendMessage('user', text, initial);
  _aiHistory.push({ role: 'user', content: text });
  _aiChatLog.push({ q: text, time: Date.now() });

  // Show thinking bubble
  const thinkDiv = _showThinking();

  try {
    const systemPrompt = _buildAIContext();
    const messages = _aiHistory.slice(-10); // last 10 turns for context

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();

    if (thinkDiv) thinkDiv.remove();

    if (data.content && data.content[0]) {
      const reply = data.content.map(b => b.text || '').join('');
      _aiHistory.push({ role: 'assistant', content: reply });
      _appendMessage('assistant', reply);
      addActivity('AI Advisor: ' + text.slice(0, 40) + (text.length > 40 ? '…' : ''));
    } else if (data.error) {
      _appendMessage('assistant', `⚠️ **API Error:** ${data.error.message || 'Something went wrong. Please check your API key.'}`);
    } else {
      _appendMessage('assistant', '⚠️ No response received. Please try again.');
    }
  } catch (err) {
    if (thinkDiv) thinkDiv.remove();
    _appendMessage('assistant', `⚠️ **Connection Error:** ${err.message}\n\nMake sure you are connected to the internet and the API is accessible.`);
  }

  _aiReady = true;
  if (sendBtn) sendBtn.disabled = false;
  if (pill) pill.innerHTML = '<span class="ai-pulse-dot"></span> AI Ready';
  renderAIHistory();
}

function clearAIChat() {
  _aiHistory = [];
  const wrap = document.getElementById('aiMessages'); if (!wrap) return;
  wrap.innerHTML = `<div class="ai-msg ai-msg-bot">
    <div class="ai-msg-avatar"><i class="fa fa-robot"></i></div>
    <div class="ai-msg-bubble">
      <p>Chat cleared! I'm ready for a new conversation. What would you like to explore?</p>
    </div>
  </div>`;
  renderAISuggestions();
  _toast('Chat cleared!');
}
