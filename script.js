(function () {
  'use strict';

  // ---- STATE ----
  const state = {
    theme: 'classic',
    personal: {},
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript'],
    projects: [
      { title: 'E-Commerce Platform', desc: 'Full-stack marketplace with React, Node.js, and PostgreSQL', tech: 'React, Node.js, PostgreSQL', live: '#', github: '#' },
      { title: 'Weather Dashboard', desc: 'Real-time weather visualization using OpenWeather API and D3.js', tech: 'D3.js, API, Vanilla JS', live: '#', github: '#' },
    ],
    experience: [
      { company: 'TechCorp', role: 'Senior Developer', period: '2022–Present', desc: 'Led frontend architecture for SaaS platform serving 50k+ users' },
      { company: 'StartupX', role: 'Full-Stack Developer', period: '2020–2022', desc: 'Built and shipped MVP within 3 months using React and Node.js' },
    ],
    education: [
      { institution: 'MIT', degree: 'B.S. Computer Science', period: '2016–2020' },
    ],
  };

  const $ = id => document.getElementById(id);
  const $$ = (sel, ctx) => (ctx || document).querySelectorAll(sel);

  let previewTimer = null;

  // ---- INIT ----
  function init() {
    bindTabs();
    bindThemeGrid();
    bindPersonalFields();
    bindSkills();
    bindDynamicLists();
    bindExport();
    bindReset();
    bindRefreshPreview();
    schedulePreview();
  }

  // ---- TABS ----
  function bindTabs() {
    $$('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.panel').forEach(p => p.classList.remove('active'));
        $(btn.dataset.tab + '-panel').classList.add('active');
        if (btn.dataset.tab === 'preview') updatePreview();
      });
    });
  }

  // ---- THEME ----
  function bindThemeGrid() {
    $$('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        $$('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.theme = card.dataset.theme;
        schedulePreview();
      });
    });
  }

  // ---- PERSONAL FIELDS ----
  function bindPersonalFields() {
    const ids = ['name','title','email','location','github','linkedin','photo','bio'];
    ids.forEach(id => {
      const el = $('field-' + id);
      if (!el) return;
      el.addEventListener('input', () => { state.personal[id] = el.value; schedulePreview(); });
      state.personal[id] = el.value;
    });
  }

  // ---- SKILLS ----
  function bindSkills() {
    renderSkills();
    $('addSkillBtn').addEventListener('click', addSkill);
    $('skillInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } });
  }

  function addSkill() {
    const input = $('skillInput');
    const val = input.value.trim();
    if (!val || state.skills.includes(val)) return;
    state.skills.push(val);
    renderSkills();
    input.value = '';
    schedulePreview();
  }

  function removeSkill(val) {
    state.skills = state.skills.filter(s => s !== val);
    renderSkills();
    schedulePreview();
  }

  function renderSkills() {
    const container = $('skillList');
    container.innerHTML = state.skills.map(s =>
      `<div class="tag" data-value="${s}">${s} <span class="tag-remove" data-skill="${s}">&times;</span></div>`
    ).join('');
    container.querySelectorAll('.tag-remove').forEach(el => {
      el.addEventListener('click', () => removeSkill(el.dataset.skill));
    });
  }

  // ---- DYNAMIC LISTS (projects, experience, education) ----
  function bindDynamicLists() {
    renderProjects();
    renderExperience();
    renderEducation();
    $('addProjectBtn').addEventListener('click', () => { state.projects.push({ title:'', desc:'', tech:'', live:'', github:'' }); renderProjects(); schedulePreview(); });
    $('addExperienceBtn').addEventListener('click', () => { state.experience.push({ company:'', role:'', period:'', desc:'' }); renderExperience(); schedulePreview(); });
    $('addEducationBtn').addEventListener('click', () => { state.education.push({ institution:'', degree:'', period:'' }); renderEducation(); schedulePreview(); });
  }

  function renderProjects() {
    renderList('projectsList', state.projects, renderProjectCard);
  }

  function renderExperience() {
    renderList('experienceList', state.experience, renderExpCard);
  }

  function renderEducation() {
    renderList('educationList', state.education, renderEduCard);
  }

  function renderList(containerId, arr, fn) {
    const container = $(containerId);
    container.innerHTML = arr.map((item, i) => fn(item, i, arr)).join('');
    container.querySelectorAll('.item-del').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        arr.splice(idx, 1);
        renderList(containerId, arr, fn);
        schedulePreview();
      });
    });
    container.querySelectorAll('.item-field').forEach(el => {
      el.addEventListener('input', () => {
        const idx = parseInt(el.dataset.idx);
        const key = el.dataset.key;
        arr[idx][key] = el.value;
        schedulePreview();
      });
    });
  }

  function renderProjectCard(item, i) {
    return `<div class="item-card">
      <div class="item-header"><span class="item-title">Project ${i+1}</span><div class="item-actions"><button class="item-del" data-idx="${i}">✕</button></div></div>
      <div class="item-fields">
        <div class="field"><input class="item-field" data-idx="${i}" data-key="title" value="${esc(item.title)}" placeholder="Project name"></div>
        <div class="field"><input class="item-field" data-idx="${i}" data-key="tech" value="${esc(item.tech)}" placeholder="Tech stack"></div>
        <div class="field" style="grid-column:1/-1"><input class="item-field" data-idx="${i}" data-key="desc" value="${esc(item.desc)}" placeholder="Short description"></div>
        <div class="field"><input class="item-field" data-idx="${i}" data-key="live" value="${esc(item.live)}" placeholder="Live URL"></div>
        <div class="field"><input class="item-field" data-idx="${i}" data-key="github" value="${esc(item.github)}" placeholder="GitHub URL"></div>
      </div>
    </div>`;
  }

  function renderExpCard(item, i) {
    return `<div class="item-card">
      <div class="item-header"><span class="item-title">Experience ${i+1}</span><div class="item-actions"><button class="item-del" data-idx="${i}">✕</button></div></div>
      <div class="item-fields">
        <div class="field"><input class="item-field" data-idx="${i}" data-key="company" value="${esc(item.company)}" placeholder="Company"></div>
        <div class="field"><input class="item-field" data-idx="${i}" data-key="role" value="${esc(item.role)}" placeholder="Role"></div>
        <div class="field"><input class="item-field" data-idx="${i}" data-key="period" value="${esc(item.period)}" placeholder="Period"></div>
        <div class="field" style="grid-column:1/-1"><input class="item-field" data-idx="${i}" data-key="desc" value="${esc(item.desc)}" placeholder="Description"></div>
      </div>
    </div>`;
  }

  function renderEduCard(item, i) {
    return `<div class="item-card">
      <div class="item-header"><span class="item-title">Education ${i+1}</span><div class="item-actions"><button class="item-del" data-idx="${i}">✕</button></div></div>
      <div class="item-fields">
        <div class="field"><input class="item-field" data-idx="${i}" data-key="institution" value="${esc(item.institution)}" placeholder="Institution"></div>
        <div class="field"><input class="item-field" data-idx="${i}" data-key="degree" value="${esc(item.degree)}" placeholder="Degree"></div>
        <div class="field"><input class="item-field" data-idx="${i}" data-key="period" value="${esc(item.period)}" placeholder="Period"></div>
      </div>
    </div>`;
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ---- PREVIEW ----
  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 200);
  }

  function updatePreview() {
    const frame = $('previewFrame');
    const p = state.personal;
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(generateHTML(state.theme));
    doc.close();
    updateOpenNewTab();
  }

  function generateHTML(theme) {
    const p = state.personal;
    const skills = state.skills;
    const projects = state.projects;
    const exp = state.experience;
    const edu = state.education;
    const t = theme;

    const themeStyles = getThemeStyles(t);

    const photoHTML = p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" class="profile-photo">` : `<div class="profile-avatar">${(p.name||'?')[0]}</div>`;
    const name = p.name || 'Your Name';
    const title = p.title || '';
    const bio = p.bio || '';
    const email = p.email || '';
    const location = p.location || '';
    const github = p.github || '';
    const linkedin = p.linkedin || '';

    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(name)} — Portfolio</title>
