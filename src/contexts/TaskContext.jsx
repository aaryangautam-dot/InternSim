import { createContext, useContext, useState, useEffect } from 'react';
import { TASKS } from '../data/tasks';

const TaskContext = createContext();

const initializeTaskStates = () => {
  const saved = localStorage.getItem('internsim-tasks');
  if (saved) return JSON.parse(saved);

  const states = {};
  TASKS.forEach((task, index) => {
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
  const [taskStates, setTaskStates] = useState(initializeTaskStates);

  useEffect(() => {
    localStorage.setItem('internsim-tasks', JSON.stringify(taskStates));
  }, [taskStates]);

  const getTaskState = (taskId) => taskStates[taskId] || {};

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
    const timeTaken = Math.round((Date.now() - startedAt.getTime()) / 1000 / 60); // minutes

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

      // Unlock next task if passed
      if (passed) {
        const currentIndex = TASKS.findIndex(t => t.id === taskId);
        if (currentIndex < TASKS.length - 1) {
          const nextId = TASKS[currentIndex + 1].id;
          if (updated[nextId]?.status === 'locked') {
            updated[nextId] = { ...updated[nextId], status: 'available' };
          }
        }
      }

      return updated;
    });

    return { passed, xpEarned, isLate, timeTaken };
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
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);
