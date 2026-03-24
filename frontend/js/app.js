/* ============================================
   app.js — Frontend Application Logic
   PathFinder Career Guidance Platform
   ============================================ */

// ── State ──────────────────────────────────
let selectedBoard     = '';
let selectedWorkStyle = '';
let currentStep       = 1;

// ── Page Navigation ────────────────────────
function showApp() {
  document.getElementById('landingPage').classList.remove('active');
  document.getElementById('appPage').classList.add('active');
  window.scrollTo(0, 0);
}

function showLanding() {
  document.getElementById('appPage').classList.remove('active');
  document.getElementById('landingPage').classList.add('active');
  window.scrollTo(0, 0);
}

function smoothScroll(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── Step Navigation ─────────────────────────
function goStep(n) {
  document.getElementById('step' + currentStep).classList.remove('active');
  currentStep = n;
  document.getElementById('step' + n).classList.add('active');
  updateStepper();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepper() {
  for (let i = 1; i <= 4; i++) {
    const bubble = document.getElementById('sb' + i);
    if (i < currentStep) {
      bubble.className = 'step-bubble done';
      bubble.textContent = '✓';
    } else if (i === currentStep) {
      bubble.className = 'step-bubble active';
      bubble.textContent = i;
    } else {
      bubble.className = 'step-bubble';
      bubble.textContent = i;
    }
    if (i < 4) {
      const line = document.getElementById('sl' + i);
      line.className = i < currentStep ? 'step-line done' : 'step-line';
    }
  }
}

// ── Form Selections ─────────────────────────
function selectBoard(el, val) {
  document.querySelectorAll('#step1 .choice-grid .choice-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedBoard = val;
}

function selectWorkStyle(el, val) {
  document.querySelectorAll('#step4 .choice-grid .choice-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedWorkStyle = val;
}

function toggleTag(el) {
  el.classList.toggle('selected');
}

function toggleChoice(el) {
  el.classList.toggle('selected');
}

// ── Data Collection ─────────────────────────
function gatherFormData() {
  return {
    name:      document.getElementById('s1Name').value.trim()  || 'Student',
    grade:     document.getElementById('s1Class').value,
    stream:    document.getElementById('s1Stream').value,
    city:      document.getElementById('s1City').value.trim(),
    board:     selectedBoard,
    dream:     document.getElementById('s3Dream').value.trim(),
    perf:      document.getElementById('s3Grade').value,
    extra:     document.getElementById('s3Extra').value.trim(),
    workStyle: selectedWorkStyle,
    subjects:  [...document.querySelectorAll('#subjectGrid .selected')].map(e => e.textContent.trim()),
    hobbies:   [...document.querySelectorAll('#hobbyGrid .selected')].map(e => e.textContent.trim()),
    strengths: [...document.querySelectorAll('#step3 .choice-grid .choice-card.selected')].map(e => e.querySelector('.choice-label').textContent.trim()),
    values:    [...document.querySelectorAll('#valuesGrid .selected')].map(e => e.textContent.trim()),
  };
}

// ── Generate Report ─────────────────────────
async function generateReport() {
  const data = gatherFormData();

  // Switch to loading UI
  for (let i = 1; i <= 4; i++) document.getElementById('step' + i).classList.remove('active');
  document.getElementById('stepper').style.display = 'none';

  const loading = document.getElementById('appLoading');
  loading.classList.add('visible');

  // Animate loader steps
  const steps = [
    'Reading your profile...',
    'Matching career clusters...',
    'Analyzing strengths & interests...',
    'Building your roadmap...',
    'Generating final report...'
  ];

  const stepsEl = document.getElementById('loaderSteps');
  stepsEl.innerHTML = '';

  steps.forEach((text, i) => {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'loader-step active';
      el.innerHTML = `<span>⟳</span> ${text}`;
      stepsEl.appendChild(el);
      setTimeout(() => {
        el.classList.remove('active');
        el.classList.add('done');
        el.querySelector('span').textContent = '✓';
      }, 900);
    }, i * 600);
  });

  try {
    // Call backend API
    const report = await ApiService.analyzeCareer(data);

    loading.classList.remove('visible');
    renderResults(data.name, report);

  } catch (err) {
    loading.classList.remove('visible');
    document.getElementById('stepper').style.display = 'flex';
    document.getElementById('step4').classList.add('active');
    currentStep = 4;

    alert('⚠ Something went wrong:\n' + err.message + '\n\nMake sure your backend server is running.');
  }
}

// ── Render Results ──────────────────────────
function renderResults(name, r) {
  // Set header
  document.getElementById('resultName').textContent = `${name}'s Career Guidance Report`;
  document.getElementById('resultTagline').textContent =
    `Personalized for ${name} · Powered by Cloud AI · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const grid = document.getElementById('resultGrid');

  const summaryHtml = `
    <div class="result-card full">
      <div class="rc-header"><div class="rc-icon fi-orange">✨</div><div class="rc-title">Your Profile Summary</div></div>
      <div class="rc-content" style="font-size:0.92rem;color:var(--text);">${r.summary}</div>
      <div style="margin-top:16px;padding:14px 18px;background:var(--accent-light);border-radius:12px;font-size:0.82rem;color:var(--accent);font-weight:500;font-style:italic;">"${r.motivationalNote}"</div>
    </div>`;

  const careersHtml = `
    <div class="result-card full">
      <div class="rc-header"><div class="rc-icon fi-blue">🎯</div><div class="rc-title">Top 3 Recommended Career Paths</div></div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${r.topCareers.map((c, i) => `
          <div style="background:var(--bg);border-radius:14px;padding:16px 20px;border:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <span style="font-size:1.4rem;">${c.emoji}</span>
              <div>
                <div style="font-family:'Fraunces',serif;font-weight:700;font-size:0.95rem;color:var(--text);">${c.title}</div>
                <div style="font-size:0.72rem;color:var(--muted2);">Option #${i + 1}</div>
              </div>
              <div style="margin-left:auto;background:${i === 0 ? 'var(--accent-light)' : 'var(--bg2)'};color:${i === 0 ? 'var(--accent)' : 'var(--muted)'};font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:20px;">${i === 0 ? '⭐ Top Pick' : 'Recommended'}</div>
            </div>
            <div style="font-size:0.82rem;color:var(--muted);line-height:1.6;margin-bottom:8px;">${c.why}</div>
            <div style="font-size:0.78rem;color:var(--accent3);font-weight:600;">📈 ${c.outlook}</div>
          </div>`).join('')}
      </div>
    </div>`;

  const roadmapHtml = `
    <div class="result-card">
      <div class="rc-header"><div class="rc-icon fi-green">🗺️</div><div class="rc-title">Your Roadmap</div></div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${r.roadmap.map((step, i) => `
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="width:24px;height:24px;border-radius:50%;background:${['var(--accent-light)', 'var(--accent2-light)', 'var(--accent3-light)', 'var(--accent4-light)'][i]};color:${['var(--accent)', 'var(--accent2)', 'var(--accent3)', 'var(--accent4)'][i]};font-size:0.7rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
            <div style="font-size:0.83rem;color:var(--muted);line-height:1.6;">${step}</div>
          </div>`).join('')}
      </div>
    </div>`;

  const examsHtml = `
    <div class="result-card">
      <div class="rc-header"><div class="rc-icon fi-yellow">📝</div><div class="rc-title">Relevant Exams</div></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${r.exams.map(e => `
          <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 14px;background:var(--bg);border-radius:10px;">
            <div style="font-weight:700;font-size:0.82rem;color:var(--text);min-width:80px;">${e.name}</div>
            <div style="font-size:0.8rem;color:var(--muted);">— ${e.relevance}</div>
          </div>`).join('')}
      </div>
    </div>`;

  const streamHtml = `
    <div class="result-card">
      <div class="rc-header"><div class="rc-icon fi-purple">📚</div><div class="rc-title">Stream & Subject Advice</div></div>
      <div class="rc-content">${r.streamAdvice}</div>
    </div>`;

  const skillsHtml = `
    <div class="result-card">
      <div class="rc-header"><div class="rc-icon fi-pink">⚡</div><div class="rc-title">Skills to Build Now</div></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${r.skillsToBuild.map(s => `
          <div style="display:flex;gap:8px;align-items:flex-start;font-size:0.83rem;color:var(--muted);line-height:1.55;">
            <span style="color:var(--accent3);font-weight:700;flex-shrink:0;">→</span> ${s}
          </div>`).join('')}
      </div>
    </div>`;

  const resourcesHtml = `
    <div class="result-card">
      <div class="rc-header"><div class="rc-icon" style="background:#e0f7fa;">📖</div><div class="rc-title">Recommended Resources</div></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${r.resources.map(res => `<span style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:0.78rem;font-weight:500;color:var(--muted);">📌 ${res}</span>`).join('')}
      </div>
    </div>`;

  grid.innerHTML = summaryHtml + careersHtml + roadmapHtml + examsHtml + streamHtml + skillsHtml + resourcesHtml;

  document.getElementById('appResults').classList.add('visible');
  document.getElementById('appResults').scrollIntoView({ behavior: 'smooth' });
}

// ── Reset App ───────────────────────────────
function resetApp() {
  document.getElementById('appResults').classList.remove('visible');
  document.getElementById('resultGrid').innerHTML = '';
  document.getElementById('stepper').style.display = 'flex';

  document.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.interest-tag').forEach(t => t.classList.remove('selected'));

  selectedBoard = '';
  selectedWorkStyle = '';

  ['s1Name','s1City','s3Dream','s3Extra'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['s1Class','s1Stream','s3Grade'].forEach(id => {
    document.getElementById(id).value = '';
  });

  document.getElementById('loaderSteps').innerHTML = '';
  goStep(1);
}