<style>${themeStyles}</style>
</head><body>
<div class="container">
  <header class="hero">
    ${photoHTML}
    <h1>${esc(name)}</h1>
    ${title ? `<p class="title">${esc(title)}</p>` : ''}
    <div class="contact-row">
      ${email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : ''}
      ${location ? `<span>${esc(location)}</span>` : ''}
      ${github ? `<a href="${esc(github)}" target="_blank">GitHub</a>` : ''}
      ${linkedin ? `<a href="${esc(linkedin)}" target="_blank">LinkedIn</a>` : ''}
    </div>
  </header>

  ${bio ? `<section><h2>About</h2><p class="bio-text">${esc(bio)}</p></section>` : ''}

  ${skills.length ? `<section><h2>Skills</h2><div class="skill-list">${skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}</div></section>` : ''}

  ${projects.length ? `<section><h2>Projects</h2>${projects.filter(pj => pj.title).map(pj => `
    <div class="project-card">
      <h3>${esc(pj.title)}</h3>
      ${pj.tech ? `<div class="project-tech">${esc(pj.tech)}</div>` : ''}
      ${pj.desc ? `<p>${esc(pj.desc)}</p>` : ''}
      <div class="project-links">
        ${pj.live ? `<a href="${esc(pj.live)}" target="_blank">Live</a>` : ''}
        ${pj.github ? `<a href="${esc(pj.github)}" target="_blank">GitHub</a>` : ''}
      </div>
    </div>
  `).join('')}</section>` : ''}

  ${exp.length ? `<section><h2>Experience</h2>${exp.filter(e => e.company).map(e => `
    <div class="exp-item">
      <div class="exp-header"><strong>${esc(e.company)}</strong> ${e.role ? `— ${esc(e.role)}` : ''}</div>
      ${e.period ? `<div class="exp-period">${esc(e.period)}</div>` : ''}
      ${e.desc ? `<p class="exp-desc">${esc(e.desc)}</p>` : ''}
    </div>
  `).join('')}</section>` : ''}

  ${edu.length ? `<section><h2>Education</h2>${edu.filter(e => e.institution).map(e => `
    <div class="exp-item">
      <div class="exp-header"><strong>${esc(e.institution)}</strong> ${e.degree ? `— ${esc(e.degree)}` : ''}</div>
      ${e.period ? `<div class="exp-period">${esc(e.period)}</div>` : ''}
    </div>
  `).join('')}</section>` : ''}

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${esc(name)}. Built with Portfolio Builder.</p>
  </footer>
