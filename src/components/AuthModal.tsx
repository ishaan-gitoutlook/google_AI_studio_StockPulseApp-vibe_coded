import React, { useState } from 'react';
import {
  LogIn,
  LogOut,
  User,
  Bookmark,
  FileText,
  Shield,
  Sparkles,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeConfig } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentTheme }) => {
  const { user, userProfile, signInWithGoogle, signOut, notes, deleteResearchNote } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'watchlist' | 'notes'>('profile');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
          color: currentTheme.textPrimary,
        }}
      >
        {/* Header */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: currentTheme.cardBorder }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Firebase Authentication & Cloud Storage</h3>
              <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                Google Sign-In & Firestore Persistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg border hover:bg-white/10 transition-colors"
            style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textMuted }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!user ? (
            /* Signed Out State */
            <div className="text-center py-6 space-y-4">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${currentTheme.accent}15`, color: currentTheme.accent }}
              >
                <User className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold">Sign In with Google</h4>
                <p className="text-xs max-w-sm mx-auto" style={{ color: currentTheme.textMuted }}>
                  Connect your Google account to automatically sync your custom watchlists, stock price targets, and research valuation notes across sessions.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs text-left">
                  {authError}
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:scale-102 disabled:opacity-50 text-white"
                style={{ backgroundColor: currentTheme.accent }}
              >
                <LogIn className="w-4 h-4" />
                <span>{isSigningIn ? 'Connecting to Google...' : 'Sign In with Google'}</span>
              </button>

              <div className="text-[11px] font-mono text-emerald-400 pt-2 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Secured by Firebase Auth & Firestore Rules</span>
              </div>
            </div>
          ) : (
            /* Signed In State */
            <div className="space-y-4">
              {/* User Identity Card */}
              <div
                className="p-4 rounded-xl border flex items-center justify-between gap-3"
                style={{ backgroundColor: `${currentTheme.bg}80`, borderColor: currentTheme.cardBorder }}
              >
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full border border-white/20"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: currentTheme.accent, color: '#ffffff' }}
                    >
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <span>{user.displayName || 'StockPulse Trader'}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
                        VERIFIED
                      </span>
                    </div>
                    <div className="text-xs font-mono" style={{ color: currentTheme.textMuted }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex border-b text-xs font-semibold" style={{ borderColor: currentTheme.cardBorder }}>
                <button
                  onClick={() => setActiveSubTab('profile')}
                  className={`pb-2 px-3 transition-colors ${
                    activeSubTab === 'profile'
                      ? 'border-b-2 font-bold'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: activeSubTab === 'profile' ? currentTheme.accent : 'transparent',
                    color: activeSubTab === 'profile' ? currentTheme.accent : currentTheme.textPrimary,
                  }}
                >
                  Cloud Profile
                </button>
                <button
                  onClick={() => setActiveSubTab('watchlist')}
                  className={`pb-2 px-3 transition-colors ${
                    activeSubTab === 'watchlist'
                      ? 'border-b-2 font-bold'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: activeSubTab === 'watchlist' ? currentTheme.accent : 'transparent',
                    color: activeSubTab === 'watchlist' ? currentTheme.accent : currentTheme.textPrimary,
                  }}
                >
                  Cloud Watchlist ({userProfile?.watchlist?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSubTab('notes')}
                  className={`pb-2 px-3 transition-colors ${
                    activeSubTab === 'notes'
                      ? 'border-b-2 font-bold'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: activeSubTab === 'notes' ? currentTheme.accent : 'transparent',
                    color: activeSubTab === 'notes' ? currentTheme.accent : currentTheme.textPrimary,
                  }}
                >
                  Saved Theses ({notes.length})
                </button>
              </div>

              {/* Sub-tab Views */}
              {activeSubTab === 'profile' && (
                <div className="space-y-2 text-xs">
                  <div
                    className="p-3 rounded-xl border space-y-1 font-mono"
                    style={{ backgroundColor: `${currentTheme.bg}50`, borderColor: currentTheme.cardBorder }}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.textMuted }}>User UID:</span>
                      <span className="text-sky-400 truncate max-w-[200px]">{user.uid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.textMuted }}>Favorite Universe:</span>
                      <span className="text-white uppercase">{userProfile?.favoriteUniverse || 'global-megacaps'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.textMuted }}>Firestore DB:</span>
                      <span className="text-emerald-400">ai-studio-stockpulse</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'watchlist' && (
                <div className="space-y-2">
                  <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                    Persisted in Firestore collection <code className="font-mono text-sky-400">users/{user.uid}</code>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {userProfile?.watchlist && userProfile.watchlist.length > 0 ? (
                      userProfile.watchlist.map((sym) => (
                        <div
                          key={sym}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold"
                          style={{
                            backgroundColor: `${currentTheme.accent}15`,
                            borderColor: `${currentTheme.accent}40`,
                            color: currentTheme.accent,
                          }}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{sym}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs italic" style={{ color: currentTheme.textMuted }}>
                        No tickers in watchlist yet. Star any stock on the Market Tracker to persist it!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSubTab === 'notes' && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notes.length === 0 ? (
                    <div className="text-xs italic text-center py-4" style={{ color: currentTheme.textMuted }}>
                      No valuation theses saved yet. Use the Fundamentals tab to save notes directly to Firestore!
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-xl border flex items-start justify-between gap-3 text-xs"
                        style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sky-400">{note.symbol}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                              {note.rating || 'BUY'}
                            </span>
                            {note.targetPrice && (
                              <span className="font-mono text-[10px]" style={{ color: currentTheme.textMuted }}>
                                Target: ${note.targetPrice}
                              </span>
                            )}
                          </div>
                          <p className="mt-1" style={{ color: currentTheme.textPrimary }}>
                            {note.noteText}
                          </p>
                          <span className="text-[10px] font-mono opacity-60 mt-1 block">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteResearchNote(note.id)}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex justify-end"
          style={{ borderColor: currentTheme.cardBorder }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold border hover:bg-white/10 transition-colors"
            style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textPrimary }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
