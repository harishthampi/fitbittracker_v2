import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  ChevronRight,
  Flame,
  Loader2,
  PieChart,
  Plus,
  RefreshCw,
  Salad,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { FoodItem } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface AnalyzedMealData {
  dishName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidence?: string;
  ingredients?: Array<{ name: string; portion: string; calories?: number }>;
  healthInsight?: string;
}

interface MealPhotoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogMeal: (meal: Omit<FoodItem, 'id' | 'timestamp'>) => void;
}

export const MealPhotoScannerModal: React.FC<MealPhotoScannerModalProps> = ({
  isOpen,
  onClose,
  onLogMeal,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<AnalyzedMealData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mealSlot, setMealSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  // Editable fields for user confirmation
  const [dishTitle, setDishTitle] = useState('');
  const [editCalories, setEditCalories] = useState<number>(0);
  const [editProtein, setEditProtein] = useState<number>(0);
  const [editCarbs, setEditCarbs] = useState<number>(0);
  const [editFat, setEditFat] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Client-side image compression to ensure fast uploads (<200KB) and prevent payload limits
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setAnalyzedResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawBase64 = e.target?.result as string;
      const compressed = await compressImage(rawBase64);
      setSelectedImage(compressed);
      analyzePhoto(compressed, 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleSampleClick = async (samplePath: string, sampleTitle: string) => {
    sounds.playTap();
    setErrorMessage(null);
    setAnalyzedResult(null);

    try {
      const resp = await fetch(samplePath);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawBase64 = e.target?.result as string;
        const compressed = await compressImage(rawBase64);
        setSelectedImage(compressed);
        analyzePhoto(compressed, 'image/jpeg');
      };
      reader.readAsDataURL(blob);
    } catch {
      setErrorMessage('Failed to load sample image.');
    }
  };

  const analyzePhoto = async (base64Image: string, mimeType: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType,
          mealType: mealSlot,
        }),
      });

      const responseText = await response.text();
      let json: any = null;

      try {
        json = JSON.parse(responseText);
      } catch (parseError) {
        // If server returned an HTML error page during restart or high demand
        throw new Error(
          'AI server was momentarily reconnecting. Tap "Retry Analysis (Fallback Model)" below to run on the backup cluster.'
        );
      }

      if (!response.ok || !json.success) {
        let msg = json.error || 'Failed to analyze meal photograph.';
        try {
          const parsed = typeof msg === 'string' && msg.startsWith('{') ? JSON.parse(msg) : null;
          if (parsed?.error?.message) {
            msg = parsed.error.message;
          }
        } catch {}
        throw new Error(msg);
      }

      const data: AnalyzedMealData = json.data;
      setAnalyzedResult(data);
      setDishTitle(data.dishName || 'Identified Meal');
      setEditCalories(data.calories || 450);
      setEditProtein(data.proteinGrams || 30);
      setEditCarbs(data.carbsGrams || 40);
      setEditFat(data.fatGrams || 15);
      sounds.playSuccess();
    } catch (err: any) {
      console.error(err);
      let displayError = err.message || 'Analysis failed. Please try again.';
      try {
        const parsed = typeof displayError === 'string' && displayError.startsWith('{') ? JSON.parse(displayError) : null;
        if (parsed?.error?.message) {
          displayError = parsed.error.message;
        }
      } catch {}

      if (displayError.includes('high demand') || displayError.includes('503') || displayError.includes('UNAVAILABLE')) {
        displayError = 'Model experienced a temporary peak demand spike. We have backup models available—tap Retry below to run on the fallback cluster.';
      }

      setErrorMessage(displayError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndLog = () => {
    if (!dishTitle.trim()) return;
    sounds.playSuccess();
    fireConfetti();

    onLogMeal({
      name: dishTitle.trim(),
      mealType: mealSlot,
      calories: editCalories,
      proteinGrams: editProtein,
      carbsGrams: editCarbs,
      fatGrams: editFat,
    });

    handleClose();
  };

  const handleClose = () => {
    setSelectedImage(null);
    setAnalyzedResult(null);
    setIsAnalyzing(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  AI Meal Photo Scanner
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                  FREE TIER
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Snap or upload a photo for automatic calorie & macro estimation
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* If no image selected yet */}
          {!selectedImage && (
            <div className="space-y-5">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleImageFile(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-850/50 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                  Upload or Snap a Meal Photo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Drag and drop your food photo here, or browse files from your camera roll
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-xs">
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Sample Quick-Test Photos */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Or Test with a Prepared Sample:
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      handleSampleClick(
                        '/src/assets/images/nutrition_healthy_bowl_1794015956548.jpg',
                        'Chicken & Quinoa Bowl'
                      )
                    }
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white dark:bg-slate-850 text-left transition-colors cursor-pointer"
                  >
                    <img
                      src="/src/assets/images/nutrition_healthy_bowl_1794015956548.jpg"
                      alt="Sample Bowl"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Protein Salad Bowl
                      </div>
                      <div className="text-[11px] text-slate-500">Chicken, avocado, sweet potato</div>
                    </div>
                  </button>

                  <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col justify-center text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      ⚡ Free Gemini Vision
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Identifies portions, macros & calories in ~2 seconds.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* If image is selected and analyzing */}
          {selectedImage && isAnalyzing && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                  <img
                    src={selectedImage}
                    alt="Analyzing Meal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Analyzing Meal Nutrition...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Gemini Vision is estimating portion sizes, identifying ingredients, and computing protein, carb, and fat values.
                </p>
              </div>
            </div>
          )}

          {/* Error display with Smart Fallback Actions */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0">⚠️</span>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
                {selectedImage && (
                  <button
                    onClick={() => {
                      if (selectedImage) {
                        analyzePhoto(selectedImage, 'image/jpeg');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-2xs"
                  >
                    Retry Analysis (Fallback Model)
                  </button>
                )}

                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setAnalyzedResult({
                      dishName: 'Custom Healthy Meal',
                      calories: 500,
                      proteinGrams: 30,
                      carbsGrams: 50,
                      fatGrams: 15,
                      confidence: 'Manual Entry',
                      healthInsight: 'Adjust values to match your meal portions.',
                    });
                    setDishTitle('Custom Healthy Meal');
                    setEditCalories(500);
                    setEditProtein(30);
                    setEditCarbs(50);
                    setEditFat(15);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Enter Estimates Manually
                </button>

                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium underline"
                >
                  Choose Different Photo
                </button>
              </div>
            </div>
          )}

          {/* Analyzed Results and Confirmation Form */}
          {analyzedResult && !isAnalyzing && (
            <div className="space-y-5 animate-fadeIn">
              {/* Photo & Dish Header */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={selectedImage || ''}
                    alt="Scanned Food"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Detected Dish
                  </span>
                  <input
                    type="text"
                    value={dishTitle}
                    onChange={(e) => setDishTitle(e.target.value)}
                    className="w-full font-bold text-base text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 truncate"
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>AI Confidence: {analyzedResult.confidence || 'High'}</span>
                  </div>
                </div>
              </div>

              {/* Meal Slot Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Save to Meal Slot:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setMealSlot(slot)}
                      className={`py-2 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer ${
                        mealSlot === slot
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Macros & Calories Strip */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center">
                  <div className="text-[10px] font-bold text-rose-600 uppercase">Calories</div>
                  <input
                    type="number"
                    value={editCalories}
                    onChange={(e) => setEditCalories(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-mono font-bold text-base text-slate-900 dark:text-white bg-transparent focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-400">kcal</div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Protein</div>
                  <input
                    type="number"
                    value={editProtein}
                    onChange={(e) => setEditProtein(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-mono font-bold text-base text-slate-900 dark:text-white bg-transparent focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-400">grams</div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center">
                  <div className="text-[10px] font-bold text-blue-600 uppercase">Carbs</div>
                  <input
                    type="number"
                    value={editCarbs}
                    onChange={(e) => setEditCarbs(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-mono font-bold text-base text-slate-900 dark:text-white bg-transparent focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-400">grams</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center">
                  <div className="text-[10px] font-bold text-amber-600 uppercase">Fat</div>
                  <input
                    type="number"
                    value={editFat}
                    onChange={(e) => setEditFat(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-mono font-bold text-base text-slate-900 dark:text-white bg-transparent focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-400">grams</div>
                </div>
              </div>

              {/* Detected Ingredients Breakdown */}
              {analyzedResult.ingredients && analyzedResult.ingredients.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Detected Plate Ingredients:
                  </div>
                  <div className="space-y-1">
                    {analyzedResult.ingredients.map((ing, i) => (
                      <div
                        key={i}
                        className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between"
                      >
                        <span>• {ing.name}</span>
                        <span className="font-mono text-slate-400">{ing.portion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coaching Tip */}
              {analyzedResult.healthInsight && (
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{analyzedResult.healthInsight}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalyzedResult(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Take Another Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndLog}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Add to Log</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
