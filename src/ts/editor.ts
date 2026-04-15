// elements
const textarea = document.getElementById('code-input') as HTMLTextAreaElement;
const lineNumEl = document.getElementById('line-numbers') as HTMLDivElement;
const cursorPosEl = document.getElementById('cursor-pos') as HTMLSpanElement;
const charCountEl = document.getElementById('char-count') as HTMLSpanElement;
const statusDot = document.getElementById('status-dot') as HTMLSpanElement;
const outputEl = document.getElementById('output-display') as HTMLPreElement;
const outputLabel = document.getElementById('output-label') as HTMLSpanElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const submissionsEmpty = document.getElementById('submissions-empty') as HTMLDivElement;
const submissionsRows = document.getElementById('submissions-rows') as HTMLDivElement;

const DEFAULT_CODE = `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here

    }
};
`;

// line numbers
function updateLineNumbers(): void {
  const lines = textarea.value.split('\n');
  const total = lines.length;
  const selStart = textarea.selectionStart;
  const activeLn = textarea.value.substring(0, selStart).split('\n').length;

  lineNumEl.innerHTML = '';
  for (let i = 1; i <= total; i++) {
    const span = document.createElement('span');
    span.className = 'ln' + (i === activeLn ? ' active' : '');
    span.textContent = String(i);
    lineNumEl.appendChild(span);
  }

  lineNumEl.scrollTop = textarea.scrollTop;

  const col = selStart - textarea.value.lastIndexOf('\n', selStart - 1);
  cursorPosEl.textContent = `Ln ${activeLn}, Col ${col}`;
  charCountEl.textContent = `${total} line${total !== 1 ? 's' : ''}`;
}

textarea.addEventListener('input', updateLineNumbers);
textarea.addEventListener('keyup', updateLineNumbers);
textarea.addEventListener('click', updateLineNumbers);
textarea.addEventListener('scroll', () => {
  lineNumEl.scrollTop = textarea.scrollTop;
});

textarea.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = textarea.selectionStart;
    textarea.value = textarea.value.substring(0, s) + '    ' + textarea.value.substring(textarea.selectionEnd);
    textarea.selectionStart = textarea.selectionEnd = s + 4;
    updateLineNumbers();
  }
});

updateLineNumbers();

// panel tabs
document.querySelectorAll<HTMLButtonElement>('.panel-tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.panel-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const targetTab = document.getElementById('tab-' + tab.dataset.tab);
    if (targetTab) {
      targetTab.classList.add('active');
    }
  });
});

// console state
let currentStdout = '';
let currentStderr = '';
let activeConsole: 'stdout' | 'stderr' = 'stdout';
let currentState = '';

function setOutput(stdout: string, stderr: string, state: string): void {
  currentStdout = stdout || '';
  currentStderr = stderr || '';
  currentState = state || '';
  renderConsole();
}

function renderConsole(): void {
  outputEl.textContent = activeConsole === 'stdout' ? currentStdout : currentStderr;
  outputEl.className = currentState;
  statusDot.className = 'status-dot' + (currentState ? ' ' + currentState : '');
}

document.getElementById('tab-stdout')?.addEventListener('click', () => {
  activeConsole = 'stdout';
  document.getElementById('tab-stdout')?.classList.add('active');
  document.getElementById('tab-stderr')?.classList.remove('active');
  renderConsole();
});

document.getElementById('tab-stderr')?.addEventListener('click', () => {
  activeConsole = 'stderr';
  document.getElementById('tab-stderr')?.classList.add('active');
  document.getElementById('tab-stdout')?.classList.remove('active');
  renderConsole();
});

clearBtn.addEventListener('click', () => {
  setOutput('', '', '');
  outputLabel.textContent = 'Console';
  outputEl.textContent = '';
});

resetBtn.addEventListener('click', () => {
  textarea.value = DEFAULT_CODE;
  updateLineNumbers();
  setOutput('', '', '');
  outputLabel.textContent = 'Console';
  outputEl.textContent = 'Ready. Write your solution and click Run or Submit.';
});

// submissions
interface Submission {
  verdict: string;
  runtime: number | null;
  time: Date;
}

