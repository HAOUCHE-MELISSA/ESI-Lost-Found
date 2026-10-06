import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Archive,
  Lock,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  FoundItem,
  FoundItemPrivate,
  LostReport,
  MatchRecord,
  ClaimRecord,
  ITEM_CATEGORIES,
  CAMPUS_LOCATIONS,
  FoundItemStatus,
} from '../types/models';
import { SafeItemImage } from './SafeItemImage';

interface AdminDashboardProps {
  foundItems: FoundItem[];
  privateRecordsMap: Record<string, FoundItemPrivate>;
  allLostReports: LostReport[];
  allMatches: MatchRecord[];
  allClaims: ClaimRecord[];
  onAdminAddFoundItem: (data: {
    title: string;
    category: string;
    generalDescription: string;
    color: string;
    brand: string;
    model: string;
    publicCharacteristics: string;
    locationFound: string;
    dateFound: string;
    verificationQuestion: string;
    secretCharacteristics: string;
    storageLocation: string;
    adminNotes: string;
  }) => Promise<void>;
  onAdminUpdateFoundStatus: (item: FoundItem, newStatus: FoundItemStatus) => Promise<void>;
  onAdminUpdatePrivateRecord: (
    itemId: string,
    storageLocation: string,
    secretCharacteristics: string,
    adminNotes: string
  ) => Promise<void>;
  onAdminReviewClaim: (
    claim: ClaimRecord,
    decision: 'APPROVED' | 'REJECTED' | 'RETURNED',
    feedback: string,
    suspiciousFlag: boolean
  ) => Promise<void>;
  onAdminReviewMatch: (
    match: MatchRecord,
    decision: 'APPROVED' | 'REJECTED'
  ) => Promise<void>;
}

