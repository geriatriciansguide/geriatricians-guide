// The Geriatrician's Guide — "Is It Time?" self-assessment (view layer)
// Stepped flow + verbatim reader copy, ported from the confirmed design reference
// (reference/Is It Time - Self-Assessment [Web Tool].dc.html). Scoring is imported
// from the single source of truth (scoring.js) — no duplicated rules here.
//
// Reader copy (questions, scale, outcomes, disclaimers) is transcribed verbatim
// from the reference. Do not paraphrase.

import { evaluate } from './scoring.js';

/* ---- Behavior flags (per port README) ---- */
const CONFIG = { autoAdvance: true, showProgress: true, advanceDelay: 300 };

/* ---- Links ---- */
const LINKS = {
  startingTheConversation: '/starting-the-conversation',
  theLongRoad: '/the-long-road',
  // The blank-assessment PDF path is host-specific (static vs Astro), so each host
  // page declares it via data-pdf on #iit-root. Falls back to the static path.
  printablePDF: (document.getElementById('iit-root') || {}).getAttribute
    ? (document.getElementById('iit-root').getAttribute('data-pdf') || 'assets/is-it-time-assessment.pdf')
    : 'assets/is-it-time-assessment.pdf',
};

const DOMAIN_LABELS = {
  safety: 'Safety',
  cognition: 'Cognition',
  selfCare: 'Self Care',
  caregiver: 'Caregiver Sustainability',
};

const SCALE = [
  { v: 0, label: 'Not a concern', desc: 'This is not happening, or happens very rarely' },
  { v: 1, label: 'Some concern', desc: 'This has started, comes and goes, or you\u2019ve noticed it but aren\u2019t sure yet' },
  { v: 2, label: 'Significant concern', desc: 'This is happening consistently, or has happened in a way that scared you' },
];

const QUESTIONS = [
  {
    n: 1, domain: 'safety',
    text: 'Has any of this happened in the past few months? Check any that apply, then score the question as a whole.',
    checklist: [
      'A fall or near-fall',
      'The stove, oven, or faucet(s) left on',
      'An injury or bruise they couldn\u2019t explain',
      'Wandered, got lost, or left the house alone unexpectedly',
      'A neighbor or friend had to step in or reach out about something safety-related',
    ],
  },
  { n: 2, domain: 'safety', text: 'If something went wrong right now, a fall or a medical emergency, could your loved one recognize it and get help?' },
  {
    n: 3, domain: 'safety',
    text: 'In the past year, has your loved one been to the ER or been admitted to the hospital?',
    scale: [
      { v: 0, label: 'None', desc: 'No ER visits or hospital admissions in the past year' },
      { v: 1, label: 'Once', desc: 'One ER visit or hospital admission in the past year' },
      { v: 2, label: 'More than once', desc: 'Two or more ER visits or hospital admissions in the past year' },
    ],
  },
  { n: 4, domain: 'safety', text: 'Is your loved one still driving? If so, have there been near-misses or accidents, getting lost on familiar routes, or people quietly avoiding riding along?' },
  { n: 5, domain: 'cognition', text: 'Can your loved one accurately tell you: what medications they take, how often, and why?' },
  { n: 6, domain: 'cognition', text: 'If a stranger called claiming to be a grandchild in trouble, or a bank asking to verify account details, would your loved one recognize it as a scam and hang up?' },
  { n: 7, domain: 'cognition', text: 'Have you noticed repeated stories, forgotten recent conversations, or confusion about the day, date, or where they are?' },
  { n: 8, domain: 'selfCare', text: 'Are meals, medications, and bills being handled consistently? Does anything in the mail, the fridge, or the calendar suggest otherwise?' },
  {
    n: 9, domain: 'selfCare',
    text: 'Has personal care changed in any of these ways? Check any that apply, then score the question as a whole.',
    checklist: [
      'Bathing or dressing has become difficult',
      'Using the bathroom independently has become difficult',
      'Getting in or out of bed or a chair safely has become difficult',
      'Eating enough has become a struggle',
    ],
  },
  { n: 10, domain: 'caregiver', text: 'Is keeping things running as they are wearing you, or another caregiver in this person\u2019s life, down in a way that can\u2019t continue indefinitely?' },
];

