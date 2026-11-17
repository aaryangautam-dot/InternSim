import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const UserContext = createContext();

const RANKS = [
  { name: 'Intern', minXp: 0 },
  { name: 'Junior Developer', minXp: 500 },
  { name: 'Developer', minXp: 1500 },
];

function calculateRank(xp) {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (xp >= r.minXp) rank = r.name;
  }
  return rank;
}

export function UserProvider({ children }) {
  const [session, setSession] = useState(() => authService.getCurrentSession());
  const user = session?.user || null;

  useEffect(() => {
    const handleStorage = () => {
      setSession(authService.getCurrentSession());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (identity, password) => {
    const newSession = await authService.login({ identity, password });
    setSession(newSession);
    return newSession.user;
  };

  const register = async (formData) => {
    const newSession = await authService.register(formData);
    setSession(newSession);
    return newSession.user;
  };

  const logout = () => {
    authService.logout();
    setSession(null);
  };

  const updateUser = async (updates) => {
    if (!user) return;
    const nextUser = { ...user, ...updates };
    if (typeof nextUser.xp === 'number') {
      nextUser.rank = calculateRank(nextUser.xp);
    }
    const updated = await authService.updateProfile(nextUser);
    setSession(prev => prev ? { ...prev, user: updated } : null);
  };

  const addXp = (amount) => {
    if (!user) return;
    updateUser({ xp: (user.xp || 0) + amount });
  };

  const addWarning = () => {
    if (!user) return;
    const newWarnings = (user.warnings || 0) + 1;
    const terminated = newWarnings >= 3;
    updateUser({ warnings: newWarnings, terminated });
  };

  const switchCompany = (companyId) => {
    updateUser({ currentCompanyId: companyId });
  };

  const unlockCompany = (companyId) => {
    if (!user) return;
    const current = user.unlockedCompanies || ['novatech'];
    if (!current.includes(companyId)) {
      updateUser({ unlockedCompanies: [...current, companyId] });
    }
  };

  const signOfferLetter = (companyId) => {
    if (!user) return;
    const unlocked = (user.unlockedCompanies || ['novatech']).includes(companyId)
      ? user.unlockedCompanies
      : [...(user.unlockedCompanies || ['novatech']), companyId];

    const signed = (user.signedOfferLetters || ['novatech']).includes(companyId)
      ? user.signedOfferLetters
      : [...(user.signedOfferLetters || ['novatech']), companyId];

    updateUser({
      currentCompanyId: companyId,
      unlockedCompanies: unlocked,
      signedOfferLetters: signed,
    });
  };

  const recordActivity = () => {
    if (!user) return;
    const today = new Date().toDateString();
    const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = lastDate === yesterday.toDateString();
      updateUser({
        lastActiveDate: new Date().toISOString(),
        streak: isConsecutive ? (user.streak || 0) + 1 : 1,
      });
    }
  };

  const resetProgress = () => {
    if (user) {
      updateUser({
        xp: 0,
        warnings: 0,
        terminated: false,
        totalTasksCompleted: 0,
        totalTimeTaken: 0,
        currentCompanyId: 'novatech',
        unlockedCompanies: ['novatech'],
        signedOfferLetters: ['novatech'],
      });
      localStorage.removeItem('internsim-tasks');
      localStorage.removeItem('internsim-chat');
    }
  };

  const markBriefingSeen = () => {
    updateUser({ hasSeenBriefing: true });
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: !!user,
      token: session?.token,
      login,
      register,
      logout,
      updateUser,
      addXp,
      addWarning,
      switchCompany,
      unlockCompany,
      signOfferLetter,
      recordActivity,
      resetProgress,
      markBriefingSeen,
      RANKS,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
