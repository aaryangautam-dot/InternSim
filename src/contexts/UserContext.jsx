import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

const DEFAULT_USER = {
  name: '',
  role: '',
  skillLevel: '',
  rank: 'Intern',
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  joinDate: null,
  warnings: 0,
  terminated: false,
  onboarded: false,
  hasSeenBriefing: false,
  totalTasksCompleted: 0,
  totalTimeTaken: 0,
  averageRating: 0,
};

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

function calculateStreak(lastActiveDate) {
  if (!lastActiveDate) return 0;
  const last = new Date(lastActiveDate);
  const today = new Date();
  const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return -1; // -1 = keep current streak
  return 0; // reset
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('internsim-user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const streakResult = calculateStreak(parsed.lastActiveDate);
      if (streakResult === 0) parsed.streak = 0;
      return parsed;
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    localStorage.setItem('internsim-user', JSON.stringify(user));
  }, [user]);

  const updateUser = (updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      next.rank = calculateRank(next.xp);
      return next;
    });
  };

  const completeOnboarding = (name, role, skillLevel) => {
    updateUser({
      name,
      role,
      skillLevel,
      onboarded: true,
      joinDate: new Date().toISOString(),
      lastActiveDate: new Date().toISOString(),
      streak: 1,
    });
  };

  const addXp = (amount) => {
    updateUser({ xp: user.xp + amount });
  };

  const addWarning = () => {
    const newWarnings = user.warnings + 1;
    const terminated = newWarnings >= 3;
    updateUser({ warnings: newWarnings, terminated });
  };

  const recordActivity = () => {
    const today = new Date().toDateString();
    const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = lastDate === yesterday.toDateString();
      updateUser({
        lastActiveDate: new Date().toISOString(),
        streak: isConsecutive ? user.streak + 1 : 1,
      });
    }
  };

  const resetProgress = () => {
    setUser(DEFAULT_USER);
    localStorage.removeItem('internsim-user');
    localStorage.removeItem('internsim-tasks');
    localStorage.removeItem('internsim-chat');
  };

  const markBriefingSeen = () => {
    updateUser({ hasSeenBriefing: true });
  };

  return (
    <UserContext.Provider value={{
      user,
      updateUser,
      completeOnboarding,
      addXp,
      addWarning,
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
