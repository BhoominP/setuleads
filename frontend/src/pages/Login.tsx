import { useState, type FormEvent } from 'react';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import logoStacked from '@/assets/Setuleads.svg';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] px-4 select-none">
      <div className="inspected-panel bg-[#101010] border border-[#222222] p-8 w-full max-w-sm shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <img src={logoStacked} alt="SetuLeads" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,74,0,0.3)]" />
          <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-[#FF4A00]/40 text-[#FF4A00] bg-[#FF4A00]/10 tracking-widest font-bold">
            INTELLIGENCE ENGINE WORKSTATION
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-rust">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}