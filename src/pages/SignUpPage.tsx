import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { PasswordField } from '../components/common/PasswordField';
import { Button } from '../components/common/Button';
import { BrandSymbol } from '../components/common/BrandSymbol';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your work email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        acceptTerms
      });
      addToast('success', 'Account Created', 'Welcome to RecruitAI! Your workspace has been initialized.');
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
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

      {/* Main Registration Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#E3E8F0] shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#202638] tracking-tight">Create your RecruitAI account</h2>
            <p className="text-xs text-[#697386] mt-1">
              Set up your workspace to manage recruitment.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#C94353]/10 border border-[#C94353]/20 text-xs text-[#C94353] font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Sarah Jenkins"
              icon={<User className="w-4 h-4" />}
              required
              autoComplete="name"
            />

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
              label="Password (min. 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="new-password"
            />

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#E3E8F0] text-[#3978F6] focus:ring-[#3978F6]/20 cursor-pointer"
                />
                <span className="text-xs text-[#697386] leading-relaxed">
                  I agree to the <span className="text-[#3978F6] font-medium">Terms of Service</span> and acknowledge the <span className="text-[#3978F6] font-medium">Privacy Policy</span>.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-xs text-[#697386]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#3978F6] hover:text-[#2865DF] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
