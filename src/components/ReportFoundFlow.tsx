import React, { useState } from 'react';
import {
  Camera,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, ItemCategory } from '../types/models';

export interface FoundFormSubmission {
  title: string;
  category: ItemCategory;
  generalDescription: string;
  color: string;
  brand: string;
  model: string;
  publicCharacteristics: string;
  secretCharacteristics: string;
  verificationQuestion: string;
  locationFound: string;
  dateFound: string;
  timeFound: string;
  custodyState: 'STILL_WITH_FINDER' | 'AT_OFFICE';
  photoUrl: string;
}

interface ReportFoundFlowProps {
  onSubmitFoundItem: (data: FoundFormSubmission) => Promise<void>;
  onCancel: () => void;
}

export const ReportFoundFlow: React.FC<ReportFoundFlowProps> = ({
  onSubmitFoundItem,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [color, setColor] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [generalDescription, setGeneralDescription] = useState<string>('');
  const [publicCharacteristics, setPublicCharacteristics] = useState<string>('');
  const [secretCharacteristics, setSecretCharacteristics] = useState<string>('');
  const [verificationQuestion, setVerificationQuestion] = useState<string>('');
  const [locationFound, setLocationFound] = useState<string>('Library');
  const [dateFound, setDateFound] = useState<string>('October 5, 2026');
  const [timeFound, setTimeFound] = useState<string>('14:00');
  const [custodyState, setCustodyState] = useState<'STILL_WITH_FINDER' | 'AT_OFFICE'>(
    'AT_OFFICE'
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedDone, setSubmittedDone] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !color.trim() || !generalDescription.trim()) {
      setErrorMsg('Please provide the item title, color, and description.');
      setStep(2);
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmitFoundItem({
        title: title.trim().slice(0, 140),
        category,
        generalDescription: generalDescription.trim().slice(0, 1200),
        color: color.trim().slice(0, 80),
        brand: (brand.trim() || 'Unbranded').slice(0, 100),
        model: model.trim().slice(0, 100),
        publicCharacteristics: publicCharacteristics.trim().slice(0, 600),
        secretCharacteristics: (
          secretCharacteristics.trim() || 'Verified in person at Lost & Found Office'
        ).slice(0, 1000),
        verificationQuestion: (
          verificationQuestion.trim() ||
          'Can you describe any unique markings, lock-screen details, or contents inside this item?'
        ).slice(0, 300),
        locationFound,
        dateFound: dateFound.slice(0, 60),
        timeFound: timeFound.slice(0, 60),
        custodyState,
        photoUrl: photoUrl.slice(0, 340000),
      });
      setSubmittedDone(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not submit found item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedDone) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Thank you for helping a fellow ESI student
          </h2>
          {custodyState === 'STILL_WITH_FINDER' ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-1.5">
              <p className="text-xs font-semibold text-amber-900">
                Next Step: Hand over to the Lost &amp; Found Office
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Please bring the item to the ESI Lost &amp; Found Office (Administration Building,
                Room G-04) so it can be safely stored and returned to its owner.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your found report has been logged and linked with the Lost &amp; Found Office
              inventory. Any students with matching lost reports have been notified automatically.
            </p>
          )}
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
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
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-xs font-mono-tabular text-slate-500">
          Step {step} of 5
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-[#1E3A8A] transition-all duration-200"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        {/* STEP 1: Upload photos */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Found something?</h2>
              <p className="text-sm text-slate-600 mt-1">
                Help its owner find it. Start by uploading a clear photo of the object.
              </p>
            </div>

            <label className="block border-2 border-dashed border-slate-300 hover:border-[#1E3A8A] rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {photoUrl ? (
                <div className="space-y-3">
                  <img
                    src={photoUrl}
                    alt="Found item preview"
                    className="max-h-48 mx-auto rounded-lg object-contain border border-slate-200"
                  />
                  <p className="text-xs font-medium text-[#16A34A]">
                    Photo uploaded · Click to change
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-[#1E3A8A]">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    Upload photo of the found item
                  </p>
                  <p className="text-xs text-slate-500">
                    Avoid photographing private serial numbers or inside ID cards
                  </p>
                </div>
              )}
            </label>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer"
              >
                Next: Describe Object <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Describe the object */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Describe the object</h2>
              <p className="text-sm text-slate-600 mt-1">
                Separate public details from hidden verification details to prevent false claims.
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
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
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
                  Item Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black Silicone AirPods Case"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Color *
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black, Silver"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
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
                  placeholder="e.g. Apple, Casio"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
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
                  placeholder="e.g. AirPods Pro"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                General Public Description *
              </label>
              <textarea
                rows={2}
                value={generalDescription}
                onChange={(e) => setGeneralDescription(e.target.value)}
                placeholder="General appearance (do not include secret engravings or private contents here)..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-semibold text-[#1E3A8A]">
                Anti-Fraud Ownership Verification (Confidential — Only visible to Office Admin)
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hidden / Distinctive Characteristic (Kept secret from public listings)
                </label>
                <input
                  type="text"
                  value={secretCharacteristics}
                  onChange={(e) => setSecretCharacteristics(e.target.value)}
                  placeholder="e.g. Engraving 'M.H. 404' under the sleeve, or blue USB drive in pocket"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Verification Question to ask claiming student
                </label>
                <input
                  type="text"
                  value={verificationQuestion}
                  onChange={(e) => setVerificationQuestion(e.target.value)}
                  placeholder="e.g. What initials are engraved on the inside of the case?"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
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
                  if (!title.trim() || !color.trim() || !generalDescription.trim()) {
                    setErrorMsg('Please fill in the item title, color, and general description.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(3);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer"
              >
                Next: Where Found <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Where did you find it? */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Where did you find it?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Select the campus location where the item was discovered.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CAMPUS_LOCATIONS.filter((l) => l !== 'Not sure').map((loc) => {
                const active = locationFound === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocationFound(loc)}
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

        {/* STEP 4: When did you find it? */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                When did you find it?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Enter the date and approximate time you found the item.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date Found
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dateFound}
                    onChange={(e) => setDateFound(e.target.value)}
                    placeholder="October 5, 2026"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Approximate Time
                </label>
                <input
                  type="time"
                  value={timeFound}
                  onChange={(e) => setTimeFound(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono-tabular"
                />
              </div>
            </div>

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
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer"
              >
                Next: Current Status <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Current status */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Where is the item right now?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Let the Lost &amp; Found Office know whether you have already dropped it off.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCustodyState('AT_OFFICE')}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                  custodyState === 'AT_OFFICE'
                    ? 'border-[#1E3A8A] bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  Already delivered to Lost &amp; Found Office
                </div>
                <p className="text-xs text-slate-600">
                  The physical item is with office staff and ready to be linked to an inventory bin.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCustodyState('STILL_WITH_FINDER')}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                  custodyState === 'STILL_WITH_FINDER'
                    ? 'border-[#1E3A8A] bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">Still with me</div>
                <p className="text-xs text-slate-600">
                  I currently have the item and will bring it to the ESI Lost &amp; Found Office.
                </p>
              </button>
            </div>

            {custodyState === 'STILL_WITH_FINDER' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  Please bring the item to the ESI Lost &amp; Found Office so it can be safely
                  stored and returned to its owner. Your contact information will never be shown
                  publicly to other students.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-7 py-3 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Found Item Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
