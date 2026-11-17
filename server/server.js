/**
 * NovaTech Engineering OS — SaaS Backend Server
 * Run via: node server/server.js
 */

const http = require('http');

const PORT = process.env.PORT || 5000;

// Simple in-memory user repository for standalone SaaS server
const usersDb = [
  {
    id: 'usr_demo_1',
    name: 'Alex Rivera',
    username: 'arivera',
    email: 'intern@novatech.io',
    passwordHash: 'password123',
    role: 'frontend',
    rank: 'Intern',
    xp: 150,
    currentCompanyId: 'novatech',
    unlockedCompanies: ['novatech'],
    signedOfferLetters: ['novatech'],
  }
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check
  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'healthy', version: '2.0.0-saas' });
  }

  // Auth: Login
  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { identity, password } = JSON.parse(body);
        const clean = (identity || '').toLowerCase().trim();
        const user = usersDb.find(u => u.email === clean || u.username === clean);
        if (!user || user.passwordHash !== password) {
          return sendJson(res, 401, { error: 'Invalid credentials' });
        }
        const token = 'jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        return sendJson(res, 200, { token, user });
      } catch (e) {
        return sendJson(res, 400, { error: 'Malformed request' });
      }
    });
    return;
  }

  // Auth: Register
  if (url.pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name, username, email, password, role } = JSON.parse(body);
        const cleanEmail = (email || '').toLowerCase().trim();
        const cleanUser = (username || '').toLowerCase().trim();

        if (usersDb.some(u => u.email === cleanEmail || u.username === cleanUser)) {
          return sendJson(res, 409, { error: 'User already exists' });
        }

        const newUser = {
          id: 'usr_' + Date.now().toString(36),
          name: name.trim(),
          username: cleanUser,
          email: cleanEmail,
          passwordHash: password,
          role: role || 'frontend',
          rank: 'Intern',
          xp: 0,
          currentCompanyId: 'novatech',
          unlockedCompanies: ['novatech'],
          signedOfferLetters: ['novatech'],
        };
        usersDb.push(newUser);

        const token = 'jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        return sendJson(res, 201, { token, user: newUser });
      } catch (e) {
        return sendJson(res, 400, { error: 'Malformed request' });
      }
    });
    return;
  }

  sendJson(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`NovaTech SaaS Backend listening on http://localhost:${PORT}`);
});
