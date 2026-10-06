import React, { useState, useEffect } from 'react';
import {
  Upload,
  Camera,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Loader2,
  FileQuestion,
} from 'lucide-react';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, ItemCategory } from '../types/models';

export interface LostFormSubmission {
  title: string;
  category: ItemCategory;
  description: string;
  color: string;
  brand: string;
  model: string;
  distinguishingCharacteristics: string;
  locationLost: string;
  dateLost: string;
  photoUrl: string;
}

interface ReportLostFlowProps {
  onSubmitLostReport: (data: LostFormSubmission) => Promise<void>;
  onCancel: () => void;
}

const SEARCH_STAGES = [
  'Searching the Lost & Found...',
  'Analyzing photos...',
  'Comparing characteristics...',
  'Checking locations...',
  'Finding similar items...',
];

const QUICK_EXAMPLES = [
  {
    label: 'Black Nike Backpack',
    title: 'Black Nike Backpack',
    category: 'Bags' as ItemCategory,
    color: 'Black',
    brand: 'Nike',
    model: 'Brasilia',
    description: 'Matte black Nike student backpack with two main zippered compartments.',
    distinguishingCharacteristics: 'Small red woven keychain attached to the front zipper.',
    locationLost: 'Library',
    dateLost: 'This week (October 3, 2026)',
  },
  {
    label: 'Black AirPods Case',
    title: 'Black AirPods Pro Case',
    category: 'Electronics' as ItemCategory,
    color: 'Black',
    brand: 'Apple',
    model: 'AirPods Pro 2',
    description: 'Black silicone case holding my AirPods Pro charging case.',
    distinguishingCharacteristics: 'Small scratch on the back hinge and engraving M.H. 404.',
    locationLost: 'Cafeteria',
    dateLost: 'Yesterday (October 4, 2026)',
  },
  {
    label: 'Silver Casio Calculator',
    title: 'Silver Casio Calculator',
    category: 'Electronics' as ItemCategory,
    color: 'Silver',
    brand: 'Casio',
    model: 'fx-991EX ClassWiz',
    description: 'Scientific calculator with black keys and hard sliding cover.',
    distinguishingCharacteristics: 'Linux penguin sticker inside the cover.',
    locationLost: 'Auditorium',
    dateLost: 'Yesterday (October 4, 2026)',
  },
];

