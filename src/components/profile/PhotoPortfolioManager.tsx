import React, { useState, useRef } from 'react';
import {
  Upload,
  Star,
  Trash2,
  GripVertical,
  Camera,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUp,
  Sparkles,
} from 'lucide-react';

export interface PhotoPortfolioManagerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  userName?: string;
}

/**
 * Checks whether a photo string is a placeholder or default avatar
 */
export const isPlaceholderPhoto = (url: string | null | undefined): boolean => {
  if (!url) return true;
  const lower = url.trim().toLowerCase();
  return (
    lower.includes('placeholder') ||
    lower.includes('default-avatar') ||
    lower.includes('ui-avatars.com') ||
    lower.includes('dicebear') ||
    lower.includes('avatar.svg') ||
    lower.includes('green-v') ||
    lower.includes('letter-avatar') ||
    (lower.startsWith('data:image/svg') && (lower.includes('<text') || lower.includes('letter') || lower.includes('green')))
  );
};

export const PhotoPortfolioManager: React.FC<PhotoPortfolioManagerProps> = ({
  photos,
  onChange,
  maxPhotos = 6,
  userName = 'Verified User',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Clean real photos list (filtering out any previous placeholder string)
  const realPhotos = photos.filter((p) => !isPlaceholderPhoto(p));
  const hasRealPhotos = realPhotos.length > 0;

  // The letter avatar placeholder letter (defaults to 'V' or user's first letter)
  const placeholderLetter = userName?.trim()?.charAt(0)?.toUpperCase() || 'V';

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a valid JPG, PNG, or WebP photo.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Photo file size must not exceed 8MB.');
      return;
    }

    if (realPhotos.length >= maxPhotos) {
      setErrorMsg(`You can upload a maximum of ${maxPhotos} photos.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newPhotoDataUrl = reader.result;

        // Auto-remove placeholder: The first real image immediately becomes the Main Photo!
        if (realPhotos.length === 0) {
          onChange([newPhotoDataUrl]);
          showToast('Image uploaded! Set as your Main Photo.');
        } else {
          // Add to photos list
          onChange([...realPhotos, newPhotoDataUrl]);
          showToast('Photo added to your portfolio.');
        }
        setSelectedPhotoIndex(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Could not read image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Action 1: Make Main Photo (sets it to index 0)
  const handleMakeMain = (index: number) => {
    if (index === 0) return;
    const selected = realPhotos[index];
    const remaining = realPhotos.filter((_, i) => i !== index);
    const newOrder = [selected, ...remaining];
    onChange(newOrder);
    setSelectedPhotoIndex(0);
    showToast('★ Promoted to Main Photo!');
  };

  // Action 2: Delete Photo
  const handleDelete = (index: number) => {
    const updated = realPhotos.filter((_, i) => i !== index);
    onChange(updated);
    setSelectedPhotoIndex(null);
    showToast('Photo removed.');
  };

  // Drag & drop card reordering
  const handleCardDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...realPhotos];
    const [movedPhoto] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedPhoto);

    onChange(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setSelectedPhotoIndex(targetIndex === 0 ? 0 : targetIndex);

    if (targetIndex === 0) {
      showToast('★ Moved to Main Photo slot!');
    }
  };

  return (
    <div className="space-y-4 text-left select-none">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <span>Your Photo Portfolio</span>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {realPhotos.length} / {maxPhotos} Photos
            </span>
          </h4>
          <p className="text-[11px] text-stone-500 mt-0.5">
            The first photo with the ★ badge is your primary display photo. Tap or drag to reorder.
          </p>
        </div>

        {/* Quick upload button */}
        {realPhotos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Photo</span>
          </button>
        )}
      </div>

      {/* Grid of Photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* CASE 1: When no real photos exist yet -> Display the default letter avatar/placeholder (the green "V" card) */}
        {!hasRealPhotos && (
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-emerald-400 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex flex-col items-center justify-between p-4 text-white shadow-sm">
            {/* Top Badge */}
            <div className="w-full flex justify-between items-center">
              <span className="px-2 py-0.5 bg-black/40 backdrop-blur rounded text-[10px] font-bold tracking-wider uppercase text-emerald-200">
                Default Avatar
              </span>
              <span className="text-[10px] text-emerald-100 font-mono">Placeholder</span>
            </div>

            {/* The Green "V" Letter Avatar */}
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner mb-2">
                <span className="text-3xl font-serif font-extrabold text-white drop-shadow-md">
                  {placeholderLetter}
                </span>
              </div>
              <p className="text-[11px] font-bold text-center text-white">
                Green "{placeholderLetter}" Avatar
              </p>
              <p className="text-[10px] text-emerald-100 text-center mt-0.5 max-w-[130px] leading-tight">
                Upload any real photo to replace this automatically
              </p>
            </div>

            {/* Action prompt */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-white text-emerald-900 font-bold text-[11px] rounded-xl shadow-md hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Replace with Real Photo</span>
            </button>
          </div>
        )}

        {/* Real Uploaded Photo Cards */}
        {realPhotos.map((url, idx) => {
          const isPrimary = idx === 0;
          const isSelected = selectedPhotoIndex === idx;
          const isDragged = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx;

          return (
            <div
              key={`${url.slice(0, 40)}-${idx}`}
              draggable
              onDragStart={(e) => handleCardDragStart(e, idx)}
              onDragOver={(e) => handleCardDragOver(e, idx)}
              onDrop={(e) => handleCardDrop(e, idx)}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onClick={() => setSelectedPhotoIndex(isSelected ? null : idx)}
              className={`group relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isPrimary
                  ? 'border-rose-400 ring-2 ring-rose-300 shadow-md'
                  : 'border-stone-200 hover:border-stone-400 shadow-xs'
              } ${isDragged ? 'opacity-40 scale-95' : ''} ${
                isDragOver ? 'ring-2 ring-emerald-500 scale-[1.02]' : ''
              } ${isSelected ? 'ring-2 ring-rose-500' : ''}`}
            >
              {/* Photo Image */}
              <img
                src={url}
                alt={`Portfolio ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />

              {/* Gradient Backdrop on Hover / Active Selection */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-black/40 transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-70 sm:opacity-0 sm:group-hover:opacity-100'
                }`}
              />

              {/* Top Controls: Badge + Drag Grip + Delete Button */}
              <div className="relative z-10 p-2.5 flex items-start justify-between gap-1 w-full">
                {/* Main Photo Badge (prominent ★ Main Photo) */}
                {isPrimary ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 text-[11px] font-extrabold shadow-md border border-amber-300">
                    <Star className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                    <span>★ Main Photo</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMakeMain(idx);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 hover:bg-stone-900 text-white text-[10px] font-bold backdrop-blur-sm transition-colors cursor-pointer"
                    title="Tap to make Main Photo"
                  >
                    <span>#{idx + 1}</span>
                    <span className="hidden sm:inline">· Tap to Set Main</span>
                  </button>
                )}

                {/* Top Right: Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(idx);
                  }}
                  className="p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg backdrop-blur-sm transition-colors shadow-sm cursor-pointer"
                  title="Delete Photo"
                  aria-label="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Center Drag Grip (desktop reorder cue) */}
              <div className="relative z-10 mx-auto opacity-0 group-hover:opacity-60 transition-opacity hidden sm:flex items-center justify-center p-1 bg-black/40 rounded-full text-white">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Bottom Interactive Action Area (Visible on tap / hover / mobile) */}
              <div className="relative z-10 p-2.5 w-full flex flex-col gap-1.5">
                {isPrimary ? (
                  <div className="w-full py-1.5 bg-black/60 backdrop-blur-sm text-emerald-400 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Active Profile Display Photo</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMakeMain(idx);
                    }}
                    className="w-full py-2 bg-white hover:bg-rose-50 text-stone-950 hover:text-rose-700 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 border border-stone-200 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Make Main Photo</span>
                  </button>
                )}

                {/* Two Clear Options bar shown when photo is clicked/tapped */}
                {isSelected && (
                  <div className="flex items-center gap-1 pt-1 border-t border-white/20 animate-in fade-in">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMakeMain(idx);
                        }}
                        className="flex-1 py-1 bg-amber-500 text-stone-950 text-[10px] font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                        <span>Make Main</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(idx);
                      }}
                      className="flex-1 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Upload / Add Photo Card Dropzone */}
        {realPhotos.length < maxPhotos && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleDropFile}
            className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
              isDraggingFile
                ? 'border-rose-500 bg-rose-50/70 scale-98'
                : 'border-stone-300 hover:border-rose-400 bg-stone-50/70 hover:bg-rose-50/30'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-200 text-rose-600 flex items-center justify-center mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-stone-800">
              {hasRealPhotos ? 'Add Another Photo' : 'Upload Real Photo'}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5">
              Drag & drop or tap to browse
            </span>
            <span className="text-[10px] text-stone-500 font-semibold mt-1 bg-stone-200/60 px-2 py-0.5 rounded-full">
              {realPhotos.length} / {maxPhotos} Slots
            </span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Reorder and mobile tip */}
      {hasRealPhotos && (
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tip: Tap any card to see options, or tap <strong>"Make Main Photo"</strong> to promote it to slot 1.</span>
          </span>
          <span className="text-stone-400 hidden sm:inline">Desktop: Drag & Drop to reorder</span>
        </div>
      )}
    </div>
  );
};
