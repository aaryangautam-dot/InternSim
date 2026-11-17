import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { TASKS as ALL_TASKS } from '../data/tasks';
import { COMPANIES, getCompanyById, getCompanyForTask } from '../data/companies';
import { useUser } from './UserContext';

const TaskContext = createContext();

const initializeTaskStates = (tasks) => {
  const saved = localStorage.getItem('internsim-tasks');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const savedIds = Object.keys(parsed);
      const taskIds = tasks.map(t => t.id);
      if (taskIds.length > 0 && taskIds.every(id => savedIds.includes(id))) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }

  const states = {};
  tasks.forEach((task, index) => {
    states[task.id] = {
      status: index === 0 ? 'available' : 'locked',
      code: task.starterCode,
      submissions: [],
      feedback: null,
      startedAt: null,
      completedAt: null,
      timeTaken: 0,
      numberOfAttempts: 0,
      rating: 0,
      xpEarned: 0,
    };
  });
  return states;
};

export function TaskProvider({ children }) {
  const { user, unlockCompany } = useUser();

  const userRole = user?.role || 'frontend';

  // Filter tasks by user's selected role
  const TASKS = useMemo(() => {
    return ALL_TASKS.filter(t => t.role === userRole);
  }, [userRole]);

  const [prevRole, setPrevRole] = useState(userRole);
  const [taskStates, setTaskStates] = useState(() => initializeTaskStates(TASKS));

  // Adjust state during render when role changes
  if (prevRole !== userRole) {
    setPrevRole(userRole);
    const fresh = initializeTaskStates(TASKS);
    setTaskStates(fresh);
    localStorage.setItem('internsim-tasks', JSON.stringify(fresh));
  }

  useEffect(() => {
    localStorage.setItem('internsim-tasks', JSON.stringify(taskStates));
  }, [taskStates]);

  const getTaskState = (taskId) => taskStates[taskId] || {};

  const checkPromotionEligibility = (companyId, customStates = taskStates) => {
    const company = getCompanyById(companyId);
    if (!company || !company.promotionCriteria?.nextCompanyId) return { eligible: false };

    const targetTaskIds = company.taskIdsByRole[userRole] || [];
    const completedTasks = targetTaskIds.filter(id => customStates[id]?.status === 'completed');

    const totalScore = completedTasks.reduce((sum, id) => sum + (customStates[id]?.rating || 0), 0);
    const avgScore = completedTasks.length > 0 ? (totalScore / completedTasks.length) : 0;
    const hasEnoughTasks = completedTasks.length >= company.promotionCriteria.minTasksCompleted;
    const eligible = hasEnoughTasks && avgScore >= company.promotionCriteria.minAverageScore;

    return {
      eligible,
      completedCount: completedTasks.length,
      totalRequired: company.promotionCriteria.minTasksCompleted,
      avgScore: Math.round(avgScore * 10) / 10,
      minAverageScore: company.promotionCriteria.minAverageScore,
      nextCompanyId: company.promotionCriteria.nextCompanyId,
      nextCompany: getCompanyById(company.promotionCriteria.nextCompanyId),
    };
  };

  const startTask = (taskId) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: 'in-progress',
        startedAt: prev[taskId]?.startedAt || new Date().toISOString(),
      },
    }));
  };

  const updateCode = (taskId, code) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], code },
    }));
  };

  const submitTask = (taskId, code, feedback) => {
    const state = taskStates[taskId];
    const startedAt = state?.startedAt ? new Date(state.startedAt) : new Date();
    const timeTaken = Math.round((Date.now() - startedAt.getTime()) / 1000 / 60);

    const task = TASKS.find(t => t.id === taskId);
    const isLate = task && timeTaken > task.deadlineMinutes;
    const score = feedback?.score || 5;
    const passed = score >= 6 && feedback?.verdict !== 'Needs Revision';

    let xpEarned = 0;
    if (passed) {
      const baseXp = { easy: 100, medium: 200, hard: 350 }[task?.difficulty] || 150;
      xpEarned = isLate ? Math.round(baseXp * 0.6) : baseXp;
      if (score >= 9) xpEarned = Math.round(xpEarned * 1.3);
    }

    const newStatus = passed ? 'completed' : 'needs-revision';
    let unlockedNextCompany = false;
    let nextCompany = null;

    setTaskStates(prev => {
      const updated = {
        ...prev,
        [taskId]: {
          ...prev[taskId],
          status: newStatus,
          code,
          completedAt: new Date().toISOString(),
          timeTaken,
          numberOfAttempts: (prev[taskId]?.numberOfAttempts || 0) + 1,
          feedback,
          rating: score,
          xpEarned,
          isLate,
          submissions: [...(prev[taskId]?.submissions || []), {
            code,
            timestamp: new Date().toISOString(),
            feedback,
          }],
        },
      };

      if (passed) {
        const currentIndex = TASKS.findIndex(t => t.id === taskId);
        if (currentIndex < TASKS.length - 1) {
          const nextId = TASKS[currentIndex + 1].id;
          if (updated[nextId]?.status === 'locked') {
            updated[nextId] = { ...updated[nextId], status: 'available' };
          }
        }

        // Check if completing this task unlocks the next company tier
        const currentCompany = getCompanyForTask(taskId);
        if (currentCompany) {
          const promo = checkPromotionEligibility(currentCompany.id, updated);
          if (promo.eligible) {
            unlockedNextCompany = true;
            nextCompany = promo.nextCompany;
            if (unlockCompany) unlockCompany(promo.nextCompanyId);
          }
        }
      }

      return updated;
    });

    return { passed, xpEarned, isLate, timeTaken, unlockedNextCompany, nextCompany };
  };

  const retryTask = (taskId) => {
    const task = TASKS.find(t => t.id === taskId);
    setTaskStates(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: 'in-progress',
        startedAt: new Date().toISOString(),
        code: task?.starterCode || prev[taskId]?.code,
        feedback: null,
      },
    }));
  };

  const getCompletedCount = () => {
    return Object.values(taskStates).filter(s => s.status === 'completed').length;
  };

  const getFailedCount = () => {
    return Object.values(taskStates).filter(s =>
      s.status === 'needs-revision' && s.numberOfAttempts >= 2
    ).length;
  };

  const getAverageRating = () => {
    const rated = Object.values(taskStates).filter(s => s.rating > 0);
    if (rated.length === 0) return 0;
    return Math.round((rated.reduce((sum, s) => sum + s.rating, 0) / rated.length) * 10) / 10;
  };

  const getActiveTask = () => {
    const activeId = Object.keys(taskStates).find(id => taskStates[id].status === 'in-progress');
    if (activeId) return TASKS.find(t => t.id === activeId);
    return null;
  };

  const resetTasks = () => {
    const fresh = {};
    TASKS.forEach((task, index) => {
      fresh[task.id] = {
        status: index === 0 ? 'available' : 'locked',
        code: task.starterCode,
        submissions: [],
        feedback: null,
        startedAt: null,
        completedAt: null,
        timeTaken: 0,
        numberOfAttempts: 0,
        rating: 0,
        xpEarned: 0,
      };
    });
    setTaskStates(fresh);
  };

  return (
    <TaskContext.Provider value={{
      taskStates,
      getTaskState,
      checkPromotionEligibility,
      startTask,
      updateCode,
      submitTask,
      retryTask,
      getCompletedCount,
      getFailedCount,
      getAverageRating,
      getActiveTask,
      resetTasks,
      TASKS,
      COMPANIES,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);
