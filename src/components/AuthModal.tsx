import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, KeyRound, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { LanguageCode, t } from '../i18n';
import { WieszkaLogo } from './WieszkaLogo';
import { loginCloudAccount, registerCloudAccount, resetCloudAccountPassword, clearAllCloudAccounts, checkCloudAccountExists } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentLang?: LanguageCode;
  onLoginSuccess: (profile: UserProfile, rememberMe: boolean) => void;
  onShowNotification: (msg: string) => void;
  customLogoUrl?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentLang = 'en',
  onLoginSuccess,
  onShowNotification,
  customLogoUrl = null,
}) => {
  // Login modal is ALWAYS forced to English per user explicit instructions
  const lang: LanguageCode = 'en';
  const getAuthText = (pl: string, en: string) => en;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [step, setStep] = useState<'form' | 'verify' | 'reset_password'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.toLowerCase().trim();
    if (!targetEmail) {
      setError(getAuthText('Podaj adres e-mail.', 'Please provide email address.'));
      return;
    }

    if (mode === 'forgot_password') {
      setIsSubmitting(true);
      setError('');
      const exists = await checkCloudAccountExists(targetEmail);
      setIsSubmitting(false);
      if (!exists) {
        setError(getAuthText('Konto z tym adresem e-mail nie istnieje w bazie.', 'No account found with this email address.'));
        return;
      }
    } else {
      if (!password.trim()) {
        setError(getAuthText('Wypełnij wszystkie wymagane pola.', 'Please fill in all required fields.'));
        return;
      }

      if (password.length < 7) {
        setError(getAuthText('Hasło musi mieć co najmniej 7 znaków.', 'Password must be at least 7 characters.'));
        return;
      }

      if (!/\d/.test(password)) {
        setError(getAuthText('Hasło musi zawierać co najmniej jedną cyfrę.', 'Password must contain at least one digit.'));
        return;
      }

      if (mode === 'register' && !name.trim()) {
        setError(getAuthText('Podaj swoje imię lub nazwę użytkownika.', 'Please provide your name or username.'));
        return;
      }

      // Check account existence / credentials in Cloud DB
      setIsSubmitting(true);
      setError('');

      if (mode === 'login') {
        const cloudRes = await loginCloudAccount(targetEmail, password);
        setIsSubmitting(false);
        if (!cloudRes.success) {
          setError(cloudRes.message || getAuthText('Nieprawidłowy e-mail lub hasło.', 'Invalid email or password.'));
          return;
        }
        if (cloudRes.user && cloudRes.user.name) {
          setName(cloudRes.user.name);
        }
      } else if (mode === 'register') {
        const exists = await checkCloudAccountExists(targetEmail);
        setIsSubmitting(false);
        if (exists) {
          setError(getAuthText('Konto na ten adres e-mail już istnieje! Zaloguj się lub zresetuj hasło.', 'An account with this email address already exists! Please log in.'));
          return;
        }
      }
    }

    setError('');
    // Generate 6-digit random verification code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setStep('verify');
    setVerificationCode(''); // Empty input field so user must enter code manually

    // Trigger backend send-code endpoint
    try {
      await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code: newCode }),
      });
    } catch (err) {
      console.warn('Backend send code dispatch:', err);
    }

    if (mode === 'forgot_password') {
      onShowNotification(
        getAuthText(
          `Wysłano 6-cyfrowy kod resetowania hasła na e-mail: ${targetEmail}`,
          `Sent 6-digit password reset code to email: ${targetEmail}`
        )
      );
    } else {
      onShowNotification(
        getAuthText(
          `Wysłano kod weryfikacyjny na e-mail: ${targetEmail}`,
          `Verification code sent to email: ${targetEmail}`
        )
      );
    }
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError(getAuthText('Proszę wprowadzić 6-cyfrowy kod weryfikacyjny.', 'Please enter the 6-digit verification code.'));
      return;
    }

    if (verificationCode.trim() !== generatedCode) {
      setError(getAuthText('Nieprawidłowy kod weryfikacyjny. Sprawdź e-mail i spróbuj ponownie.', 'Invalid verification code. Please check your email and try again.'));
      return;
    }

    setError('');

    if (mode === 'forgot_password') {
      setStep('reset_password');
      onShowNotification(
        getAuthText(
          'Kod weryfikacyjny poprawny! Ustaw nowe hasło.',
          'Verification code confirmed! Set new password.'
        )
      );
      return;
    }

    const userEmail = email.toLowerCase().trim();
    const userName = name.trim() || userEmail.split('@')[0];

    if (mode === 'register') {
      setIsSubmitting(true);
      const regRes = await registerCloudAccount(userEmail, userName, password);
      setIsSubmitting(false);
      if (!regRes.success) {
        setError(regRes.message || getAuthText('Konto na ten adres e-mail już istnieje.', 'An account with this email address already exists.'));
        return;
      }
    }

    onLoginSuccess({
      isLoggedIn: true,
      email: userEmail,
      name: userName,
    }, rememberMe);

    if (mode === 'login') {
      onShowNotification(
        getAuthText(
          `Weryfikacja udana! Witaj z powrotem, ${userName}!`,
          `Verification successful! Welcome back, ${userName}!`
        )
      );
    } else {
      onShowNotification(
        getAuthText(
          `Konto i e-mail ${userEmail} zweryfikowane pomyślnie w chmurze!`,
          `Account and email ${userEmail} verified successfully in cloud!`
        )
      );
    }

    // Reset state & close
    setStep('form');
    onClose();
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError(getAuthText('Wypełnij oba pola z hasłem.', 'Please fill both password fields.'));
      return;
    }

    if (newPassword.length < 7) {
      setError(getAuthText('Nowe hasło musi mieć co najmniej 7 znaków.', 'New password must be at least 7 characters.'));
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError(getAuthText('Nowe hasło musi zawierać co najmniej jedną cyfrę.', 'New password must contain at least one digit.'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(getAuthText('Wprowadzone hasła nie są identyczne!', 'Passwords do not match!'));
      return;
    }

    setError('');
    const userEmail = email.toLowerCase().trim();
    const userName = name.trim() || userEmail.split('@')[0];

    setPassword(newPassword);
    await resetCloudAccountPassword(userEmail, newPassword);

    onLoginSuccess({
      isLoggedIn: true,
      email: userEmail,
      name: userName,
    }, rememberMe);

    onShowNotification(
      getAuthText(
        `Hasło zostało pomyślnie zmienione w chmurze! Zalogowano jako ${userEmail}.`,
        `Password changed in cloud! Signed in as ${userEmail}.`
      )
    );

    setStep('form');
    setMode('login');
    onClose();
  };

  const handleResendCode = async () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setVerificationCode('');
    setError('');
    const targetEmail = email.toLowerCase().trim();

    try {
      await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code: newCode }),
      });
    } catch (err) {
      console.warn('Backend send code dispatch:', err);
    }

    onShowNotification(
      getAuthText(
        `Wysłano nowy kod weryfikacyjny na e-mail: ${targetEmail}`,
        `Sent new verification code to email: ${targetEmail}`
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121217] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#1A1A21] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            {step === 'verify' ? (
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <KeyRound className="w-7 h-7 animate-bounce text-indigo-400" />
              </div>
            ) : step === 'reset_password' ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Lock className="w-7 h-7 animate-pulse text-emerald-400" />
              </div>
            ) : (
              <WieszkaLogo className="w-16 h-16" customLogoUrl={customLogoUrl} showGlow={true} />
            )}
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {step === 'verify'
              ? (mode === 'forgot_password' ? getAuthText('Weryfikacja Kodu Resetowania', 'Reset Code Verification') : t(lang, 'authVerifyTitle'))
              : step === 'reset_password'
              ? getAuthText('Ustaw Nowe Hasło', 'Set New Password')
              : mode === 'forgot_password'
              ? getAuthText('Resetowanie Hasła', 'Password Reset')
              : t(lang, 'authTitle')}
          </h3>
          <p className="text-xs text-slate-400">
            {step === 'verify'
              ? `${getAuthText('Wysłaliśmy 6-cyfrowy kod weryfikacyjny na adres:', 'Verification code sent to:')} ${email}`
              : step === 'reset_password'
              ? `${getAuthText('Wprowadź nowe, bezpieczne hasło dla konta:', 'Enter a new secure password for:')} ${email}`
              : mode === 'forgot_password'
              ? getAuthText('Podaj swój adres e-mail. Wyślemy Ci 6-cyfrowy kod do zresetowania hasła.', 'Enter your email address to receive a 6-digit password reset code.')
              : t(lang, 'authSubtitle')}
          </p>
        </div>

        {/* Mode Switcher (Form step only) */}
        {step === 'form' && (
          <div className="flex bg-[#1A1A21] p-1 rounded-2xl border border-slate-800 font-medium text-xs">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t(lang, 'authLoginMode')}
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t(lang, 'authRegisterMode')}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleSendCode} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">{t(lang, 'authNameLabel')}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">{t(lang, 'authEmailLabel')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.smith@example.com"
                  className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold block">{t(lang, 'authPasswordLabel')}</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot_password'); setError(''); }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {t(lang, 'authPassReq')}
                </p>
              </div>
            )}

            {mode === 'forgot_password' && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition underline"
                >
                  ← Back to login
                </button>
              </div>
            )}

            {mode !== 'forgot_password' && (
              <div className="flex items-center space-x-2.5 pt-1 pb-1 px-1 bg-[#1A1A21] p-2.5 rounded-xl border border-slate-800/80">
                <input
                  type="checkbox"
                  id="rememberMeCheckbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-[#121217] text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                />
                <label
                  htmlFor="rememberMeCheckbox"
                  className="text-xs text-slate-200 font-semibold cursor-pointer select-none flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Keep me logged in on page refresh</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-900/40 flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Checking cloud data...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? t(lang, 'authSendCodeLogin')
                      : mode === 'register'
                      ? t(lang, 'authSendCodeRegister')
                      : 'Send 6-digit reset code'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>
        ) : step === 'verify' ? (
          <form onSubmit={handleVerifyAndSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">{t(lang, 'authEnterCode')}</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white tracking-widest text-lg font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={() => { setStep('form'); setError(''); }}
                className="text-slate-400 hover:text-white transition underline"
              >
                {t(lang, 'authChangeEmail')}
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3 text-indigo-400" />
                <span>{t(lang, 'authResendCode')}</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-900/40 flex items-center justify-center space-x-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-200" />
              <span>
                {mode === 'forgot_password'
                  ? 'Verify Code & Proceed to Reset Password'
                  : t(lang, 'authConfirmAndLogin')}
              </span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSaveNewPassword} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">New Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Confirm New Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#1A1A21] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {t(lang, 'authPassReq')}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Save New Password & Sign In</span>
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-800/80 text-center text-[11px] text-slate-500 font-mono">
          <span>{t(lang, 'authFooter')}</span>
        </div>
      </div>
    </div>
  );
};
