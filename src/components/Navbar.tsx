import React, { useState } from 'react';
import { Search, PackagePlus, Bell, Shield, LogOut, User, Check, ChevronRight } from 'lucide-react';
import { UserProfile, NotificationRecord } from '../types/models';

export type ActiveView =
  | 'home'
  | 'report-lost'
  | 'report-found'
  | 'dashboard'
  | 'admin'
  | 'match-review';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  user: UserProfile | null;
  isAdmin: boolean;
  notifications: NotificationRecord[];
  onSignIn: () => void;
  onSignOut: () => void;
  onMarkNotificationRead: (notif: NotificationRecord) => void;
  onOpenProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  user,
  isAdmin,
  notifications,
  onSignIn,
  onSignOut,
  onMarkNotificationRead,
  onOpenProfileModal,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="text-xl font-bold tracking-tight text-[#0F172A] hover:text-[#1E3A8A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          ESI Lost &amp; Found
        </button>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'home'
                ? 'text-[#1E3A8A] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onNavigate('report-lost')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'report-lost'
                ? 'text-[#1E3A8A] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => onNavigate('report-found')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'report-found'
                ? 'text-[#1E3A8A] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            I Found Something
          </button>
          {user && (
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'dashboard'
                  ? 'text-[#1E3A8A] font-semibold underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              Student Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeView === 'admin'
                  ? 'text-[#1E3A8A] font-semibold underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              Office Console
            </button>
          )}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1E3A8A] text-white text-[10px] font-mono-tabular font-semibold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">
                        Campus Notifications
                      </span>
                      <span className="text-xs text-slate-500 font-mono-tabular">
                        {unreadCount} unread
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No match notifications yet. We will alert you when a matching object arrives at the office.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-left transition-colors ${
                              n.read ? 'bg-white' : 'bg-blue-50/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                              {!n.read && (
                                <button
                                  type="button"
                                  onClick={() => onMarkNotificationRead(n)}
                                  className="text-[11px] text-[#1E3A8A] hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" /> Read
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {n.message}
                            </p>
                            {n.relatedReportId && (
                              <button
                                type="button"
                                onClick={() => {
                                  onMarkNotificationRead(n);
                                  setNotifOpen(false);
                                  onNavigate('dashboard');
                                }}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                              >
                                Review Match <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </button>

              <button
                type="button"
                onClick={onSignOut}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors whitespace-nowrap cursor-pointer"
            >
              Sign in with ESI Google
            </button>
          )}
        </div>
      </div>

      {/* Mobile bottom quick navigation */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`px-2 py-1 rounded ${
            activeView === 'home' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => onNavigate('report-lost')}
          className={`px-2 py-1 rounded flex items-center gap-1 ${
            activeView === 'report-lost' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          <Search className="w-3.5 h-3.5" /> Lost
        </button>
        <button
          type="button"
          onClick={() => onNavigate('report-found')}
          className={`px-2 py-1 rounded flex items-center gap-1 ${
            activeView === 'report-found' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          <PackagePlus className="w-3.5 h-3.5" /> Found
        </button>
        {user && (
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`px-2 py-1 rounded ${
              activeView === 'dashboard' ? 'text-[#1E3A8A] font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
        )}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`px-2 py-1 rounded flex items-center gap-1 ${
              activeView === 'admin' ? 'text-[#1E3A8A] font-semibold' : ''
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Office
          </button>
        )}
      </div>
    </header>
  );
};
