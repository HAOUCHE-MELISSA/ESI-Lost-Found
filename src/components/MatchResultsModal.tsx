import React, { useState } from 'react';
import {
  Check,
  ShieldAlert,
  MapPin,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Lock,
} from 'lucide-react';
import { FoundItem, LostReport, MatchRecord } from '../types/models';
import { SafeItemImage } from './SafeItemImage';

interface MatchResultsModalProps {
  lostReport: LostReport;
  matches: MatchRecord[];
  foundItemsMap: Record<string, FoundItem>;
  onBackToDashboard: () => void;
  onSubmitClaim: (params: {
    lostReportId: string;
    foundItemId: string;
    matchId?: string;
    verificationQuestion: string;
    verificationAnswer: string;
    additionalProof: string;
  }) => Promise<void>;
}

export const MatchResultsView: React.FC<MatchResultsModalProps> = ({
  lostReport,
  matches,
  foundItemsMap,
  onBackToDashboard,
  onSubmitClaim,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(
    matches.length > 0 ? matches[0] : null
  );
  const [claimMode, setClaimMode] = useState<boolean>(false);
  const [verificationAnswer, setVerificationAnswer] = useState<string>('');
  const [additionalProof, setAdditionalProof] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [claimSubmitted, setClaimSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;
    if (verificationAnswer.trim().length < 2) {
      setErrorMsg('Please answer the ownership verification question.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    const foundItem = foundItemsMap[selectedMatch.foundItemId];
    const question =
      selectedMatch.verificationPrompt ||
      foundItem?.verificationQuestion ||
      'Please describe a unique identifying mark, engraving, or inside content of this item.';

    try {
      await onSubmitClaim({
        lostReportId: lostReport.id,
        foundItemId: selectedMatch.foundItemId,
        matchId: selectedMatch.id,
        verificationQuestion: question,
        verificationAnswer: verificationAnswer.trim(),
        additionalProof: additionalProof.trim(),
      });
      setClaimSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto py-10 px-4 sm:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Student Dashboard
          </button>
          <h1 className="text-3xl font-normal text-slate-900">
            Possible Matches for &ldquo;{lostReport.title}&rdquo;
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            We found {matches.length} possible {matches.length === 1 ? 'match' : 'matches'} in the
            ESI Lost &amp; Found Office inventory. Final ownership is verified by office staff.
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            No immediate matches in the office yet
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your report is now active (`SEARCHING`). As soon as a matching item is turned in to the
            ESI Lost &amp; Found Office, we will notify you automatically.
          </p>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer"
          >
            Go to My Lost Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Ranked List of Matches */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-semibold text-slate-500">
              Ranked Candidates ({matches.length})
            </div>

            {matches.map((match, idx) => {
              const item = foundItemsMap[match.foundItemId];
              if (!item) return null;
              const isSelected = selectedMatch?.id === match.id;

              return (
                <div
                  key={match.id}
                  onClick={() => {
                    setSelectedMatch(match);
                    setClaimMode(false);
                    setClaimSubmitted(false);
                  }}
                  className={`bg-white rounded-xl border p-5 transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono-tabular font-semibold text-slate-500">
                      MATCH #{idx + 1}
                    </span>
                    <span
                      className={`font-mono-tabular font-bold ${
                        match.overallScore >= 80
                          ? 'text-[#16A34A]'
                          : match.overallScore >= 65
                          ? 'text-[#1E3A8A]'
                          : 'text-amber-700'
                      }`}
                    >
                      {match.overallScore}% — {match.confidenceLabel}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <SafeItemImage
                      src={item.photoUrl}
                      alt={item.title}
                      category={item.category}
                      className="w-20 h-20 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-slate-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Found: {item.locationFound} — {item.dateFound.replace(', 2026', '')}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 pt-0.5">
                        {match.explanationSummary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Status: Stored at Lost &amp; Found Office
                    </span>
                    <span className="text-xs font-semibold text-[#1E3A8A]">
                      View Match →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Match Inspection & Anti-Fraud Claim Verification */}
          <div className="lg:col-span-7">
            {selectedMatch && foundItemsMap[selectedMatch.foundItemId] && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {(() => {
                  const foundItem = foundItemsMap[selectedMatch.foundItemId];
                  const verificationPrompt =
                    selectedMatch.verificationPrompt ||
                    foundItem.verificationQuestion ||
                    'Does the item have any distinctive marks, engravings, or contents inside?';

                  return (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-200">
                        <SafeItemImage
                          src={foundItem.photoUrl}
                          alt={foundItem.title}
                          category={foundItem.category}
                          className="w-full h-64 object-cover"
                        />
                        <div className="p-6 flex flex-col justify-between bg-slate-50/50">
                          <div className="space-y-3">
                            <div className="text-xs font-mono-tabular font-bold text-[#16A34A]">
                              {selectedMatch.overallScore}% Match · {selectedMatch.confidenceLabel}
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-900">
                              {foundItem.title}
                            </h2>
                            <div className="space-y-1.5 text-xs text-slate-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>Found near: {foundItem.locationFound}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Date found: {foundItem.dateFound}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Custody: ESI Lost &amp; Found Office</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-200/80 text-xs text-slate-500">
                            Category: {foundItem.category} · Color: {foundItem.color} · Brand:{' '}
                            {foundItem.brand}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 sm:p-8 space-y-6">
                        {/* Why this may be your item */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Why this may be your item:
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {selectedMatch.explanationSummary}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {selectedMatch.reasons.map((reason, rIdx) => (
                              <div
                                key={rIdx}
                                className="flex items-start gap-2 text-xs text-slate-700"
                              >
                                <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Privacy / Anti-Fraud Notice */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                          <Lock className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-900">
                              Anti-Fraud Ownership Protection
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              We found a possible match, but certain identifying details are kept
                              confidential by the Lost &amp; Found Office so no one can falsely
                              claim your item based only on the photo.
                            </p>
                          </div>
                        </div>

                        {/* Claim Flow State */}
                        {claimSubmitted ? (
                          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
                              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                              <span>Your claim has been submitted.</span>
                            </div>
                            <p className="text-xs text-emerald-900 leading-relaxed">
                              Please wait for the Lost &amp; Found Office to verify your claim.
                              Once an administrator confirms your verification response, you will
                              receive a notification to visit Room G-04 with your ESI student card.
                            </p>
                          </div>
                        ) : !claimMode ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                            <span className="text-xs text-slate-500">
                              Does this look like the item you lost?
                            </span>
                            <button
                              type="button"
                              onClick={() => setClaimMode(true)}
                              className="px-6 py-3 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Claim this item
                            </button>
                          </div>
                        ) : (
                          <form
                            onSubmit={handleClaimSubmit}
                            className="border-t border-slate-200 pt-6 space-y-4"
                          >
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
                              <ShieldAlert className="w-4 h-4" />
                              <span>Step 2: Ownership Verification Question</span>
                            </div>

                            <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200/80 text-xs font-medium text-slate-900">
                              {verificationPrompt}
                            </div>

                            {errorMsg && (
                              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                                {errorMsg}
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Your Verification Answer *
                              </label>
                              <textarea
                                rows={3}
                                value={verificationAnswer}
                                onChange={(e) => setVerificationAnswer(e.target.value)}
                                placeholder="Provide the specific hidden detail, engraving, sticker, or inside content..."
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Additional Proof (Optional — e.g. serial number, notebook group, receipt info)
                              </label>
                              <input
                                type="text"
                                value={additionalProof}
                                onChange={(e) => setAdditionalProof(e.target.value)}
                                placeholder="Any extra proof for the Lost & Found Office administrator..."
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setClaimMode(false)}
                                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {submitting ? 'Submitting Claim...' : 'Submit Ownership Claim'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
