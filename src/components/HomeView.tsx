import React, { useState, useMemo } from 'react';
import {
  Search,
  Package,
  Building2,
  ShieldCheck,
  ArrowRight,
  Clock,
  MapPin,
  Filter,
  Sparkles,
} from 'lucide-react';
import { FoundItem, ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../types/models';
import { SafeItemImage } from './SafeItemImage';

interface HomeViewProps {
  foundItems: FoundItem[];
  totalReturnedCount: number;
  activeSearchesCount: number;
  onStartLostFlow: () => void;
  onStartFoundFlow: () => void;
  onSelectFoundItemForClaim: (item: FoundItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  foundItems,
  totalReturnedCount,
  activeSearchesCount,
  onStartLostFlow,
  onStartFoundFlow,
  onSelectFoundItemForClaim,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const activeOfficeItems = useMemo(
    () => foundItems.filter((item) => item.status !== 'RETURNED' && item.status !== 'EXPIRED'),
    [foundItems]
  );

  const filteredItems = useMemo(() => {
    return activeOfficeItems.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesLoc = selectedLocation === 'All' || item.locationFound === selectedLocation;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.generalDescription.toLowerCase().includes(q) ||
        item.locationFound.toLowerCase().includes(q);
      return matchesCat && matchesLoc && matchesQuery;
    });
  }, [activeOfficeItems, selectedCategory, selectedLocation, searchQuery]);

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative bg-white border-b border-slate-200 pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-medium text-[#1E3A8A] tracking-wide">
                École Nationale Supérieure d&apos;Informatique · Oued Smar Campus
              </div>

              <h1
                className="text-4xl sm:text-6xl font-normal text-[#0F172A] leading-[1.08] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Lost something at ESI?
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Tell us what you lost. Our AI will search the Lost &amp; Found database and find the
                closest matches stored at the campus Lost &amp; Found Office.
              </p>

              {/* Two immediately obvious primary actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={onStartLostFlow}
                  className="inline-flex items-center justify-center gap-3 px-7 py-4 text-sm font-semibold text-white bg-[#1E3A8A] rounded-xl hover:bg-[#172554] transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>I Lost Something</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={onStartFoundFlow}
                  className="inline-flex items-center justify-center gap-3 px-7 py-4 text-sm font-semibold text-[#0F172A] bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Package className="w-4 h-4 text-[#1E3A8A]" />
                  <span>I Found Something</span>
                </button>
              </div>

              {/* Campus Statistic Strip */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-xl">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-mono-tabular">
                    {activeOfficeItems.length}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Items currently in Lost &amp; Found
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#16A34A] font-mono-tabular">
                    {totalReturnedCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Items returned to students</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] font-mono-tabular">
                    {activeSearchesCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Active student searches</div>
                </div>
              </div>
            </div>

            {/* Right Column: Physical Lost & Found Office Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <div className="text-xs font-medium text-slate-500">Physical Custody Hub</div>
                    <h2 className="text-xl font-semibold text-[#0F172A] mt-1">
                      Lost &amp; Found Office
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#1E3A8A] shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Found items are physically kept at the ESI Lost &amp; Found Office. This platform
                  helps you identify your item before visiting the office.
                </p>

                <div className="space-y-3 text-xs text-slate-600 border-t border-slate-200/80 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Office Location</span>
                    <span className="font-medium text-slate-900">
                      Administration Building · Ground Floor, Room G-04
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Verification Hours</span>
                    <span className="font-mono-tabular font-medium text-slate-900">
                      Sun – Thu · 08:30 – 16:30
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ownership Policy</span>
                    <span className="font-medium text-slate-900">
                      Student ID + Hidden Feature Verification
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    To prevent false claims, public listings omit secret markings (engravings,
                    serials, pocket contents). Final ownership verification is performed by the
                    Lost &amp; Found Office.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="space-y-2">
            <div className="text-xs font-mono-tabular font-semibold text-[#1E3A8A]">
              01. Describe or Upload
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Submit your lost item report
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide a photo or describe the brand, color, campus location, and distinctive
              details in less than 60 seconds.
            </p>
          </div>
          <div className="space-y-2 md:border-l md:border-slate-200 md:pl-8">
            <div className="text-xs font-mono-tabular font-semibold text-[#1E3A8A]">
              02. Hybrid Matching
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Compare against office inventory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our system evaluates visual appearance, brand, color, location proximity, and date to
              rank possible matches with clear explanations.
            </p>
          </div>
          <div className="space-y-2 md:border-l md:border-slate-200 md:pl-8">
            <div className="text-xs font-mono-tabular font-semibold text-[#1E3A8A]">
              03. Verify &amp; Collect
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Answer anti-fraud verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm a hidden detail known only to the owner. Once the Lost &amp; Found Office
              approves your claim, pick up your item in person.
            </p>
          </div>
        </div>
      </section>

      {/* RECENTLY LOGGED AT THE OFFICE — PUBLIC SANITIZED DIRECTORY */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#0F172A] tracking-tight">
              Items Currently in the Lost &amp; Found Office
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Sanitized inventory of found objects. Secret identifying characteristics are hidden to
              protect rightful owners.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartLostFlow}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> Run full AI comparison for your lost item
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item type, color, brand, or campus building..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="All">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="All">All Campus Locations</option>
              {CAMPUS_LOCATIONS.filter((l) => l !== 'Not sure').map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <p className="text-sm font-medium text-slate-800">
              No matching items in the public catalog
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Even if your item isn&apos;t listed here yet, submit a Lost Report so we can
              automatically notify you the moment it arrives at the Lost &amp; Found Office.
            </p>
            <button
              type="button"
              onClick={onStartLostFlow}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer"
            >
              Submit a Lost Item Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <SafeItemImage
                    src={item.photoUrl}
                    alt={item.title}
                    category={item.category}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4 space-y-2.5">
                    {/* Zero-pill metadata discipline: clean unboxed text with separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.color}</span>
                      {item.brand && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{item.brand}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.generalDescription}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.locationFound}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono-tabular">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.dateFound.replace(', 2026', '')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-[#16A34A]">
                      {item.custodyState === 'AT_OFFICE'
                        ? 'At Lost & Found Office'
                        : 'Reported Found'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectFoundItemForClaim(item)}
                      className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Claim / Verify →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
