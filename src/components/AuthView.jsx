import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, Check, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playClickSound, playCompletionChime } from '../utils/audioEngine';

export default function AuthView({ onOpenLanding }) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, loginAsGuest, isLoading } = useAuth();

  const [mode, setMode] = useState('landing'); // 'landing' | 'email-login' | 'email-signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    try {
      playClickSound();
      await loginWithGoogle();
      playCompletionChime();
    } catch (err) {
      setErrorMsg(err.message || 'Google login failed. Please try again.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      playClickSound();
      await loginWithGoogle();
      playCompletionChime();
    } catch (err) {
      setErrorMsg(err.message || 'Apple login failed.');
    }
  };

  const handleGuestLogin = () => {
    playClickSound();
    loginAsGuest();
    playCompletionChime();
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      playClickSound();
      if (mode === 'email-signup') {
        if (!name.trim()) {
          setErrorMsg('Please enter your name.');
          return;
        }
        await signupWithEmail(name, email, password);
      } else {
        await loginWithEmail(email, password);
      }
      playCompletionChime();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="tiimo-auth-container">
      {/* Background Calm Ambient Gradients */}
      <div className="tiimo-auth-backdrop">
        <div className="bloom-glow-1"></div>
        <div className="bloom-glow-2"></div>
      </div>

      <motion.div 
        className="tiimo-auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Brand Logo & Calm Bloom Icon */}
        <div className="tiimo-auth-header">
          <div className="tiimo-bloom-icon">
            <span className="bloom-petal">✦</span>
          </div>

          <h1 className="tiimo-auth-title">
            Design your day,<br />find your flow
          </h1>

          <p className="tiimo-auth-subtitle">
            A visual daily planner designed for neurodivergent minds, ADHD, and anyone seeking calm, mindful structure.
          </p>
        </div>

        {errorMsg && (
          <motion.div 
            className="tiimo-auth-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'landing' ? (
            <motion.div 
              key="auth-buttons"
              className="tiimo-auth-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Google Button */}
              <button
                type="button"
                className="tiimo-social-btn google-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span className="btn-text">Continue with Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                className="tiimo-social-btn apple-btn"
                onClick={handleAppleLogin}
                disabled={isLoading}
              >
                <svg className="apple-icon" viewBox="0 0 170 170" width="18" height="18" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.78-11.65-14.22-6.53-10.23-11.58-21.78-15.15-34.64-3.57-12.87-5.36-24.83-5.36-35.89 0-14.28 3.57-25.96 10.72-35.03 7.15-9.08 16.27-13.68 27.35-13.82 4.48 0 9.42 1.16 14.81 3.48 5.39 2.32 9.17 3.54 11.34 3.66 1.83-.12 5.76-1.39 11.78-3.81 6.01-2.43 11.05-3.53 15.12-3.32 11.74.57 21.03 4.54 27.87 11.91 6.84 7.37 11.2 16.51 13.08 27.42-10.37 6.25-15.45 15.02-15.24 26.31.21 8.86 3.44 16.29 9.68 22.28 6.24 5.99 13.66 9.53 22.25 10.62-2.31 7.1-5.17 14.15-8.57 21.16zM119.22 33.02c0-7.39 2.66-14.44 7.98-21.15 5.32-6.71 12.01-11.23 20.07-13.56.22 1.45.33 2.82.33 4.12 0 7.42-2.73 14.61-8.2 21.57-5.46 6.96-12.22 11.45-20.28 13.48-.22-1.3-.34-2.79-.34-4.46z" />
                </svg>
                <span className="btn-text">Continue with Apple</span>
              </button>

              <div className="tiimo-divider">
                <span className="divider-line"></span>
                <span className="divider-text">or with email</span>
                <span className="divider-line"></span>
              </div>

              {/* Email Options */}
              <button
                type="button"
                className="tiimo-email-toggle-btn"
                onClick={() => setMode('email-signup')}
              >
                <Mail size={16} />
                <span>Continue with Email</span>
              </button>

              {/* Instant Guest / Demo Bypass */}
              <button
                type="button"
                className="tiimo-guest-btn"
                onClick={handleGuestLogin}
                title="Explore Daily Routine right away"
              >
                <Sparkles size={14} />
                <span>Explore as Guest (Instant Demo)</span>
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key="email-form"
              className="tiimo-email-form"
              onSubmit={handleEmailSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="form-back-row">
                <button
                  type="button"
                  className="form-back-btn"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('landing');
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <span className="form-mode-title">
                  {mode === 'email-signup' ? 'Create Account' : 'Welcome Back'}
                </span>
              </div>

              {mode === 'email-signup' && (
                <div className="input-group">
                  <label htmlFor="name-input">Your Name</label>
                  <div className="input-field-wrapper">
                    <User size={16} className="field-icon" />
                    <input
                      id="name-input"
                      type="text"
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email-input">Email Address</label>
                <div className="input-field-wrapper">
                  <Mail size={16} className="field-icon" />
                  <input
                    id="email-input"
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password-input">Password</label>
                <div className="input-field-wrapper">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="password-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="tiimo-submit-btn"
                disabled={isLoading}
              >
                <span>{mode === 'email-signup' ? 'Create My Account' : 'Log In to Flow'}</span>
                <ArrowRight size={16} />
              </button>

              <div className="form-toggle-switch">
                {mode === 'email-signup' ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="inline-link-btn"
                      onClick={() => {
                        setErrorMsg('');
                        setMode('email-login');
                      }}
                    >
                      Log in
                    </button>
                  </p>
                ) : (
                  <p>
                    New to Tiimo?{' '}
                    <button
                      type="button"
                      className="inline-link-btn"
                      onClick={() => {
                        setErrorMsg('');
                        setMode('email-signup');
                      }}
                    >
                      Sign up free
                    </button>
                  </p>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Subdued Footer Note */}
        <div className="tiimo-auth-footer">
          <p>
            By continuing, you agree to Tiimo's{' '}
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> &{' '}
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
          </p>

          {onOpenLanding && (
            <button
              type="button"
              className="auth-view-website-link"
              onClick={onOpenLanding}
            >
              <span>Explore Marketing Website →</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