const submissions: Submission[] = [];

function addSubmission(verdict: string, runtime: number | null): void {
  submissions.unshift({ verdict, runtime, time: new Date() });
  renderSubmissions();
  // Switch to submissions tab
  document.querySelectorAll('.panel-tabs .tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const submissionsTab = document.querySelector<HTMLButtonElement>('[data-tab="submissions"]');
  if (submissionsTab) {
    submissionsTab.classList.add('active');
  }
  document.getElementById('tab-submissions')?.classList.add('active');
}

function renderSubmissions(): void {
  if (!submissions.length) {
    submissionsEmpty.style.display = 'flex';
    submissionsRows.innerHTML = '';
    return;
  }
  submissionsEmpty.style.display = 'none';
  submissionsRows.innerHTML = submissions.map(s => {
    const isOk = s.verdict === 'Accepted';
    const ts = s.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const rt = s.runtime != null ? s.runtime + ' ms' : '—';
    return `
      <div class="submission-row">
        <span class="sub-verdict ${isOk ? 'accepted' : 'wrong'}">${s.verdict}</span>
        <span class="sub-time">${rt}</span>
        <span class="sub-time">${ts}</span>
      </div>`;
  }).join('');
}

// run
// TODO: replace the stub below with a real fetch() the backend.
// POST /api/run  { code: string, language: "cpp17" }
// Response:      { stdout: string, stderr: string, exitCode: number }
runBtn.addEventListener('click', async () => {
  runBtn.disabled = true;
  statusDot.className = 'status-dot loading';
  outputLabel.textContent = 'Running...';
  outputEl.className = '';
  outputEl.textContent = 'Compiling...';

  // stand in until backend is added
  await new Promise(r => setTimeout(r, 600));
  const stubResult = {
    stdout: '[stub] No backend connected yet.\nWire up POST /api/run to run code.',
    stderr: '',
    exitCode: 0
  };

  // ── real fetch (for when backend is ready) ─────────────
  // let stubResult: { stdout: string; stderr: string; exitCode: number };
  // try {
  //   const res = await fetch('/api/run', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ code: textarea.value, language: 'cpp17' })
  //   });
  //   stubResult = await res.json();
  // } catch (err) {
  //   stubResult = { stdout: '', stderr: (err as Error).message, exitCode: 1 };
  // }

  const hasError = stubResult.exitCode !== 0 || !!stubResult.stderr;
  setOutput(stubResult.stdout, stubResult.stderr, hasError ? 'error' : 'success');
  outputLabel.textContent = hasError ? 'Error' : 'Console';
  runBtn.disabled = false;
});

// submit 
// TODO: replace the stub below with a real fetch() to the backend.
// POST /api/submit  { code: string, language: "cpp17", problemId: number }
// Response:         { verdict: string, runtime: number, stdout: string, stderr: string }
submitBtn.addEventListener('click', async () => {
  submitBtn.disabled = true;
  statusDot.className = 'status-dot loading';
  outputLabel.textContent = 'Judging...';
  outputEl.className = '';
  outputEl.textContent = 'Submitting...';

  // stand in (remove when backend is ready)
  await new Promise(r => setTimeout(r, 800));
  const stubResult = {
    verdict: 'Accepted',
    runtime: 42,
    stdout: '[stub] No backend connected yet.\nWire up POST /api/submit to judge submissions.',
    stderr: ''
  };

  // for when backend is ready
  // let stubResult: { verdict: string; runtime: number | null; stdout: string; stderr: string };
  // try {
  //   const res = await fetch('/api/submit', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ code: textarea.value, language: 'cpp17', problemId: 1 })
  //   });
  //   stubResult = await res.json();
  // } catch (err) {
  //   stubResult = { verdict: 'Error', runtime: null, stdout: '', stderr: (err as Error).message };
  // }

  const isOk = stubResult.verdict === 'Accepted';
  setOutput(stubResult.stdout, stubResult.stderr, isOk ? 'success' : 'error');
  outputLabel.textContent = stubResult.verdict;
  addSubmission(stubResult.verdict, stubResult.runtime);
  submitBtn.disabled = false;
});
