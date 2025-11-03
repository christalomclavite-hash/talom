// app.js - frontend glue for Teachers Appointment System
// Works with the PHP /api/* endpoints

async function req(path, method = 'GET', body = null) {
  const opts = { method, headers: {} };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// Auth pages
function wireRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.elements['name'].value;
    const email = form.elements['email'].value;
    const password = form.elements['password'].value;
    try {
      await req('/api/register', 'POST', { name, email, password });
      window.location.href = '/profile/';
    } catch (err) {
      alert('Register failed: ' + (err.data?.error || JSON.stringify(err.data)));
    }
  });
}

// Login page
function wireLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.elements['email'].value;
    const password = form.elements['password'].value;
    try {
      await req('/api/login', 'POST', { email, password });
      window.location.href = '/profile/';
    } catch (err) {
      alert('Login failed: ' + (err.data?.error || JSON.stringify(err.data)));
    }
  });
}

// Profile page
async function loadProfile() {
  const el = document.getElementById('profile-info');
  if (!el) return;
  try {
    const data = await req('/api/profile', 'GET');
    el.innerHTML = `<h2>${escapeHtml(data.name)}</h2><p>${escapeHtml(data.email)}</p><p>Role: ${escapeHtml(data.role)}</p>`;
  } catch (err) {
    el.innerHTML = '<p>Please <a href="/login/">login</a>.</p>';
  }
}

function wireLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await req('/api/logout', 'POST');
    } catch (e) {
      // ignore
    }
    window.location.href = '/';
  });
}

// Header profile population and logout wiring
async function wireHeaderProfile() {
  // Populate header profile and dropdown with /api/profile data when available
  try {
    const data = await req('/api/profile', 'GET');

    // Update header profile (new class structure)
    const nameEl = document.querySelector('.profile-name .name');
    const roleEl = document.querySelector('.profile-name .role');
    if (nameEl) nameEl.textContent = escapeHtml(data.name || 'Guest');
    if (roleEl) roleEl.textContent = escapeHtml(data.role || '');

    // Update dropdown profile info
    const fullnameEl = document.querySelector('.profile-info .full-name');
    const emailEl = document.querySelector('.profile-info .email');
    const idEl = document.querySelector('.profile-info .id');
    if (fullnameEl) fullnameEl.textContent = escapeHtml(data.name || '');
    if (emailEl) emailEl.textContent = escapeHtml(data.email || '');
    if (idEl) idEl.textContent = `ID: ${escapeHtml(data.id || data.studentId || '')}`;
  } catch (err) {
    // Not logged in or error: show guest state
    const nameEl = document.querySelector('.profile-name .name');
    const roleEl = document.querySelector('.profile-name .role');
    if (nameEl) nameEl.textContent = 'Guest';
    if (roleEl) roleEl.textContent = 'Visitor';

    // Update dropdown info for guest
    const fullnameEl = document.querySelector('.profile-info .full-name');
    const emailEl = document.querySelector('.profile-info .email');
    const idEl = document.querySelector('.profile-info .id');
    if (fullnameEl) fullnameEl.textContent = 'Guest User';
    if (emailEl) emailEl.textContent = 'Not logged in';
    if (idEl) idEl.textContent = 'Please log in to continue';

    // Show login/register links instead of profile actions
    const profileLinks = document.querySelector('.profile-links');
    if (profileLinks) {
      profileLinks.innerHTML = `
        <a href="login/index.html" class="profile-link">
          <i class="fa-solid fa-right-to-bracket"></i>
          Login
        </a>
        <a href="register/index.html" class="profile-link">
          <i class="fa-solid fa-user-plus"></i>
          Register
        </a>
      `;
    }
  }

  // Wire logout link if present
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await req('/api/logout', 'POST');
      } catch (e) {
        // ignore errors
      }
      // After logout redirect to homepage/login
      window.location.href = '/';
    });
  }
  // Also wire admin logout (sidebar) to the same flow
  const adminLogout = document.getElementById('admin-logout');
  if (adminLogout) {
    adminLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await req('/api/logout', 'POST');
      } catch (err) {
        // ignore
      }
      window.location.href = '/';
    });
  }
}
function wireIndexAppt() {
  const create = document.getElementById('create-appt-btn');
  if (create) {
    create.addEventListener('click', async () => {
      const student_name = prompt('Student name:', 'Student Name');
      if (!student_name) return;
      const teacher_name = prompt('Teacher name:', 'Mrs. Smith');
      if (!teacher_name) return;
      const date = prompt('Date/time (ISO or text):', new Date().toISOString());
      if (!date) return;
      try {
        const res = await req('/api/appointments', 'POST', { student_name, teacher_name, date, notes: '' });
        alert('Created appointment id=' + res.id);
      } catch (err) {
        alert('Create failed: ' + (err.data?.error || JSON.stringify(err.data)));
      }
    });
  }

  const accept = document.getElementById('accept-appt-btn');
  if (accept) {
    accept.addEventListener('click', async () => {
      const id = prompt('Enter appointment id to accept:');
      if (!id) return;
      try {
        // use POST to support PHP endpoint which allows POST or PUT
        const res = await req('/api/appointments/' + encodeURIComponent(id) + '/accept', 'POST');
        alert('Accepted appointment id=' + id);
      } catch (err) {
        alert('Accept failed: ' + (err.data?.error || JSON.stringify(err.data)));
      }
    });
  }
}

