import { api, setSession, getSession } from './api';

if (getSession()) location.href = '/app.html';

const tabBtns   = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const regForm   = document.getElementById('register-form') as HTMLFormElement;
const loginErr  = document.getElementById('login-error') as HTMLElement;
const regMsg    = document.getElementById('register-msg') as HTMLElement;

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    loginForm.classList.toggle('hidden', tab !== 'login');
    regForm.classList.toggle('hidden', tab !== 'register');
    loginErr.classList.add('hidden');
    regMsg.classList.add('hidden');
  });
});

function setLoading(btn: HTMLButtonElement, loading: boolean) {
  btn.disabled = loading;
  btn.dataset.label = btn.dataset.label || btn.textContent || '';
  btn.innerHTML = loading ? '<span class="spinner"></span>' : btn.dataset.label;
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = loginForm.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const email    = (document.getElementById('login-email') as HTMLInputElement).value.trim();
  const password = (document.getElementById('login-password') as HTMLInputElement).value;
  loginErr.classList.add('hidden');
  setLoading(btn, true);
  try {
    const data = await api.login(email, password);
    setSession(data.user);
    location.href = '/app.html';
  } catch (err: any) {
    loginErr.textContent = err.message;
    loginErr.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
});

regForm.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = regForm.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const email    = (document.getElementById('reg-email') as HTMLInputElement).value.trim();
  const password = (document.getElementById('reg-password') as HTMLInputElement).value;
  const name     = (document.getElementById('reg-name') as HTMLInputElement).value.trim();
  regMsg.className = 'flash hidden';
  setLoading(btn, true);
  try {
    await api.register(email, password, name);
    regMsg.textContent = 'Check your email to verify your account.';
    regMsg.classList.remove('hidden');
    regMsg.classList.add('flash-success');
    regForm.reset();
  } catch (err: any) {
    regMsg.textContent = err.message;
    regMsg.classList.remove('hidden');
    regMsg.classList.add('flash-error');
  } finally {
    setLoading(btn, false);
  }
});
