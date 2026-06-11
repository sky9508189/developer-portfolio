(function () {
  'use strict';

  const state = {
    theme: 'developer',
    personal: {},
    skills: ['JavaScript','React','Node.js','Python','TypeScript'],
    projects: [
      { title:'E-Commerce Platform', desc:'Full-stack marketplace with React, Node.js, PostgreSQL', tech:'React, Node.js, PostgreSQL', live:'#', github:'#' },
      { title:'Weather Dashboard', desc:'Real-time weather viz using OpenWeather API and D3.js', tech:'D3.js, API, Vanilla JS', live:'#', github:'#' },
    ],
    experience: [
      { company:'TechCorp', role:'Senior Developer', period:'2022–Present', desc:'Led frontend architecture for SaaS platform serving 50k+ users' },
      { company:'StartupX', role:'Full-Stack Developer', period:'2020–2022', desc:'Built and shipped MVP within 3 months using React and Node.js' },
    ],
    education: [
      { institution:'MIT', degree:'B.S. Computer Science', period:'2016–2020' },
    ],
  };

  const $ = id => document.getElementById(id);
  const $$ = (sel, ctx) => (ctx || document).querySelectorAll(sel);

  let previewTimer = null;

  function init() {
    bindNav();
    bindTheme();
    bindFields();
    bindSkills();
    bindLists();
    bindExport();
    bindReset();
    bindRefresh();
    bindCursor();
    bindPreview3D();
    schedulePreview();
  }

  // ---- NAV ----
  function bindNav() {
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        $$('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        $$('.section').forEach(s => s.classList.remove('active'));
        $(item.dataset.section + '-section').classList.add('active');
        if (item.dataset.section === 'preview') updatePreview();
      });
    });
  }

  // ---- THEME ----
  function bindTheme() {
    $$('.theme-opt').forEach(el => {
      el.addEventListener('click', () => {
        $$('.theme-opt').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        state.theme = el.dataset.theme;
        schedulePreview();
      });
    });
  }

  // ---- FIELDS ----
  function bindFields() {
    const map = ['name','title','email','location','github','linkedin','photo','bio'];
    map.forEach(k => {
      const el = $('f-' + k);
      if (!el) return;
      el.addEventListener('input', () => { state.personal[k] = el.value; schedulePreview(); });
      state.personal[k] = el.value;
    });
  }

  // ---- SKILLS ----
  function bindSkills() {
    renderSkills();
    $('addSkillBtn').addEventListener('click', addSkill);
    $('skillInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } });
  }

  function addSkill() {
    const v = $('skillInput').value.trim();
    if (!v || state.skills.includes(v)) return;
    state.skills.push(v);
    renderSkills(); $('skillInput').value = ''; schedulePreview();
  }

  function removeSkill(v) {
    state.skills = state.skills.filter(s => s !== v);
    renderSkills(); schedulePreview();
  }

  function renderSkills() {
    $('skillList').innerHTML = state.skills.map(s =>
      `<span class="tag">${esc(s)} <span class="tag-rm" data-s="${s}">✕</span></span>`
    ).join('');
    $$('.tag-rm').forEach(el => el.addEventListener('click', () => removeSkill(el.dataset.s)));
  }

  // ---- LISTS ----
  function bindLists() {
    renderProjects(); renderExperience(); renderEducation();
    $('addProjectBtn').addEventListener('click', () => { state.projects.push({}); renderProjects(); schedulePreview(); });
    $('addExperienceBtn').addEventListener('click', () => { state.experience.push({}); renderExperience(); schedulePreview(); });
    $('addEducationBtn').addEventListener('click', () => { state.education.push({}); renderEducation(); schedulePreview(); });
  }

  function renderProjects() { renderList('projectsList', state.projects, fieldsProj); }
  function renderExperience() { renderList('experienceList', state.experience, fieldsExp); }
  function renderEducation() { renderList('educationList', state.education, fieldsEdu); }

  function renderList(cid, arr, fn) {
    const c = $(cid);
    c.innerHTML = arr.map((it, i) => fn(it, i, arr)).join('');
    c.querySelectorAll('.d-del').forEach(el => {
      el.addEventListener('click', () => { arr.splice(+el.dataset.i, 1); renderList(cid, arr, fn); schedulePreview(); });
    });
    c.querySelectorAll('.d-f').forEach(el => {
      el.addEventListener('input', () => { arr[+el.dataset.i][el.dataset.k] = el.value; schedulePreview(); });
    });
  }

  function fieldsProj(it, i) { return dc(i, [
    {k:'title',p:'Project name',v:it.title},
    {k:'tech',p:'Tech stack',v:it.tech},
    {k:'desc',p:'Description',v:it.desc,sp:true},
    {k:'live',p:'Live URL',v:it.live},
    {k:'github',p:'GitHub URL',v:it.github},
  ]); }
  function fieldsExp(it, i) { return dc(i, [
    {k:'company',p:'Company',v:it.company},
    {k:'role',p:'Role',v:it.role},
    {k:'period',p:'Period',v:it.period},
    {k:'desc',p:'Description',v:it.desc,sp:true},
  ]); }
  function fieldsEdu(it, i) { return dc(i, [
    {k:'institution',p:'Institution',v:it.institution},
    {k:'degree',p:'Degree',v:it.degree},
    {k:'period',p:'Period',v:it.period},
  ]); }

  function dc(i, flds) {
    const label = flds[0] ? (flds[0].v || flds[0].p) : 'Item';
    const rows = flds.map(f =>
      `<div class="field"${f.sp?' style="grid-column:1/-1"':''}>
        <input class="d-f inp" data-i="${i}" data-k="${f.k}" value="${esc(f.v||'')}" placeholder="${f.p}">
      </div>`
    ).join('');
    return `<div class="d-card">
      <div class="d-head">
        <span class="d-title">${esc(label)}</span>
        <button class="d-del" data-i="${i}">✕</button>
      </div>
      <div class="d-fields">${rows}</div>
    </div>`;
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ---- PREVIEW ----
  function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(updatePreview, 150); }

  function updatePreview() {
    const frame = $('previewFrame');
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(generateHTML(state.theme));
    doc.close();
  }

  function generateHTML(theme) {
    const p = state.personal;
    const skills = state.skills;
    const projects = state.projects;
    const exp = state.experience;
    const edu = state.education;
    const n = p.name || 'Your Name';
    const t = p.title || '';
    const b = p.bio || '';
    const e = p.email || '';
    const l = p.location || '';
    const g = p.github || '';
    const li = p.linkedin || '';
    const ph = p.photo || '';
    const yr = new Date().getFullYear();
    const photoHTML = ph ? `<img src="${esc(ph)}" alt="${esc(n)}" class="pp">` : `<div class="pa">${n[0]||'?'}</div>`;
    const s = getThemeStyles(theme);
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(n)} — dev</title>
<style>${s}
</style></head><body>
<div class="wrap">
  <header class="hero">
    ${photoHTML}
    <h1 class="rv">${esc(n)}</h1>
    ${t ? `<p class="tl rv">${esc(t)}</p>` : ''}
    <div class="cr rv">
      ${e ? `<a href="mailto:${esc(e)}">${esc(e)}</a>` : ''}
      ${l ? `<span>${esc(l)}</span>` : ''}
      ${g ? `<a href="${esc(g)}" target="_blank">github</a>` : ''}
      ${li ? `<a href="${esc(li)}" target="_blank">linkedin</a>` : ''}
    </div>
  </header>
  ${b ? `<section><h2 class="rv">// about</h2><p class="rv bio">${esc(b)}</p></section>` : ''}
  ${skills.length ? `<section><h2 class="rv">// skills</h2><div class="sk rv">${skills.map(s => `<span class="st">${esc(s)}</span>`).join('')}</div></section>` : ''}
  ${projects.filter(x=>x.title).length ? `<section><h2 class="rv">// projects</h2>${projects.filter(x=>x.title).map((pj,i) => `
    <div class="pc rv" style="--i:${i}">
      <h3>> ${esc(pj.title)}</h3>
      ${pj.tech ? `<div class="pt">// ${esc(pj.tech)}</div>` : ''}
      ${pj.desc ? `<p>${esc(pj.desc)}</p>` : ''}
      <div class="pl">
        ${pj.live ? `<a href="${esc(pj.live)}" target="_blank">[ live ]</a>` : ''}
        ${pj.github ? `<a href="${esc(pj.github)}" target="_blank">[ github ]</a>` : ''}
      </div>
    </div>
  `).join('')}</section>` : ''}
  ${exp.filter(x=>x.company).length ? `<section><h2 class="rv">// experience</h2>${exp.filter(x=>x.company).map((ex,i) => `
    <div class="ec rv" style="--i:${i}">
      <div class="eh"><span class="ed">></span> <strong>${esc(ex.company)}</strong> ${ex.role ? `— ${esc(ex.role)}` : ''}</div>
      ${ex.period ? `<div class="ep">// ${esc(ex.period)}</div>` : ''}
      ${ex.desc ? `<p class="exd">${esc(ex.desc)}</p>` : ''}
    </div>
  `).join('')}</section>` : ''}
  ${edu.filter(x=>x.institution).length ? `<section><h2 class="rv">// education</h2>${edu.filter(x=>x.institution).map((ex,i) => `
    <div class="ec rv" style="--i:${i}">
      <div class="eh"><span class="ed">></span> <strong>${esc(ex.institution)}</strong> ${ex.degree ? `— ${esc(ex.degree)}` : ''}</div>
      ${ex.period ? `<div class="ep">// ${esc(ex.period)}</div>` : ''}
    </div>
  `).join('')}</section>` : ''}
  <footer><p>© ${yr} ${esc(n)} &lt;/&gt; built with portfolio.build</p></footer>
</div>
<script>
// scroll reveal
const ro = new IntersectionObserver(e=>e.forEach(en=>{if(en.isIntersecting){en.target.classList.add('vs');ro.unobserve(en.target)}}),{threshold:.08});
document.querySelectorAll('.rv').forEach(el=>ro.observe(el));
// 3d tilt on project cards
document.querySelectorAll('.pc').forEach(c=>{c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(600px) rotateY('+(x*6)+'deg) rotateX('+(-y*6)+'deg) translateZ(10px)'});c.addEventListener('mouseleave',()=>{c.style.transform='perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0)'})});
</script></body></html>`;
  }

  function getThemeStyles(theme) {
    const base = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'JetBrains Mono','Fira Code','Consolas',monospace;line-height:1.7;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3{line-height:1.3;font-weight:500}
a{text-decoration:none;transition:color .2s}
.wrap{max-width:720px;margin:0 auto;padding:48px 24px 24px}
section{margin-bottom:48px}
section h2{font-size:13px;margin-bottom:20px;text-transform:uppercase;letter-spacing:1.5px;opacity:.5;font-weight:400}
.hero{text-align:center;margin-bottom:56px;padding-bottom:40px}
.pp{width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 16px}
.pa{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;margin:0 auto 16px}
.hero h1{font-size:28px;margin-bottom:4px;font-weight:600}
.tl{font-size:14px;margin-bottom:12px;opacity:.7}
.cr{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 16px;font-size:12px}
.cr a{border-bottom:1px solid}
.cr a:hover{opacity:.7}
.bio{font-size:13px;max-width:540px;margin:0 auto;text-align:center;line-height:1.8;opacity:.75}
.sk{display:flex;flex-wrap:wrap;gap:6px}
.st{padding:3px 10px;border:1px solid;border-radius:3px;font-size:11px}
.pc{padding:16px;margin-bottom:12px;border-radius:6px;transition:transform .3s cubic-bezier(.23,1,.32,1),box-shadow .3s;will-change:transform}
.pc h3{font-size:14px;margin-bottom:4px}
.pt{font-size:11px;margin-bottom:6px;opacity:.6}
.pc p{font-size:13px;margin-bottom:8px;opacity:.8;line-height:1.6}
.pl{display:flex;gap:12px}
.pl a{font-size:11px}
.ec{margin-bottom:14px;padding-bottom:14px}
.ec:last-child{padding-bottom:0}
.eh{font-size:13px}
.ed{opacity:.4;margin-right:4px}
.ep{font-size:11px;margin:2px 0 4px;opacity:.5}
.exd{font-size:12px;opacity:.7;line-height:1.6}
footer{text-align:center;font-size:11px;opacity:.35;padding-top:20px;margin-top:48px;border-top:1px solid;border-color:inherit}
/* scroll reveal */
.rv{opacity:0;transform:translateY(20px);transition:opacity .7s cubic-bezier(.23,1,.32,1),transform .8s cubic-bezier(.23,1,.32,1)}
.rv.vs{opacity:1;transform:translateY(0)}
.pc.rv{transition-delay:calc(var(--i,0)*.08s)}
.ec.rv{transition-delay:calc(var(--i,0)*.06s)}
`;

    const dev = base + `
body{background:#0a0a0f;color:#c8c8d4}
h2{color:#00e676}
a{color:#00bcd4}
.cr a{border-color:rgba(0,188,212,.3)}
.pa{background:rgba(0,230,118,.12);color:#00e676;border:1px solid rgba(0,230,118,.2)}
.st{border-color:rgba(0,230,118,.2);color:#00e676;background:rgba(0,230,118,.06)}
.pc{background:#12121a;border:1px solid #1e1e30}
.pc:hover{border-color:rgba(0,230,118,.2);box-shadow:0 4px 30px rgba(0,0,0,.4)}
.pl a{color:#ffab00}
.pl a:hover{color:#ffc107}
.ec{border-bottom:1px solid #1e1e30}
.ed{color:#00e676}
footer{border-color:#1e1e30}
`;

    const dark = base + `
body{background:#0f0f23;color:#e2e8f0}
h2{color:#60a5fa}
a{color:#60a5fa}
.cr a{border-color:rgba(96,165,250,.3)}
.pa{background:#3b82f6;color:#fff}
.st{border-color:#1e293b;color:#60a5fa;background:#1e293b}
.pc{background:#1a1a3e;border:1px solid #2d2d5e}
.pc:hover{border-color:#3b82f6;box-shadow:0 4px 30px rgba(0,0,0,.4)}
.pl a{color:#60a5fa}
.ec{border-bottom:1px solid #1e293b}
footer{border-color:#1e293b}
`;

    const gradient = base + `
body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;min-height:100vh}
.wrap{background:rgba(255,255,255,.08);backdrop-filter:blur(24px);border-radius:20px;padding:48px 32px 24px;margin-top:20px;margin-bottom:20px;border:1px solid rgba(255,255,255,.1)}
h2{color:#fff;opacity:.7}
a{color:#fff}
.cr a{border-color:rgba(255,255,255,.3)}
.pa{background:rgba(255,255,255,.15);color:#fff;backdrop-filter:blur(8px)}
.st{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.15)}
.pc{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(8px)}
.pc:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2)}
.pl a{color:#fff;border-bottom:1px solid rgba(255,255,255,.3)}
.ec{border-bottom:1px solid rgba(255,255,255,.1)}
footer{border-color:rgba(255,255,255,.1)}
`;

    const minimal = base + `
body{background:#fafafa;color:#333}
h2{color:#111;font-weight:400}
a{color:#333}
.cr a{border-color:#ddd}
.pa{background:#f0f0f0;color:#333}
.st{border-color:#eee;color:#555;background:#f5f5f5}
.pc{background:#fff;border:1px solid #eee;border-radius:2px}
.pc:hover{border-color:#ccc;box-shadow:0 2px 12px rgba(0,0,0,.04)}
.pl a{color:#555}
.ec{border-bottom:1px solid #eee}
footer{border-color:#eee;color:#aaa}
`;

    const classic = base + `
body{background:#f8f7f4;color:#1a1a2e}
h2{color:#6366f1}
a{color:#6366f1}
.cr a{border-color:rgba(99,102,241,.3)}
.pa{background:#6366f1;color:#fff}
.st{border-color:#e2e0dc;color:#4f46e5;background:#eef2ff}
.pc{background:#fff;border:1px solid #e2e0dc;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.pc:hover{border-color:#6366f1;box-shadow:0 4px 20px rgba(99,102,241,.08)}
.pl a{color:#6366f1}
.ec{border-bottom:1px solid #e2e0dc}
footer{border-color:#e2e0dc}
`;

    return { developer: dev, dark, gradient, minimal, classic }[theme] || dev;
  }

  // ---- EXPORT ----
  function bindExport() {
    $('exportBtn').addEventListener('click', () => {
      const html = generateHTML(state.theme);
      const blob = new Blob([html], { type:'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ((state.personal.name||'portfolio').replace(/\s+/g,'_').toLowerCase()) + '_portfolio.html';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Exported ✓');
    });
  }

  // ---- RESET ----
  function bindReset() {
    $('resetBtn').addEventListener('click', () => {
      if (!confirm('reset all?')) return;
      state.skills = ['JavaScript','React','Node.js','Python','TypeScript'];
      state.projects = []; state.experience = []; state.education = [];
      state.personal = {};
      $$('#editor-section input,#editor-section textarea').forEach(el => {
        if (['input','textarea'].includes(el.tagName.toLowerCase())) {
          if (!el.closest('.d-card')) el.value = '';
        }
      });
      $('f-name').value = ''; $('f-title').value = ''; $('f-bio').value = '';
      renderSkills(); renderProjects(); renderExperience(); renderEducation();
      schedulePreview();
      toast('Reset ✓');
    });
  }

  // ---- REFRESH ----
  function bindRefresh() {
    $('refreshPreviewBtn').addEventListener('click', updatePreview);
  }

  // ---- 3D PREVIEW TILT ----
  function bindPreview3D() {
    const wrap = document.querySelector('.preview-frame-wrap');
    if (!wrap) return;
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      wrap.style.transform = `perspective(1000px) rotateY(${x * -2}deg) rotateX(${y * 2}deg)`;
    });
    wrap.addEventListener('mouseleave', () => {
      wrap.style.transform = 'perspective(1000px) rotateY(-1deg) rotateX(.5deg)';
    });
  }

  // ---- CURSOR GLOW ----
  function bindCursor() {
    const g = $('cursorGlow');
    if (!g) return;
    document.addEventListener('mousemove', e => {
      g.style.left = e.clientX + 'px';
      g.style.top = e.clientY + 'px';
    });
    document.addEventListener('mouseenter', () => g.style.opacity = '1');
    document.addEventListener('mouseleave', () => g.style.opacity = '0');
  }

  // ---- TOAST ----
  function toast(msg) {
    const t = $('toast');
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.textContent = msg;
    t.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 1800);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