const scaleFor = (q) => q.scale || SCALE;

const NOTE_BEFORE = 'Distance, privacy rules, or a strained relationship can all get in the way of this. If you can\u2019t reach the doctor directly \u2014 you\u2019re not an authorized contact, or your loved one won\u2019t go \u2014 that\u2019s common, and it\u2019s exactly what the Starting the Conversation guide helps with.';

const OUTCOMES = {
  1: {
    title: 'Talk to the doctor this week.',
    paras: [
      'If this came on suddenly, in the last few days, or your loved one seems unwell right now, don\u2019t wait for an appointment: call today, or use urgent care or the ER if you can\u2019t reach the doctor\u2019s office. A sudden change is often something treatable, but it needs to be evaluated quickly, not watched.',
      'If this has been building over weeks or months, call this week, and ask specifically to address what\u2019s concerning you: a fall-risk assessment if a safety question set this off, a full medication review if it was the medications question, or an evaluation of memory and judgment if it was a pattern of safety concerns. Naming what you\u2019re worried about gets a more useful visit than a general checkup. This is a medical question before it\u2019s a housing question.',
    ],
  },
  2: {
    title: 'Time to start the real work.',
    paras: [
      'Not necessarily time to move tomorrow, but time to stop watching and start planning. First: mention this pattern to your loved one\u2019s doctor, at the next visit or sooner if you can get one. Some of what looks like decline is treatable and worth ruling out before you assume it\u2019s permanent. Second: start the personal side. Download the free Starting the Conversation guide and use it to bring your loved one into this, rather than deciding on their behalf. (<em>The Long Road</em> walks through how to gauge whether you have three weeks or six months, if you want a fuller picture.)',
    ],
  },
  3: {
    title: 'Keep watching.',
    intro: 'Something specific stood out, even if nothing else did. Here\u2019s what to do next.',
    branchA: {
      title: 'If the trigger was Safety, Cognition, or Self Care',
      body: 'Go back and find what concerned you, whether it\u2019s one clear answer or a few smaller ones spread across different areas. Write down exactly what you saw, the date, and the specific example, not just \u201cthey seemed off.\u201d If you attend, mention it at their next routine doctor\u2019s visit. A primary care visit is a low-key way to get a second set of eyes on something you\u2019re not sure about yet. Put a date on your calendar one month out and retake this assessment then. If the same thing shows up again, or spreads further, that\u2019s your answer.',
    },
    branchB: {
      title: 'If Caregiver Sustainability is marked',
      body: 'This one isn\u2019t about your loved one, it\u2019s about you, and \u201cwatch and reassess in a month\u201d isn\u2019t a real answer to it. What you need isn\u2019t more tracking, it\u2019s less load: a break, someone else taking a shift, a conversation with your own doctor about how this is affecting you, or simply saying out loud to another person that you can\u2019t keep carrying this alone. Revisit this question specifically whenever your own capacity changes, not on a fixed schedule.',
    },
    both: {
      title: 'If both are marked',
      body: 'Follow both steps above. Multiple things can be true at once, and often are: something about your loved one is worth watching, and the load on you is also real. You don\u2019t have to choose between them.',
    },
  },
  4: {
    title: 'Not yet, and that\u2019s real information.',
    paras: [
      'Nothing here crossed into real concern. That\u2019s a trustworthy answer, not a guess, and not a reason to keep checking on a schedule. Don\u2019t put this on your calendar. Their next annual wellness visit is a natural place to mention what you\u2019ve been noticing, even at this level, a good primary care relationship catches more over time than periodic panic does. Otherwise, come back to this only if something actually changes: a fall, a hospitalization, a diagnosis, a bad week that doesn\u2019t end.',
    ],
  },
};

