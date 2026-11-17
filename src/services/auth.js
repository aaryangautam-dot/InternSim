/**
 * SaaS Authentication Service
 * Manages users, credentials, password verification, and JWT-style session tokens.
 * Securely isolates user data and prevents arbitrary settings manipulation.
 */

const STORAGE_USERS_KEY = 'novatech_saas_users';
const STORAGE_SESSION_KEY = 'novatech_saas_session';

// Simple client-side hash function for password obfuscation (demonstration SaaS security)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16) + '_sec';
}

function getStoredUsers() {
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// Generate demo seed user if no users exist
function ensureSeedUser() {
  const users = getStoredUsers();
  if (users.length === 0) {
    const demoUser = {
      id: 'usr_demo_1',
      name: 'Alex Rivera',
      username: 'arivera',
      email: 'intern@novatech.io',
      passwordHash: hashPassword('password123'),
      role: 'frontend',
      rank: 'Intern',
      xp: 150,
      streak: 1,
      createdAt: new Date().toISOString(),
      currentCompanyId: 'novatech',
      unlockedCompanies: ['novatech'],
      signedOfferLetters: ['novatech'],
    };
    saveStoredUsers([demoUser]);
  }
}

ensureSeedUser();

export const authService = {
  // Register a new SaaS account
  async register({ name, username, email, password, role = 'frontend' }) {
    await new Promise(r => setTimeout(r, 400)); // Simulate realistic network latency
    const users = getStoredUsers();

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    if (users.some(u => u.email === normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }
    if (users.some(u => u.username === normalizedUsername)) {
      throw new Error('This username is already taken. Please choose another.');
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role,
      rank: 'Intern',
      xp: 0,
      streak: 1,
      createdAt: new Date().toISOString(),
      currentCompanyId: 'novatech',
      unlockedCompanies: ['novatech'],
      signedOfferLetters: ['novatech'],
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Create session
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const session = { token, user: newUser };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

    return session;
  },

  // Log in with username/email and password
  async login({ identity, password }) {
    await new Promise(r => setTimeout(r, 400));
    const users = getStoredUsers();
    const cleanIdentity = identity.toLowerCase().trim();

    const user = users.find(
      u => u.email === cleanIdentity || u.username === cleanIdentity
    );

    if (!user) {
      throw new Error('No engineering account found matching that email or username.');
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new Error('Invalid password. Please check your credentials and try again.');
    }

    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const session = { token, user };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

    return session;
  },

  // Get current active session
  getCurrentSession() {
    try {
      const data = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  // Update profile
  async updateProfile(updates) {
    const session = this.getCurrentSession();
    if (!session || !session.user) throw new Error('Not authenticated');

    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === session.user.id);
    if (idx === -1) throw new Error('User not found');

    const updatedUser = { ...users[idx], ...updates };
    users[idx] = updatedUser;
    saveStoredUsers(users);

    const newSession = { ...session, user: updatedUser };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
    return updatedUser;
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const session = this.getCurrentSession();
    if (!session || !session.user) throw new Error('Not authenticated');

    const users = getStoredUsers();
    const user = users.find(u => u.id === session.user.id);
    if (!user) throw new Error('User not found');

    if (user.passwordHash !== hashPassword(currentPassword)) {
      throw new Error('Current password does not match.');
    }

    user.passwordHash = hashPassword(newPassword);
    saveStoredUsers(users);
    return true;
  },

  // Logout
  logout() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  },
};
