import { API_BASE } from '../lib/constants';

const icon    = document.getElementById('icon')!;
const heading = document.getElementById('heading')!;
const sub     = document.getElementById('sub')!;
const action  = document.getElementById('action')!;

const token = new URLSearchParams(location.search).get('token');

function setSuccess() {
  icon.className = 'verify-icon success';
  icon.textContent = '✓';
  heading.textContent = 'Email verified';
  sub.textContent = 'Your account is ready. You can now sign in.';
  action.innerHTML = '<a href="/auth.html" class="btn btn-primary" style="margin-top:0.5rem;">Sign in</a>';
}

function setError(msg: string) {
  icon.className = 'verify-icon error';
  icon.textContent = '✗';
  heading.textContent = 'Verification failed';
  sub.textContent = msg;
  action.innerHTML = '<a href="/auth.html" class="btn btn-ghost" style="margin-top:0.5rem;">Back to sign in</a>';
}

async function verify() {
  if (!token) {
    setError('No verification token found in the link.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/verify-email?token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (res.ok) {
      setSuccess();
    } else {
      setError(data.error || 'The link may have expired or already been used.');
    }
  } catch {
    setError('Could not reach the server. Please try again.');
  }
}

verify();