export const ReportLostFlow: React.FC<ReportLostFlowProps> = ({
  onSubmitLostReport,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [noPhotoMode, setNoPhotoMode] = useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ItemCategory>('Bags');
  const [description, setDescription] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [distinguishingCharacteristics, setDistinguishingCharacteristics] = useState<string>('');

  const [locationLost, setLocationLost] = useState<string>('Library');
  const [dateChoice, setDateChoice] = useState<string>('Today');
  const [customDate, setCustomDate] = useState<string>('2026-10-03');

  const [searchStageIndex, setSearchStageIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (step !== 5) return;
    const interval = setInterval(() => {
      setSearchStageIndex((prev) => (prev < SEARCH_STAGES.length - 1 ? prev + 1 : prev));
    }, 650);
    return () => clearInterval(interval);
  }, [step]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setNoPhotoMode(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyQuickExample = (ex: (typeof QUICK_EXAMPLES)[number]) => {
    setTitle(ex.title);
    setCategory(ex.category);
    setColor(ex.color);
    setBrand(ex.brand);
    setModel(ex.model);
    setDescription(ex.description);
    setDistinguishingCharacteristics(ex.distinguishingCharacteristics);
    setLocationLost(ex.locationLost);
    setNoPhotoMode(true);
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!title.trim() || !description.trim() || !color.trim()) {
      setErrorMsg('Please fill in the item name, color, and description before searching.');
      setStep(2);
      return;
    }

    setErrorMsg('');
    setStep(5);
    setSearchStageIndex(0);

    const resolvedDate =
      dateChoice === 'Custom date/time' ? customDate : `${dateChoice} (Oct 2026)`;

    await onSubmitLostReport({
      title: title.trim().slice(0, 140),
      category,
      description: description.trim().slice(0, 1200),
      color: color.trim().slice(0, 80),
      brand: (brand.trim() || 'Unknown').slice(0, 100),
      model: model.trim().slice(0, 100),
      distinguishingCharacteristics: distinguishingCharacteristics.trim().slice(0, 800),
      locationLost,
      dateLost: resolvedDate.slice(0, 80),
      photoUrl: photoUrl.slice(0, 340000),
    });
  };

  if (step === 5) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-[#1E3A8A] flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              {SEARCH_STAGES[searchStageIndex]}
            </h2>
            <p className="text-xs text-slate-500">
              Comparing your report against physical inventory at the ESI Lost &amp; Found Office
            </p>
          </div>

          <div className="space-y-2.5 text-left max-w-xs mx-auto pt-2">
            {SEARCH_STAGES.map((stageText, idx) => {
              const isDone = idx < searchStageIndex;
              const isCurrent = idx === searchStageIndex;
              return (
                <div
                  key={stageText}
                  className={`flex items-center gap-3 text-xs transition-opacity ${
                    idx <= searchStageIndex ? 'opacity-100' : 'opacity-35'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#1E3A8A] animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span
                    className={
                      isCurrent ? 'font-semibold text-slate-900' : 'text-slate-600'
                    }
                  >
                    {stageText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>
        <div className="text-xs font-mono-tabular text-slate-500">
          Step {step} of 4
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-[#1E3A8A] transition-all duration-200"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Quick Autofill Demo Preset Strip */}
      <div className="mb-6 bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          Quick test presets (matches items in office):
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => applyQuickExample(ex)}
              className="px-2.5 py-1 text-xs font-medium text-[#1E3A8A] bg-blue-50/70 hover:bg-blue-100/80 rounded-md transition-colors cursor-pointer"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        {/* STEP 1 — Upload a photo */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Upload a photo of the item you lost
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                A photo helps our matching engine compare shape, color, and markings against
                items at the Lost &amp; Found Office.
              </p>
            </div>

            <label className="block border-2 border-dashed border-slate-300 hover:border-[#1E3A8A] rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {photoUrl ? (
                <div className="space-y-3">
                  <img
                    src={photoUrl}
                    alt="Uploaded preview"
                    className="max-h-48 mx-auto rounded-lg object-contain border border-slate-200"
                  />
                  <p className="text-xs font-medium text-[#16A34A]">
                    Photo attached · Click to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-[#1E3A8A]">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Click to upload a photo
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Examples: backpack, laptop, phone, headphones, wallet, keys, ID card
                    </p>
                  </div>
                </div>
              )}
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setNoPhotoMode(true);
                  setPhotoUrl('');
                  setStep(2);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <FileQuestion className="w-4 h-4" /> I don&apos;t have a photo — describe it instead
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Describe the item */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">What did you lose?</h2>
              <p className="text-sm text-slate-600 mt-1">
                {noPhotoMode
                  ? 'No photo needed — provide clear details so we can match your item.'
                  : 'Add details to complement your photo.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                >
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Item Name / Summary *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black Nike backpack"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Color *
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black, Silver, Blue"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Nike, Casio, Apple"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Model (optional)
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. fx-991EX, AirPods Pro"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                What does it look like? (General Description) *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe size, material, compartments, or general appearance..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Distinctive Characteristics (Stickers, keychains, scratches, contents)
              </label>
              <input
                type="text"
                value={distinguishingCharacteristics}
                onChange={(e) => setDistinguishingCharacteristics(e.target.value)}
                placeholder='Example: "Black Nike backpack with a small red keychain attached."'
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!title.trim() || !color.trim() || !description.trim()) {
                    setErrorMsg('Please enter the item name, color, and description.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(3);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer"
              >
                Next: Location <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Where did you lose it? */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Where did you lose it?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Select the campus building or area where you last had the item.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CAMPUS_LOCATIONS.map((loc) => {
                const active = locationLost === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocationLost(loc)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      active
                        ? 'border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A] font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{loc}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer"
              >
                Next: Date &amp; Time <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — When did you lose it? */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                When did you lose it?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Approximate timing helps us prioritize items turned into the Lost &amp; Found Office
                around or after that time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Today', 'Yesterday', 'This week', 'Custom date/time', 'Not sure'].map(
                (choice) => {
                  const active = dateChoice === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setDateChoice(choice)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        active
                          ? 'border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A] font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="text-xs">{choice}</span>
                    </button>
                  );
                }
              )}
            </div>

            {dateChoice === 'Custom date/time' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select approximate date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-2 px-7 py-3 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Search Lost &amp; Found Database <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
