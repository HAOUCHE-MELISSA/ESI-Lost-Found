import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Package,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  LostReport,
  FoundItem,
  MatchRecord,
  ClaimRecord,
  NotificationRecord,
  UserProfile,
} from '../types/models';
import { SafeItemImage } from './SafeItemImage';

interface StudentDashboardProps {
  user: UserProfile;
  lostReports: LostReport[];
  myFoundItems: FoundItem[];
  matches: MatchRecord[];
  claims: ClaimRecord[];
  foundItemsMap: Record<string, FoundItem>;
  notifications: NotificationRecord[];
  onStartLostFlow: () => void;
  onStartFoundFlow: () => void;
  onViewReportMatches: (report: LostReport) => void;
  onRerunMatching: (report: LostReport) => Promise<void>;
}

type DashboardTab = 'lost' | 'matches' | 'found' | 'returned';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  lostReports,
  myFoundItems,
  matches,
  claims,
  foundItemsMap,
  notifications,
  onStartLostFlow,
  onStartFoundFlow,
  onViewReportMatches,
  onRerunMatching,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('lost');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rerunningId, setRerunningId] = useState<string | null>(null);

  const returnedReports = useMemo(
    () => lostReports.filter((r) => r.status === 'RETURNED'),
    [lostReports]
  );

  const filteredLostReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return lostReports;
    return lostReports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.locationLost.toLowerCase().includes(q)
    );
  }, [lostReports, searchQuery]);

  const unreadMatchNotifications = notifications.filter(
    (n) => !n.read && n.type === 'MATCH_FOUND'
  );

  return (
    <div className="max-w-[1360px] mx-auto py-10 px-4 sm:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="text-xs text-slate-500">
            Student Account · {user.email}
          </div>
          <h1 className="text-3xl font-normal text-slate-900 mt-1">
            Welcome back, {user.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStartLostFlow}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> I Lost Something
          </button>
          <button
            type="button"
            onClick={onStartFoundFlow}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Package className="w-4 h-4 text-[#1E3A8A]" /> I Found Something
          </button>
        </div>
      </div>

      {/* Match Notification Banner */}
      {unreadMatchNotifications.length > 0 && (
        <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[#1E3A8A]">
              🎉 We may have found your item!
            </div>
            <p className="text-xs text-slate-700">
              {unreadMatchNotifications[0].message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const related = lostReports.find(
                (r) => r.id === unreadMatchNotifications[0].relatedReportId
              );
              if (related) {
                onViewReportMatches(related);
              } else {
                setActiveTab('matches');
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Review Match
          </button>
        </div>
      )}

      {/* Navigation Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'lost'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Lost Items ({lostReports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Possible Matches ({matches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('found')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'found'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Found Items ({myFoundItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returned')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'returned'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Returned Items ({returnedReports.length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your reports..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A]"
          />
        </div>
      </div>

      {/* TAB 1: MY LOST ITEMS */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          {filteredLostReports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                You haven&apos;t reported any lost items yet
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Lost something on campus? Submit a report and our matching system will search the
                Lost &amp; Found Office database immediately.
              </p>
              <button
                type="button"
                onClick={onStartLostFlow}
                className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer"
              >
                Report a Lost Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLostReports.map((report) => {
                const reportMatches = matches.filter((m) => m.lostReportId === report.id);
                const reportClaims = claims.filter((c) => c.lostReportId === report.id);
                const latestClaim = reportClaims[0];

                return (
                  <div
                    key={report.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {report.category} · {report.color} · {report.brand}
                        </span>
                        <span
                          className={`font-semibold ${
                            report.status === 'RETURNED'
                              ? 'text-[#16A34A]'
                              : reportMatches.length > 0
                              ? 'text-[#1E3A8A]'
                              : 'text-amber-700'
                          }`}
                        >
                          {report.status === 'RETURNED'
                            ? 'Returned to You'
                            : reportMatches.length > 0
                            ? `Possible match found (${reportMatches.length})`
                            : 'Searching'}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {report.description}
                      </p>

                      {report.distinguishingCharacteristics && (
                        <p className="text-xs text-slate-500">
                          Distinctive details: {report.distinguishingCharacteristics}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {report.locationLost}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono-tabular">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {report.dateLost}
                        </span>
                      </div>

                      {latestClaim && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>Claim Status</span>
                            <span
                              className={
                                latestClaim.status === 'APPROVED' ||
                                latestClaim.status === 'RETURNED'
                                  ? 'text-[#16A34A]'
                                  : latestClaim.status === 'REJECTED'
                                  ? 'text-red-600'
                                  : 'text-amber-700'
                              }
                            >
                              {latestClaim.status}
                            </span>
                          </div>
                          {latestClaim.status === 'APPROVED' && (
                            <p className="text-slate-600">
                              Approved! Please visit the ESI Lost &amp; Found Office (Room G-04)
                              with your student ID card to collect your item.
                            </p>
                          )}
                          {latestClaim.adminFeedback && (
                            <p className="text-slate-500">
                              Office Note: {latestClaim.adminFeedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={rerunningId === report.id}
                        onClick={async () => {
                          setRerunningId(report.id);
                          try {
                            await onRerunMatching(report);
                          } finally {
                            setRerunningId(null);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        {rerunningId === report.id ? 'Scanning...' : 'Re-scan Office Inventory'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewReportMatches(report)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer"
                      >
                        View Matches ({reportMatches.length}) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POSSIBLE MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-900">No possible matches yet</p>
              <p className="text-xs text-slate-500">
                Submit a lost report or click &ldquo;Re-scan Office Inventory&rdquo; on an existing
                report.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((m) => {
                const found = foundItemsMap[m.foundItemId];
                const report = lostReports.find((r) => r.id === m.lostReportId);
                if (!found || !report) return null;

                return (
                  <div
                    key={m.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <SafeItemImage
                        src={found.photoUrl}
                        alt={found.title}
                        category={found.category}
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono-tabular">
                          <span className="font-bold text-[#16A34A]">
                            {m.overallScore}% Match
                          </span>
                          <span className="text-slate-500">{m.confidenceLabel}</span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">{found.title}</h3>
                        <p className="text-xs text-slate-500">
                          Matched for your report: &ldquo;{report.title}&rdquo;
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {m.explanationSummary}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onViewReportMatches(report)}
                        className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                      >
                        Inspect &amp; Claim →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY FOUND ITEMS */}
      {activeTab === 'found' && (
        <div className="space-y-4">
          {myFoundItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                You haven&apos;t reported any found items yet
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Found an object on campus? Report it here and hand it over to the ESI Lost &amp;
                Found Office.
              </p>
              <button
                type="button"
                onClick={onStartFoundFlow}
                className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer"
              >
                Report a Found Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myFoundItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                >
                  <SafeItemImage
                    src={item.photoUrl}
                    alt={item.title}
                    category={item.category}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 space-y-2">
                    <div className="text-xs text-slate-500">
                      {item.category} · {item.locationFound} · {item.dateFound}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Custody Status</span>
                      <span className="font-semibold text-[#1E3A8A]">
                        {item.custodyState === 'AT_OFFICE'
                          ? 'In Lost & Found Office'
                          : 'Bring to Office (Room G-04)'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RETURNED ITEMS */}
      {activeTab === 'returned' && (
        <div className="space-y-4">
          {returnedReports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
              <p className="text-sm font-semibold text-slate-900">No returned items yet</p>
              <p className="text-xs text-slate-500">
                Items verified and handed back to you by the Lost &amp; Found Office will appear
                here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {returnedReports.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-emerald-200 rounded-xl p-5 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-[#16A34A]">
                      ✓ Verified &amp; Returned by Lost &amp; Found Office
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{r.title}</h3>
                    <p className="text-xs text-slate-500">
                      {r.category} · {r.locationLost}
                    </p>
                  </div>
                  <Building2 className="w-6 h-6 text-[#16A34A]" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