type AdminSection = 'inventory' | 'claims' | 'matches' | 'lost-reports' | 'add-item';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  foundItems,
  privateRecordsMap,
  allLostReports,
  allMatches,
  allClaims,
  onAdminAddFoundItem,
  onAdminUpdateFoundStatus,
  onAdminUpdatePrivateRecord,
  onAdminReviewClaim,
  onAdminReviewMatch,
}) => {
  const [section, setSection] = useState<AdminSection>('inventory');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');

  // Edit storage modal state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editStorage, setEditStorage] = useState<string>('');
  const [editSecret, setEditSecret] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Add new office item state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Electronics');
  const [newColor, setNewColor] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPublicChar, setNewPublicChar] = useState('');
  const [newLocationFound, setNewLocationFound] = useState('Library');
  const [newDateFound, setNewDateFound] = useState('October 5, 2026');
  const [newQuestion, setNewQuestion] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [newStorage, setNewStorage] = useState('Shelf A-01');
  const [newAdminNotes, setNewAdminNotes] = useState('');
  const [savingNew, setSavingNew] = useState(false);

  // Statistics
  const totalFound = foundItems.length;
  const awaitingPickup = foundItems.filter(
    (i) =>
      i.status === 'IN LOST & FOUND OFFICE' ||
      i.status === 'MATCH FOUND' ||
      i.status === 'CLAIM PENDING'
  ).length;
  const possibleMatchesCount = allMatches.length;
  const itemsReturnedCount = foundItems.filter((i) => i.status === 'RETURNED').length;
  const activeLostReportsCount = allLostReports.filter(
    (r) => r.status === 'SEARCHING' || r.status === 'POSSIBLE MATCH'
  ).length;

  const filteredInventory = useMemo(() => {
    return foundItems.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (locationFilter !== 'All' && item.locationFound !== locationFilter) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const priv = privateRecordsMap[item.id];
      return (
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.locationFound.toLowerCase().includes(q) ||
        (priv?.storageLocation || '').toLowerCase().includes(q) ||
        (priv?.secretCharacteristics || '').toLowerCase().includes(q)
      );
    });
  }, [
    foundItems,
    privateRecordsMap,
    categoryFilter,
    statusFilter,
    locationFilter,
    searchQuery,
  ]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newColor.trim() || !newDesc.trim()) return;
    setSavingNew(true);
    try {
      await onAdminAddFoundItem({
        title: newTitle.trim(),
        category: newCategory,
        generalDescription: newDesc.trim(),
        color: newColor.trim(),
        brand: newBrand.trim() || 'Unbranded',
        model: newModel.trim(),
        publicCharacteristics: newPublicChar.trim(),
        locationFound: newLocationFound,
        dateFound: newDateFound,
        verificationQuestion:
          newQuestion.trim() ||
          'Describe any hidden characteristic, engraving, or inside item to verify ownership.',
        secretCharacteristics: newSecret.trim() || 'Checked at office intake.',
        storageLocation: newStorage.trim() || 'Main Office Shelf',
        adminNotes: newAdminNotes.trim() || 'Logged by Lost & Found Office staff.',
      });
      setNewTitle('');
      setNewColor('');
      setNewBrand('');
      setNewModel('');
      setNewDesc('');
      setNewPublicChar('');
      setNewQuestion('');
      setNewSecret('');
      setSection('inventory');
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto py-8 px-4 sm:px-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
            <Building2 className="w-4 h-4" />
            <span>ESI Lost &amp; Found Office · Administration Console</span>
          </div>
          <h1 className="text-3xl font-normal text-slate-900 mt-1">
            Physical Inventory &amp; Ownership Verification
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setSection('add-item')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log New Found Item at Office
        </button>
      </div>

      {/* 5 Mandatory Admin Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total found items</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {totalFound}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Items awaiting pickup</div>
          <div className="text-2xl font-bold text-[#1E3A8A] font-mono-tabular mt-1">
            {awaitingPickup}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Possible matches</div>
          <div className="text-2xl font-bold text-amber-700 font-mono-tabular mt-1">
            {possibleMatchesCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Items returned</div>
          <div className="text-2xl font-bold text-[#16A34A] font-mono-tabular mt-1">
            {itemsReturnedCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Active lost reports</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-tabular mt-1">
            {activeLostReportsCount}
          </div>
        </div>
      </div>

      {/* Section Switcher */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setSection('inventory')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            section === 'inventory'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Office Inventory &amp; Storage ({foundItems.length})
        </button>
        <button
          type="button"
          onClick={() => setSection('claims')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            section === 'claims'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Student Claims &amp; Anti-Fraud ({allClaims.length})
        </button>
        <button
          type="button"
          onClick={() => setSection('matches')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            section === 'matches'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          AI Matches Queue ({allMatches.length})
        </button>
        <button
          type="button"
          onClick={() => setSection('lost-reports')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            section === 'lost-reports'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Lost Reports ({allLostReports.length})
        </button>
      </div>

      {/* SECTION 1: FOUND INVENTORY & STORAGE MANAGEMENT */}
      {section === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all items by keyword, brand, color, storage shelf, or secret marking..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="All">All Categories</option>
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="All">All Locations</option>
                {CAMPUS_LOCATIONS.filter((l) => l !== 'Not sure').map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="All">All Statuses</option>
                <option value="FOUND">FOUND</option>
                <option value="IN LOST & FOUND OFFICE">IN LOST &amp; FOUND OFFICE</option>
                <option value="MATCH FOUND">MATCH FOUND</option>
                <option value="CLAIM PENDING">CLAIM PENDING</option>
                <option value="RETURNED">RETURNED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Location &amp; Date</th>
                    <th className="py-3 px-4">Confidential Storage &amp; Secret Detail</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Office Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredInventory.map((item) => {
                    const priv = privateRecordsMap[item.id];
                    const isEditing = editingItemId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <SafeItemImage
                              src={item.photoUrl}
                              alt={item.title}
                              category={item.category}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{item.title}</div>
                              <div className="text-slate-500">
                                {item.category} · {item.color} · {item.brand}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{item.locationFound}</div>
                          <div className="text-slate-500 font-mono-tabular">{item.dateFound}</div>
                        </td>

                        <td className="py-3.5 px-4 max-w-md">
                          {isEditing ? (
                            <div className="space-y-2 py-1">
                              <input
                                type="text"
                                value={editStorage}
                                onChange={(e) => setEditStorage(e.target.value)}
                                placeholder="Storage Shelf / Bin"
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                              />
                              <input
                                type="text"
                                value={editSecret}
                                onChange={(e) => setEditSecret(e.target.value)}
                                placeholder="Secret verification detail"
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                              />
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Admin notes"
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onAdminUpdatePrivateRecord(
                                      item.id,
                                      editStorage,
                                      editSecret,
                                      editNotes
                                    );
                                    setEditingItemId(null);
                                  }}
                                  className="px-2.5 py-1 bg-[#1E3A8A] text-white rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="px-2.5 py-1 text-slate-600 text-[11px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-mono-tabular font-semibold text-[#1E3A8A]">
                                <Archive className="w-3.5 h-3.5" />
                                <span>{priv?.storageLocation || 'Unassigned Shelf'}</span>
                              </div>
                              <div className="flex items-start gap-1 text-slate-600">
                                <Lock className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                  Secret: {priv?.secretCharacteristics || 'No secret recorded'}
                                </span>
                              </div>
                              {priv?.adminNotes && (
                                <div className="text-[11px] text-slate-400">
                                  Note: {priv.adminNotes}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              onAdminUpdateFoundStatus(item, e.target.value as FoundItemStatus)
                            }
                            className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
                          >
                            <option value="FOUND">FOUND</option>
                            <option value="IN LOST & FOUND OFFICE">IN LOST &amp; FOUND OFFICE</option>
                            <option value="MATCH FOUND">MATCH FOUND</option>
                            <option value="CLAIM PENDING">CLAIM PENDING</option>
                            <option value="RETURNED">RETURNED</option>
                            <option value="EXPIRED">EXPIRED</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditStorage(priv?.storageLocation || 'Shelf A-01');
                              setEditSecret(priv?.secretCharacteristics || '');
                              setEditNotes(priv?.adminNotes || '');
                            }}
                            className="text-xs font-medium text-[#1E3A8A] hover:underline cursor-pointer"
                          >
                            Edit Storage / Secret
                          </button>
                          {item.status !== 'RETURNED' && (
                            <button
                              type="button"
                              onClick={() => onAdminUpdateFoundStatus(item, 'RETURNED')}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-[#16A34A] hover:bg-emerald-700 rounded-md cursor-pointer"
                            >
                              Mark Returned
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STUDENT CLAIMS & SUSPICIOUS CLAIM REVIEW */}
      {section === 'claims' && (
        <div className="space-y-4">
          {allClaims.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
              No student ownership claims submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allClaims.map((claim) => {
                const foundItem = foundItems.find((f) => f.id === claim.foundItemId);
                const priv = privateRecordsMap[claim.foundItemId];

                return (
                  <div
                    key={claim.id}
                    className={`bg-white border rounded-xl p-5 space-y-4 ${
                      claim.suspiciousFlag ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-900">
                          Claim by {claim.studentName} ({claim.studentEmail})
                        </span>
                        <span className="text-xs text-slate-400 mx-2">·</span>
                        <span className="text-xs text-slate-600">
                          Target Item: {foundItem?.title || claim.foundItemId}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {claim.suspiciousFlag && (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Flagged Suspicious
                          </span>
                        )}
                        <span className="font-mono-tabular font-semibold text-[#1E3A8A]">
                          Status: {claim.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="font-semibold text-slate-700">
                          Student&apos;s Verification Response:
                        </div>
                        <div className="text-slate-500">Q: {claim.verificationQuestion}</div>
                        <div className="text-slate-900 font-medium pt-1">
                          A: &ldquo;{claim.verificationAnswer}&rdquo;
                        </div>
                        {claim.additionalProof && (
                          <div className="text-slate-600 pt-1">
                            Extra proof: {claim.additionalProof}
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1.5">
                        <div className="font-semibold text-amber-950">
                          Office Confidential Ground Truth (Compare before approving):
                        </div>
                        <div className="text-amber-900">
                          Secret Feature: {priv?.secretCharacteristics || 'Check physical item'}
                        </div>
                        <div className="text-amber-800 font-mono-tabular">
                          Storage Shelf: {priv?.storageLocation || 'Main Office'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          onAdminReviewClaim(
                            claim,
                            claim.status === 'PENDING' ? 'REJECTED' : claim.status,
                            'Verification answer did not match confidential markings.',
                            !claim.suspiciousFlag
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {claim.suspiciousFlag ? 'Clear Suspicious Flag' : 'Flag as Suspicious Claim'}
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onAdminReviewClaim(
                              claim,
                              'APPROVED',
                              'Ownership verified! Please visit the Lost & Found Office (Room G-04) with your student ID.',
                              false
                            )
                          }
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve Claim
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onAdminReviewClaim(
                              claim,
                              'RETURNED',
                              'Item handed over in person at the ESI Lost & Found Office.',
                              false
                            )
                          }
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#16A34A] hover:bg-emerald-700 rounded-lg cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Item Returned
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onAdminReviewClaim(
                              claim,
                              'REJECTED',
                              'The identifying details provided did not match the physical item at the office.',
                              claim.suspiciousFlag || false
                            )
                          }
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: AI MATCHES QUEUE */}
      {section === 'matches' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {allMatches.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No AI-generated matches recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Lost Report</th>
                    <th className="py-3 px-4">Found Inventory Item</th>
                    <th className="py-3 px-4">AI Explanation</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allMatches.map((m) => {
                    const lost = allLostReports.find((r) => r.id === m.lostReportId);
                    const found = foundItems.find((f) => f.id === m.foundItemId);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-mono-tabular font-bold text-[#16A34A]">
                          {m.overallScore}%
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {lost?.title || m.lostReportId}
                          </div>
                          <div className="text-slate-500">{lost?.userEmail || 'Student'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {found?.title || m.foundItemId}
                          </div>
                          <div className="text-slate-500">{found?.locationFound}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-sm text-slate-600">
                          {m.explanationSummary}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular">{m.adminStatus}</td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onAdminReviewMatch(m, 'APPROVED')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#1E3A8A] rounded cursor-pointer"
                          >
                            Approve Match
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdminReviewMatch(m, 'REJECTED')}
                            className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: ALL LOST REPORTS */}
      {section === 'lost-reports' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {allLostReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No student lost reports submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Lost Object</th>
                    <th className="py-3 px-4">Distinctive Characteristics</th>
                    <th className="py-3 px-4">Location &amp; Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allLostReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {r.userName || 'ESI Student'}
                        </div>
                        <div className="text-slate-500">{r.userEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{r.title}</div>
                        <div className="text-slate-500">
                          {r.category} · {r.color} · {r.brand}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600">
                        {r.distinguishingCharacteristics || r.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{r.locationLost}</div>
                        <div className="text-slate-500 font-mono-tabular">{r.dateLost}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E3A8A]">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ADD NEW FOUND ITEM DIRECTLY TO OFFICE */}
      {section === 'add-item' && (
        <form
          onSubmit={handleCreateItem}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-3xl space-y-5"
        >
          <h2 className="text-xl font-semibold text-slate-900">
            Log New Found Item into Office Custody
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Black Dell Laptop Charger"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color *
              </label>
              <input
                type="text"
                required
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Black"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Dell"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location Found
              </label>
              <select
                value={newLocationFound}
                onChange={(e) => setNewLocationFound(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                {CAMPUS_LOCATIONS.filter((l) => l !== 'Not sure').map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              General Public Description *
            </label>
            <textarea
              rows={2}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Public description shown in search results..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="text-xs font-semibold text-[#1E3A8A]">
              Confidential Office Storage &amp; Anti-Fraud Verification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Physical Storage Shelf / Bin *
                </label>
                <input
                  type="text"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  placeholder="Shelf B-04"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date Found
                </label>
                <input
                  type="text"
                  value={newDateFound}
                  onChange={(e) => setNewDateFound(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Secret Identifying Characteristic (Hidden from students)
              </label>
              <input
                type="text"
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                placeholder="e.g. Serial tag, sticker under base, or name inside cover"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Verification Question for Claimants
              </label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. What sticker or label is attached to the adapter brick?"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSection('inventory')}
              className="px-4 py-2 text-xs font-medium text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingNew}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] cursor-pointer"
            >
              {savingNew ? 'Saving...' : 'Save Item to Office Database'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