// small escape helper for displaying profile
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];
  });
}

// Feedback form
function wireFeedback() {
  const form = document.getElementById('feedback-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      name: form.elements['name'].value,
      email: form.elements['email'].value,
      type: form.elements['type'].value,
      message: form.elements['message'].value
    };
    try {
      await req('/api/feedback', 'POST', formData);
      alert('Thank you for your feedback!');
      form.reset();
    } catch (err) {
      alert('Failed to submit feedback: ' + (err.data?.error || JSON.stringify(err.data)));
    }
  });
}

// Updates subscription
function wireUpdates() {
  const form = document.getElementById('updates-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updates = Array.from(form.elements['updates[]'])
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    const formData = {
      updates,
      method: form.elements['method'].value,
      email: form.elements['email'].value,
      phone: form.elements['phone'].value
    };
    try {
      await req('/api/notifications/subscribe', 'POST', formData);
      alert('Notification preferences saved!');
    } catch (err) {
      alert('Failed to save preferences: ' + (err.data?.error || JSON.stringify(err.data)));
    }
  });
}

// Favorite Note persistence
function wireFavoriteNote() {
  const textarea = document.querySelector('.fav-note textarea');
  if (!textarea) return;
  
  // Load saved note
  const saved = localStorage.getItem('favorite_note');
  if (saved) textarea.value = saved;
  
  // Save on change
  textarea.addEventListener('input', () => {
    localStorage.setItem('favorite_note', textarea.value);
  });
}

// Auto-wire everything based on presence of elements
document.addEventListener('DOMContentLoaded', () => {
  wireRegister();
  wireLogin();
  loadProfile();
  wireHeaderProfile();
  wireIndexAppt();
  wireFeedback();
  wireUpdates();
  wireFavoriteNote();
  // Initialize calendar if the module is present
  if (typeof initCalendar === 'function') {
    try { initCalendar(); } catch (e) { console.error('Calendar init failed', e); }
  }
  // Apply global UI settings (compact sidebar) from localStorage
  try {
    const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
    const compact = !!settings.compact_sidebar;
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('sidebar-compact', compact);

    // If the compact toggle exists on this page, keep it in sync
    const compactCheckbox = document.getElementById('compactMode') || document.getElementById('compactSidebar');
    if (compactCheckbox) {
      compactCheckbox.checked = compact;
      compactCheckbox.addEventListener('change', (e) => {
        const val = !!e.target.checked;
        if (sidebar) sidebar.classList.toggle('sidebar-compact', val);
        const s = JSON.parse(localStorage.getItem('app_settings') || '{}');
        s.compact_sidebar = val;
        localStorage.setItem('app_settings', JSON.stringify(s));
      });
    }
  } catch (e) {
    console.error('Failed to apply settings', e);
  }
});
