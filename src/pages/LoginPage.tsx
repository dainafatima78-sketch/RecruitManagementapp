import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { PasswordField } from '../components/common/PasswordField';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { BrandSymbol } from '../components/common/BrandSymbol';
import { api } from '../api/client';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your work email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password, rememberMe });
      addToast('success', 'Welcome Back', 'Successfully signed into your recruitment workspace.');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('recruiter@recruitai.com');
    setPassword('Password123!');
    setError(null);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    try {
      setIsForgotLoading(true);
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotMessage(res.message);
    } catch (err: any) {
      setForgotMessage(err.message || 'Unable to process reset request.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-3">
          <BrandSymbol className="w-14 h-14" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#202638]">
          Recruit<span className="text-[#3978F6]">AI</span>
        </h1>
        <p className="mt-1 text-xs text-[#697386]">Enterprise ATS & Recruitment Intelligence</p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#E3E8F0] shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#202638] tracking-tight">Welcome back</h2>
            <p className="text-xs text-[#697386] mt-1">
              Sign in to continue to your recruitment workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#C94353]/10 border border-[#C94353]/20 text-xs text-[#C94353] font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="sarah.jenkins@company.com"
              icon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <PasswordField
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-[#E3E8F0] text-[#3978F6] focus:ring-[#3978F6]/20 cursor-pointer"
                />
                <span className="text-xs text-[#697386]">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotMessage(null);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs font-semibold text-[#3978F6] hover:text-[#2865DF] transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-5 pt-5 border-t border-[#E3E8F0]">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="w-full py-2 px-3 text-xs font-medium text-[#3978F6] bg-[#EAF1FF] hover:bg-[#d8e5ff] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Use Demo Account (recruiter@recruitai.com)</span>
            </button>
          </div>

          {/* Switch to SignUp */}
          <div className="mt-6 text-center text-xs text-[#697386]">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#3978F6] hover:text-[#2865DF] transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
        subtitle="Enter your registered work email to receive password reset instructions."
        maxWidth="sm"
      >
        {forgotMessage ? (
          <div className="space-y-4">
            <p className="text-xs text-[#17845D] bg-[#17845D]/10 p-3 rounded-lg border border-[#17845D]/20">
              {forgotMessage}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isForgotLoading}
              >
                Send Instructions
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
