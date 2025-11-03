// Simple dev server with mock API endpoints
// Usage: node server.js

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// In-memory mock user store and sessions
const USERS = {
  'john.smith@student.sti.edu': {
    id: 'STI-2025-1234',
    name: 'John Smith',
    email: 'john.smith@student.sti.edu',
    role: 'BSIT Student',
    password: 'password' // sample password for dev only
  }
};
const SESSIONS = {}; // token -> email

function makeToken() {
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
}

// Helper to get current user from cookie
function getUserFromReq(req) {
  const token = req.cookies['mock_auth'];
  if (!token) return null;
  const email = SESSIONS[token];
  if (!email) return null;
  return USERS[email] ? { ...USERS[email] } : null;
}

// Mock API: login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  const user = USERS[email];
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  const token = makeToken();
  SESSIONS[token] = email;
  // httpOnly cookie for dev
  res.cookie('mock_auth', token, { httpOnly: true, sameSite: 'Lax' });
  res.json({ ok: true, name: user.name, email: user.email });
});

// Mock API: register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (USERS[email]) return res.status(400).json({ error: 'User exists' });
  const id = 'STI-' + (Date.now() % 1000000);
  USERS[email] = { id, name, email, role: 'BSIT Student', password };
  res.json({ ok: true, id, name, email });
});

// Mock API: profile
app.get('/api/profile', (req, res) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  // Return safe profile (no password)
  const { password, ...safe } = user;
  res.json(safe);
});

// Mock API: logout
app.post('/api/logout', (req, res) => {
  const token = req.cookies['mock_auth'];
  if (token) {
    delete SESSIONS[token];
    res.clearCookie('mock_auth');
  }
  res.json({ ok: true });
});

// Mock API: appointments (create)
let NEXT_APPT_ID = 1000;
const APPOINTMENTS = {};
app.post('/api/appointments', (req, res) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { student_name, teacher_name, date, notes } = req.body || {};
  if (!student_name || !teacher_name || !date) return res.status(400).json({ error: 'Missing fields' });
  const id = String(NEXT_APPT_ID++);
  APPOINTMENTS[id] = { id, student_name, teacher_name, date, notes, status: 'pending' };
  res.json({ id, ok: true });
});

// Mock API: accept appointment
app.post('/api/appointments/:id/accept', (req, res) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const id = req.params.id;
  const appt = APPOINTMENTS[id];
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  appt.status = 'accepted';
  res.json({ ok: true, id });
});

// Fallback: supply index.html for root (static middleware already serves files)

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}/`);
  console.log('Mock API endpoints: /api/profile, /api/login, /api/logout, /api/appointments');
});