</div>
</body></html>`;
  }

  function getThemeStyles(theme) {
    const base = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3{line-height:1.3}
a{text-decoration:none}
img{max-width:100%;display:block}
.container{max-width:800px;margin:0 auto;padding:40px 24px}
section{margin-bottom:36px}
section h2{font-size:20px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid;display:inline-block}
.hero{text-align:center;margin-bottom:48px;padding-bottom:40px}
.profile-photo{width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 20px}
.profile-avatar{width:100px;height:100px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;margin:0 auto 20px}
.hero h1{font-size:34px;margin-bottom:6px}
.hero .title{font-size:17px;margin-bottom:14px}
.contact-row{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;font-size:14px}
.contact-row a,.contact-row span{padding:2px 0}
.bio-text{font-size:15px;max-width:640px;margin:0 auto;text-align:center;line-height:1.7}
.skill-list{display:flex;flex-wrap:wrap;gap:8px}
.skill-tag{padding:5px 14px;border-radius:20px;font-size:13px;font-weight:500}
.project-card{padding:18px;margin-bottom:14px;border-radius:8px}
.project-card h3{font-size:17px;margin-bottom:4px}
.project-tech{font-size:13px;margin-bottom:6px;opacity:.7}
.project-card p{font-size:14px;margin-bottom:8px}
.project-links{display:flex;gap:12px}
.project-links a{font-size:13px;font-weight:600}
.exp-item{margin-bottom:14px;padding-bottom:14px}
.exp-item:last-child{padding-bottom:0}
.exp-header{font-size:15px}
.exp-period{font-size:13px;margin:2px 0 4px;opacity:.7}
.exp-desc{font-size:14px}
footer{text-align:center;font-size:13px;opacity:.6;padding-top:20px;margin-top:40px}
`;
    switch (theme) {
      case 'dark':
        return base + `
body{background:#0f0f23;color:#e2e8f0}
section h2{border-color:#3b82f6;color:#60a5fa}
.hero{border-bottom:1px solid #1e293b}
.profile-avatar{background:#3b82f6;color:#fff}
.contact-row a{color:#60a5fa}
.contact-row a:hover{text-decoration:underline}
.bio-text{color:#94a3b8}
.skill-tag{background:#1e293b;color:#60a5fa}
.project-card{background:#1a1a3e;border:1px solid #2d2d5e}
.project-card h3{color:#e2e8f0}
.project-links a{color:#60a5fa}
.exp-item{border-bottom:1px solid #1e293b}
footer{border-top:1px solid #1e293b}
`;
      case 'gradient':
        return base + `
body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;min-height:100vh}
.container{background:rgba(255,255,255,.1);backdrop-filter:blur(20px);border-radius:24px;margin-top:24px;margin-bottom:24px;padding:40px 32px}
section h2{border-color:rgba(255,255,255,.4);color:#fff}
.hero{border-bottom:1px solid rgba(255,255,255,.15)}
.profile-avatar{background:rgba(255,255,255,.2);color:#fff;backdrop-filter:blur(10px)}
.contact-row a{color:#fff;border-bottom:1px solid rgba(255,255,255,.3)}
.contact-row a:hover{border-color:#fff}
.bio-text{color:rgba(255,255,255,.85)}
.skill-tag{background:rgba(255,255,255,.15);color:#fff;backdrop-filter:blur(10px)}
.project-card{background:rgba(255,255,255,.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.15)}
.project-card h3{color:#fff}
.project-links a{color:#fff;border-bottom:1px solid rgba(255,255,255,.3)}
.exp-item{border-bottom:1px solid rgba(255,255,255,.1)}
footer{border-top:1px solid rgba(255,255,255,.1)}
`;
      case 'minimal':
        return base + `
body{background:#fff;color:#333}
section h2{border-color:#ddd;color:#111;font-weight:400;letter-spacing:1px;text-transform:uppercase;font-size:13px}
.hero{text-align:left;border-bottom:1px solid #eee;padding-bottom:32px}
.hero h1{font-size:28px;font-weight:400}
.contact-row{justify-content:flex-start;gap:16px;font-size:13px;color:#888}
.contact-row a{color:#333;border-bottom:1px solid #ddd}
.contact-row a:hover{border-color:#333}
.profile-avatar{background:#f5f5f5;color:#333;width:80px;height:80px;font-size:28px;margin:0 0 16px}
.bio-text{text-align:left;max-width:100%;font-size:14px;color:#666}
.skill-tag{background:#f5f5f5;color:#333;border:1px solid #eee;border-radius:2px;padding:3px 12px;font-size:12px}
.project-card{padding:16px 0;border-bottom:1px solid #eee;border-radius:0;margin-bottom:0}
.project-card h3{font-size:16px;font-weight:500}
.project-links a{color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px}
.exp-item{border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:12px}
.exp-header strong{font-weight:500}
.exp-period{color:#999;font-size:12px}
.exp-desc{color:#666;font-size:13px}
footer{border-top:1px solid #eee;color:#aaa}
`;
      default: // classic
        return base + `
body{background:#f8f7f4;color:#1a1a2e}
section h2{border-color:#6366f1;color:#1a1a2e}
.hero{border-bottom:1px solid #e2e0dc}
.profile-avatar{background:#6366f1;color:#fff}
.contact-row a{color:#6366f1}
.contact-row a:hover{text-decoration:underline}
.bio-text{color:#6b6b80}
.skill-tag{background:#eef2ff;color:#4f46e5}
.project-card{background:#fff;border:1px solid #e2e0dc;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.project-card h3{color:#1a1a2e}
.project-links a{color:#6366f1}
.exp-item{border-bottom:1px solid #e2e0dc}
footer{border-top:1px solid #e2e0dc}
`;
    }
  }

  // ---- EXPORT ----
  function bindExport() {
    $('exportBtn').addEventListener('click', exportCode);
  }

  function exportCode() {
    const html = generateHTML(state.theme);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = (state.personal.name || 'portfolio').replace(/\s+/g, '_').toLowerCase();
    a.download = `${name}_portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Portfolio exported!');
  }

  // ---- RESET ----
  function bindReset() {
    $('resetBtn').addEventListener('click', () => {
      if (!confirm('Reset all data?')) return;
      state.skills = ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript'];
      state.projects = [];
      state.experience = [];
      state.education = [];
      state.personal = {};
      $$('#editor-panel input, #editor-panel textarea').forEach(el => {
        if (el.type === 'url' || el.type === 'email' || el.type === 'text' || el.tagName === 'TEXTAREA') {
          if (!el.closest('.item-card')) el.value = '';
        }
      });
      $('field-name').value = '';
      $('field-title').value = '';
      $('field-bio').value = '';
      renderSkills();
      renderProjects();
      renderExperience();
      renderEducation();
      schedulePreview();
      showToast('Reset complete');
    });
  }

  // ---- REFRESH / NEW TAB ----
  function bindRefreshPreview() {
    $('refreshPreviewBtn').addEventListener('click', updatePreview);
  }

  function updateOpenNewTab() {
    const html = generateHTML(state.theme);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    $('openNewTab').href = url;
  }

  // ---- TOAST ----
  function showToast(msg) {
    const t = document.getElementById('toast');
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.textContent = msg;
    t.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 2000);
  }

  // ---- START ----
  document.addEventListener('DOMContentLoaded', init);
})();
