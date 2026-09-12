import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-muted-foreground font-mono text-xs tracking-wider">
        SETULEADS // INITIALIZING SECURE SESSION…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;