const DISCLAIMER = 'This assessment is for educational purposes only and does not constitute medical advice or establish a physician-patient relationship. Please discuss your loved one\u2019s individual needs with their treating physician.';

/* ---- Small SVG icons (Lucide-derived, 1.5px stroke) ---- */
const ICON = {
  arrowRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  arrowLeft: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>',
  printer: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
};

/* ---- Persistence ---- */
const KEY = { answers: 'iit-v1-answers', checks: 'iit-v1-checks', step: 'iit-v1-step', screen: 'iit-v1-screen' };
/* Session-scoped by design: answers survive a refresh or an accidental back-navigation
   within the same tab, and are discarded when the tab closes. Nothing persists to disk,
   so a shared device carries no residue of a previous person's assessment. */
function load(k, fallback) { try { const v = sessionStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } }
function save(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

/* ---- State ---- */
let answers = load(KEY.answers, {});   // { n: 0|1|2 }
let checks = load(KEY.checks, {});     // { n: [indexes] }
let stepIdx = load(KEY.step, 0);
let screen = load(KEY.screen, 'intro');
let justPicked = null;                 // index of the question just answered (clears the Next button during the auto-advance window)
/* Clickwrap: held in memory for this page view only. Nothing is stored, so the box
   has to be checked again every time someone comes back to the page. */
let consented = false;
/* Email gate between question 10 and the results. In memory only, like the clickwrap. */
let emailed = false;
let sentTo = '';
/* Host-relative legal links: static build uses .html pages, Astro build uses clean routes. */
const HTML_HOST = location.pathname.indexOf('.html') !== -1;
const TERMS_HREF = HTML_HOST ? 'terms.html' : '/terms';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const allAnswered = () => QUESTIONS.every((q) => answers[q.n] != null);
const firstUnanswered = () => { const i = QUESTIONS.findIndex((q) => answers[q.n] == null); return i === -1 ? 0 : i; };
let advanceTimer = null;

/* ============================================================
   RENDER
   ============================================================ */
function screenIntro() {
  return `
  <section class="iit-screen" data-screen="intro">
    <p class="iit-eyebrow">A self-assessment</p>
    <h1>Is It Time?</h1>
    <div class="iit-title-rule"></div>

    <div class="iit-lede">
      <p>There\u2019s a difference between a person who\u2019s declining and someone who can no longer safely live alone \u2014 and months can be lost in the fog between.</p>
    </div>
    <p class="iit-intro-body">This isn\u2019t a test to pass or fail. It\u2019s a way to turn a vague impression into something you can see \u2014 and put in front of someone who isn\u2019t ready to see it yet.</p>
    <p class="iit-intro-body">Answer honestly, and score each question as an actual number. That\u2019s what turns the feeling you\u2019ve been carrying around into something you can act on.</p>

    <p class="iit-section-label">Before you begin</p>
    <p class="iit-note">If your loved one is having a medical emergency right now, call <strong>911</strong> or go to the ER. Come back to this assessment when things are stable.</p>
    <p class="iit-note">If there\u2019s someone else who knows your loved one well \u2014 a sibling, a spouse, a friend \u2014 it\u2019s worth asking them to score this separately too, before comparing notes. Where you agree helps validate what you\u2019re seeing. If they score it more favorably than you, that gap may mean you\u2019re minimizing, or it may mean something worth paying closer attention to. If they score it more severely than you, listen. They may have been waiting for you to ask. If there\u2019s no one else, that\u2019s fine, this works just as well on its own.</p>
    <p class="iit-note">One thing before you start: there\u2019s no single score at the end. Some gaps can be weighed against everything that\u2019s going right; some can\u2019t. So instead of a total, you\u2019ll get a plain answer: what to do next.</p>

    <p class="iit-section-label">How to score</p>
    <p class="iit-scale-intro">The same three-point scale applies to all ten questions.</p>
    <div class="iit-scale">
      ${SCALE.map((s) => `
      <div class="iit-scale-row">
        <div class="iit-dot iit-dot--${s.v}">${s.v}</div>
        <div>
          <div class="iit-scale-label">${esc(s.label)}</div>
          <div class="iit-scale-desc">${esc(s.desc)}</div>
        </div>
      </div>`).join('')}
    </div>

    <p class="iit-section-label">Interactive assessment disclaimer</p>
    <div class="iit-consent-body"><p>${CONSENT_DISCLAIMER}</p></div>
    <label class="iit-check iit-consent-check">
      <input type="checkbox" autocomplete="off" id="iit-consent"${consented ? ' checked' : ''}>
      <span class="iit-check-box">${ICON.check}</span>
      <span>I agree to the <a href="${TERMS_HREF}">Terms of Use</a> and acknowledge this tool is for educational purposes, not medical advice.</span>
    </label>
    <div class="iit-cta-row">
      <button class="btn btn--accent" data-action="begin"${consented ? '' : ' disabled'}>Begin the assessment ${ICON.arrowRight}</button>
    </div>
    <p class="iit-consent-hint"${consented ? ' hidden' : ''}>Check the box above to begin.</p>
  </section>`;
}

function screenQuestion() {
  const q = QUESTIONS[stepIdx];
  const scale = scaleFor(q);
  const fill = CONFIG.showProgress ? Math.round(((stepIdx + 1) / QUESTIONS.length) * 100) : 0;
  const checklist = q.checklist ? `
    <ul class="iit-checklist">
      ${q.checklist.map((c, i) => {
        const on = (checks[q.n] || []).includes(i);
        return `<li><label class="iit-check">
          <input type="checkbox" autocomplete="off" data-check="${q.n}" data-idx="${i}" ${on ? 'checked' : ''}>
          <span class="iit-check-box">${ICON.check}</span>
          <span>${esc(c)}</span>
        </label></li>`;
      }).join('')}
    </ul>` : '';

  return `
  <section class="iit-screen" data-screen="question">
    ${CONFIG.showProgress ? `
    <div class="iit-progress">
      <div class="iit-progress-track"><div class="iit-progress-fill" style="width:${fill}%"></div></div>
      <div class="iit-progress-meta">
        <span class="iit-domain">${esc(DOMAIN_LABELS[q.domain])}</span>
        <span class="iit-count">Question ${q.n} of ${QUESTIONS.length}</span>
      </div>
    </div>` : ''}

    <div class="iit-q-head">
      <div class="iit-q-num">${q.n}</div>
      <div>
        <p class="iit-q-text">${esc(q.text)}</p>
        ${checklist}
      </div>
    </div>

    <div class="iit-options">
      ${scale.map((s) => {
        const sel = answers[q.n] === s.v ? ' is-selected' : '';
        return `<button class="iit-option${sel}" data-score="${s.v}" data-q="${q.n}">
          <span class="iit-option-dot">${s.v}</span>
          <span>
            <span class="iit-option-label">${esc(s.label)}</span>
            <span class="iit-option-desc">${esc(s.desc)}</span>
          </span>
        </button>`;
      }).join('')}
    </div>

    <div class="iit-q-nav">${navHTML()}</div>
  </section>`;
}

function navHTML() {
  const q = QUESTIONS[stepIdx];
  const answered = answers[q.n] != null;
  const showNext = answered && (!CONFIG.autoAdvance || justPicked !== stepIdx);
  const label = stepIdx === QUESTIONS.length - 1 ? 'See result' : 'Next';
  return `
    <button class="iit-back" data-action="back">${ICON.arrowLeft} Back</button>
    ${showNext ? `<button class="iit-fwd" data-action="next">${label} ${ICON.arrowRight}</button>` : ''}
  `;
}

/* Attorney-supplied clickwrap, reproduced verbatim from "Is It Time Clickwrap
   Disclaimer" — do not edit or paraphrase. Emphasis (bold) is as supplied. */
const CONSENT_DISCLAIMER = 'The \u201cIs It Time?\u201d self-assessment tool is designed solely as an educational rubric to help families explore and reflect upon potential senior care needs. <strong>THE RESULTS OF THIS ASSESSMENT ARE PURELY INFORMATIONAL AND EXPLORATORY; THEY DO NOT CONSTITUTE A CLINICAL EVALUATION OR MEDICAL DIAGNOSIS.</strong> This tool evaluates general scenarios and cannot account for the specific medical history, physical health, or cognitive nuances of your loved one. Therefore, the results generated by this tool <strong>should not be used as the sole basis for making senior care, medical, or financial decisions.</strong> Before altering care levels, changing living arrangements, or making medical decisions, you must consult with your loved one\u2019s treating physician, a geriatric specialist, or another qualified elder care professional who can provide a personalized, clinical evaluation. By checking the box and using this tool, you acknowledge its purely educational nature and agree that The Geriatrician\u2019s Guide LLC is not liable for any actions taken based on these exploratory results.';

function screenEmail() {
  return `
  <section class="iit-screen" data-screen="email">
    <p class="iit-eyebrow">That\u2019s all ten</p>
    <h2 class="iit-email-title">Your results are ready.</h2>
    <div class="iit-title-rule"></div>
    <p class="iit-email-body">Enter your email to see them. Your answers stay in this browser \u2014 they are never sent anywhere or tied to your email. You can print the results from the next screen.</p>

    <div class="iit-mailme">
      <div class="iit-mailme__rule"></div>
      <div class="iit-mailme__inner">
        <p class="iit-mailme__label">Enter your email to continue</p>
        <p class="iit-mailme__sub">You\u2019ll also get the newsletter: what I see when I walk into a community, and what to ask before you sign anything. No spam, no placement calls. Unsubscribe anytime.</p>

        <!-- Kit form 9942282 \u2014 subscribes the reader to the newsletter only. No assessment
             answers are transmitted: the results render in the browser either way. -->
        <form class="email-form email-form--dark" id="iit-results-form" action="https://app.kit.com/forms/9942282/subscriptions" method="post">
          <input type="email" name="email_address" placeholder="you@email.com" aria-label="Email address" required>
          <button type="submit">Show my results ${ICON.arrowRight}</button>
        </form>
        <p class="iit-mailme__fine">We never sell your personal information.</p>
      </div>
    </div>

  </section>`;
}

function screenResult() {
  const { outcome, branches } = evaluate(answers);
  const o = OUTCOMES[outcome];

  let body = '';
  if (outcome === 3) {
    body += `<p>${esc(o.intro)}</p>`;
    if (branches.A) body += `<div class="iit-branch"><div class="iit-branch-title">${esc(o.branchA.title)}</div><p>${o.branchA.body}</p></div>`;
    if (branches.B) body += `<div class="iit-branch iit-branch--b"><div class="iit-branch-title">${esc(o.branchB.title)}</div><p>${o.branchB.body}</p></div>`;
    if (branches.both) body += `<div class="iit-branch iit-branch--both"><div class="iit-branch-title">${esc(o.both.title)}</div><p>${o.both.body}</p></div>`;
  } else {
    body += o.paras.map((p) => `<p>${p}</p>`).join('');
  }

  const answersList = QUESTIONS.map((q) => {
    const v = answers[q.n];
    const scale = scaleFor(q);
    const scoreLabel = scale[v] ? scale[v].label : '';
    return `<li>
      <span class="iit-answer-badge" data-score="${v}">${v}</span>
      <span class="iit-answer-score-label">${esc(scoreLabel)}</span>
      <span class="iit-answer-body">
        <span class="iit-answer-domain">${esc(DOMAIN_LABELS[q.domain])}</span>
        <span class="iit-answer-text">${esc(q.text)}</span>
      </span>
    </li>`;
  }).join('');

  return `
  <section class="iit-screen" data-screen="result">
    <p class="iit-section-label">Your outcome</p>

    <div class="iit-before">
      <p class="iit-eyebrow">A note before you read on</p>
      <p>${esc(NOTE_BEFORE)}</p>
    </div>

    <div class="iit-outcome" data-outcome="${outcome}">
      <h2>${o.title}</h2>
      ${body}
    </div>

    <p class="iit-section-label iit-answers-label">Your answers</p>
    <p class="iit-answers-intro">A record of what you marked, so you can look back or share it with your loved one\u2019s doctor.</p>
    <ul class="iit-answers-list">${answersList}</ul>

    <div class="iit-next-single">
      <p class="iit-next-single-label">Where to go next</p>

      <div class="iit-next-block iit-next-block--guide">
        <p class="iit-next-block-eyebrow">Free guide</p>
        <h3 class="iit-next-block-title">Starting the Conversation</h3>
        <p class="iit-next-block-body">A step-by-step guide to raising this with your loved one \u2014 so the decision is made with them, not around them.</p>
        <a class="iit-next-block-btn iit-next-block-btn--guide" href="${LINKS.startingTheConversation}">Get the guide ${ICON.arrowRight}</a>
      </div>

      <div class="iit-next-block iit-next-block--book">
        <p class="iit-next-block-eyebrow">The complete resource</p>
        <h3 class="iit-next-block-title">The Long Road</h3>
        <p class="iit-next-block-sub">A Geriatrician\u2019s Complete Guide to Senior Care Decisions</p>
        <p class="iit-next-block-body">Chapter 4 goes deeper into the ten questions you just answered \u2014 how to see what\u2019s actually happening, how much time you have before this becomes urgent, and what to do if you\u2019re met with resistance. When you\u2019re ready, the rest of the book is waiting: the financial mechanics, what to look for once you\u2019re touring, and how to keep advocating for your loved one through whatever comes next.</p>
        <a class="iit-next-block-btn iit-next-block-btn--book" href="${LINKS.theLongRoad}">Get The Long Road ${ICON.arrowRight}</a>
      </div>
    </div>

    <div class="iit-actions">
      <button class="iit-action-btn iit-action-btn--retake" data-action="retake">${ICON.refresh} Retake the assessment</button>
      <button class="iit-action-btn iit-action-btn--print" data-action="print">${ICON.printer} Print my result</button>
      <a class="iit-action-btn iit-action-btn--pdf" href="${LINKS.printablePDF}" target="_blank" rel="noopener">${ICON.download} Get the printable PDF version</a>
    </div>
  </section>`;
}

/* ============================================================
   CONTROLLER
   ============================================================ */
let root;

function render() {
  let html;
  if (screen === 'result' && !allAnswered()) {
    // Guard against ever landing on a result with a gap (e.g. a skipped
    // question) — send the visitor back to the question that's missing,
    // not all the way to the intro.
    screen = 'question';
    stepIdx = firstUnanswered();
  }
  if (screen === 'result' && !emailed) html = screenEmail();
  else if (screen === 'result') html = screenResult();
  else if (screen === 'question') html = screenQuestion();
  else { screen = 'intro'; html = screenIntro(); }
  root.innerHTML = html;
  const s = root.querySelector('.iit-screen');
  if (s) {
    // Force a reflow so the fade animation restarts on each screen swap.
    void s.offsetHeight;
    s.classList.add('is-active');
  }
  // Defeat browser form-state restoration: force each checkbox to match our state.
  root.querySelectorAll('[data-check]').forEach((cb) => {
    const on = (checks[cb.dataset.check] || []).includes(Number(cb.dataset.idx));
    cb.checked = on;
  });
  const consentBox = root.querySelector('#iit-consent');
  if (consentBox) consentBox.checked = consented;
  save(KEY.screen, screen);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function goToStep(i) {
  if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
  stepIdx = Math.max(0, Math.min(QUESTIONS.length - 1, i));
  justPicked = null;
  save(KEY.step, stepIdx);
  screen = 'question';
  render();
}

function selectScore(n, v) {
  answers[n] = v;
  justPicked = stepIdx;
  save(KEY.answers, answers);
  // reflect selection immediately
  root.querySelectorAll(`.iit-option[data-q="${n}"]`).forEach((b) => {
    b.classList.toggle('is-selected', Number(b.dataset.score) === v);
  });
  const fill = root.querySelector('.iit-progress-fill');
  if (fill) fill.style.width = Math.round(((stepIdx + 1) / QUESTIONS.length) * 100) + '%';
  const nav = root.querySelector('.iit-q-nav');
  if (nav) nav.innerHTML = navHTML();
  if (CONFIG.autoAdvance) {
    // Debounce: cancel any pending advance from a previous pick on this same
    // question, and only fire if we're still sitting on that question when
    // the timer matures (guards against double-clicks queuing two advances
    // and skipping the next question).
    const from = stepIdx;
    if (advanceTimer) clearTimeout(advanceTimer);
    advanceTimer = setTimeout(() => {
      advanceTimer = null;
      if (screen !== 'question' || stepIdx !== from) return;
      if (stepIdx < QUESTIONS.length - 1) goToStep(stepIdx + 1);
      else { screen = 'result'; render(); }
    }, CONFIG.advanceDelay);
  }
}

function onClick(e) {
  const opt = e.target.closest('.iit-option');
  if (opt) { selectScore(Number(opt.dataset.q), Number(opt.dataset.score)); return; }

  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;

  if (action === 'begin') {
    // Clickwrap: the assessment cannot start until the box is actually checked.
    if (!consented) {
      const cb = root.querySelector('#iit-consent');
      if (!cb || !cb.checked) return;
      consented = true;
    }
    goToStep(0);
  }
  else if (action === 'back') {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    if (stepIdx === 0) { screen = 'intro'; render(); }
    else goToStep(stepIdx - 1);
  }
  else if (action === 'next') {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    if (stepIdx < QUESTIONS.length - 1) goToStep(stepIdx + 1);
    else { screen = 'result'; render(); }
  }
  else if (action === 'retake') {
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    // A fresh run means a fresh agreement: the box has to be checked again.
    answers = {}; checks = {}; stepIdx = 0; screen = 'intro'; justPicked = null; consented = false; emailed = false; sentTo = '';
    save(KEY.answers, answers); save(KEY.checks, checks); save(KEY.step, stepIdx);
    render();
  }
  else if (action === 'print') { window.print(); }
}

function onChange(e) {
  const consent = e.target.closest('#iit-consent');
  if (consent) {
    const btn = root.querySelector('[data-action="begin"]');
    const hint = root.querySelector('.iit-consent-hint');
    if (btn) btn.disabled = !consent.checked;
    if (hint) hint.hidden = consent.checked;
    return;
  }
  const cb = e.target.closest('[data-check]');
  if (!cb) return;
  const n = cb.dataset.check, idx = Number(cb.dataset.idx);
  const arr = new Set(checks[n] || []);
  if (cb.checked) arr.add(idx); else arr.delete(idx);
  checks[n] = [...arr];
  save(KEY.checks, checks);
}

function onSubmit(e) {
  const form = e.target.closest('#iit-results-form');
  if (!form) return;
  e.preventDefault();
  const field = form.querySelector('input[type="email"]');
  if (!field || !field.value) return;
  window.ggKitSubmit(form, function () {
    sentTo = field.value;
    emailed = true;
    render();
  });
}

function init() {
  root = document.getElementById('iit-root');
  if (!root) return;
  // Resume sanity: don't land on a stale result if answers were cleared.
  if (screen === 'result' && !allAnswered()) screen = 'intro';
  // The clickwrap gates the whole tool, and it is never remembered: every page
  // load starts at the intro, where the box has to be checked again.
  screen = 'intro'; stepIdx = 0; save(KEY.step, stepIdx);
  // Drop any agreement a previous build stored on the device.
  try { ['iit-v1-consent', 'iit-v1-consent-at'].forEach((k) => { sessionStorage.removeItem(k); localStorage.removeItem(k); }); } catch (e) {}
  if (screen === 'question') stepIdx = Math.min(stepIdx, QUESTIONS.length - 1);
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('submit', onSubmit);
  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
