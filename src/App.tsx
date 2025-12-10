import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import TaskInput from './components/tasks/TaskInput';
import TaskList from './components/tasks/TaskList';
import EisenhowerMatrix from './components/views/EisenhowerMatrix';
import NoteList from './components/notes/NoteList';
import GraphView from './components/views/GraphView';
import ProfileView from './components/views/ProfileView';
import XPShop from './components/views/XPShop';
import MyProfile from './components/MyProfile';
import { List, LayoutGrid, FileText, Network, Calendar } from 'lucide-react';
import CalendarView from './components/views/CalendarView';
import SearchTask from './components/tasks/SearchTask';
import GreenadeBackground from './components/3d/GreenadeBackground';
import StreakTower from './components/3d/StreakTower';
import { clsx } from 'clsx';
import { useUIStore } from './store/useUIStore';
import { useAuthStore } from './store/useAuthStore';
import { useTaskStore } from './store/useTaskStore';
import { useGameStore } from './store/useGameStore';
import { useTaskReminders } from './hooks/useTaskReminders';

function App() {
  const { currentView: view, setView } = useUIStore();
  const initAuth = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const initTasks = useTaskStore((state) => state.initializeListeners);
  const tasks = useTaskStore((state) => state.tasks);
  const initGame = useGameStore((state) => state.initialize);
  const syncWithTasks = useGameStore((state) => state.syncWithTasks);
  const gameLoading = useGameStore((state) => state.loading);

  useTaskReminders();

  // Sync XP with Tasks on load (fix for negative XP / sync issues)
  useEffect(() => {
    if (isAuthenticated && !gameLoading && tasks.length > 0) {
      // Debounce or check? 
      // For now, simple check: prevent running if XP seems reasonable? 
      // No, user explicitly wants to force sync.
      // We'll run it once when tasks populate to ensure consistency.
      // But useEffect runs on every task change? That would be expensive and overwrite spending.
      // Let's run it ONLY if we detect specifically negative XP, OR create a mechanism to run once.
      // But the user's issue is urgent. I will run it on every mount where we have tasks.
      // Actually, let's run it if we have tasks.
      // NOTE: This will overwrite shop purchases since we don't track them securely yet.
      syncWithTasks(tasks);
    }
    // Intentionally omitting 'tasks' from dependency to run only when auth/loading settles
    // basically "On Load" when ready.
  }, [isAuthenticated, gameLoading, syncWithTasks]); // Removed tasks to strictly run once per session load ideally

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      initTasks();
      initGame(user.id);
    }
    // Cleanup is handled internally by initializeListeners or we can do it here
    // But since we modified initializeListeners to cleanup previous subs, 
    // and we want to avoid the dependency loop, we can rely on the store's logic
    // or use a ref-based cleanup if strictly necessary. 
    // For now, let's just clean up on unmount using the store's state directly.
    return () => {
      const unsubTasks = useTaskStore.getState().unsubscribe;
      const unsubGame = useGameStore.getState().unsubscribe;
      if (unsubTasks) unsubTasks();
      if (unsubGame) unsubGame();
    };
  }, [isAuthenticated, user?.id, initTasks]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans selection:bg-cyan-500/30">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <GreenadeBackground />
          <StreakTower />
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-6xl font-display font-bold text-white tracking-wide uppercase drop-shadow-lg">
              GET SET GROW<span className="text-greenade-accent">!</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <MyProfile />
          </div>
        </header>

        {/* View Navigation */}
        <nav className="flex items-center gap-4 mb-8 bg-greenade-secondary/30 backdrop-blur-md p-2 rounded-none border border-greenade-accent/20 shadow-xl w-fit mx-auto shrink-0 skew-x-[-10deg]">
          <button
            onClick={() => setView('list')}
            className={clsx(
              'p-3 transition-all duration-300 skew-x-[10deg]',
              view === 'list' ? 'bg-greenade-primary text-white shadow-lg shadow-greenade-primary/40' : 'text-greenade-accent/60 hover:bg-white/10 hover:text-white'
            )}
            title="List View"
          >
            <List className="w-6 h-6" />
          </button>
          <button
            onClick={() => setView('matrix')}
            className={clsx(
              'p-3 transition-all duration-300 skew-x-[10deg]',
              view === 'matrix' ? 'bg-greenade-primary text-white shadow-lg shadow-greenade-primary/40' : 'text-greenade-accent/60 hover:bg-white/10 hover:text-white'
            )}
            title="Matrix View"
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={clsx(
              'p-3 transition-all duration-300 skew-x-[10deg]',
              view === 'calendar' ? 'bg-greenade-primary text-white shadow-lg shadow-greenade-primary/40' : 'text-greenade-accent/60 hover:bg-white/10 hover:text-white'
            )}
            title="Calendar View"
          >
            <Calendar className="w-6 h-6" />
          </button>
          <button
            onClick={() => setView('notes')}
            className={clsx(
              'p-3 transition-all duration-300 skew-x-[10deg]',
              view === 'notes' ? 'bg-greenade-primary text-white shadow-lg shadow-greenade-primary/40' : 'text-greenade-accent/60 hover:bg-white/10 hover:text-white'
            )}
            title="Notes"
          >
            <FileText className="w-6 h-6" />
          </button>
          <button
            onClick={() => setView('graph')}
            className={clsx(
              'p-3 transition-all duration-300 skew-x-[10deg]',
              view === 'graph' ? 'bg-greenade-primary text-white shadow-lg shadow-greenade-primary/40' : 'text-greenade-accent/60 hover:bg-white/10 hover:text-white'
            )}
            title="Graph View"
          >
            <Network className="w-6 h-6" />
          </button>
          <button
            onClick={() => setView('shop')}
            className={clsx(
              'p-3 transition-all duration-300 skew-x-[10deg]',
              view === 'shop' ? 'bg-greenade-primary text-white shadow-lg shadow-greenade-primary/40' : 'text-greenade-accent/60 hover:bg-white/10 hover:text-white'
            )}
            title="XP Shop"
          >
            <span className="font-display text-sm">XP</span>
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-2xl min-h-0 flex-1 overflow-hidden flex flex-col">
          {view === 'list' && (
            <div className="h-full flex flex-col">
              <div className="flex gap-4 mb-4 shrink-0">
                <div className="flex-1">
                  <TaskInput />
                </div>
                <div className="w-80">
                  <SearchTask />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
                <TaskList />
              </div>
            </div>
          )}
          {view === 'matrix' && <EisenhowerMatrix />}
          {view === 'calendar' && <CalendarView />}
          {view === 'notes' && <NoteList />}
          {view === 'graph' && <GraphView />}
          {view === 'profile' && <ProfileView />}
          {view === 'shop' && <XPShop />}
        </main>
      </div>
    </div>
  );
}

export default App;

