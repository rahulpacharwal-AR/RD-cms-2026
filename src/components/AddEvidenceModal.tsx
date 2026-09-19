import React, { useState, useRef } from 'react';
import { PoliceCase, AttachmentFile } from '../types';
import { X, Upload, Camera, MapPin, Film, Mic, FileText, CheckCircle2, FolderOpen, Image, Music, Plus, Check } from 'lucide-react';

interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onAddEvidence: (caseId: string, evidence: AttachmentFile) => void;
  currentOfficerName: string;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onAddEvidence,
  currentOfficerName
}) => {
  if (!isOpen || !caseItem) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState<AttachmentFile['fileType']>('PHOTO');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [includeGeoTag, setIncludeGeoTag] = useState(true);
  const [locationName, setLocationName] = useState(caseItem.incidentLocation || 'Scene of Crime');
  const [latitude, setLatitude] = useState(29.6857);
  const [longitude, setLongitude] = useState(76.9905);
  const [notes, setNotes] = useState('Collected under spot panchnama in presence of independent witnesses.');

  const handleFileSelected = (file: File | undefined) => {
    if (!file) return;

    setFileName(file.name);

    const readableSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    setFileSize(readableSize);

    if (file.type.startsWith('image/')) setFileType('PHOTO');
    else if (file.type.startsWith('video/')) setFileType('VIDEO');
    else if (file.type.startsWith('audio/')) setFileType('AUDIO');
    else setFileType('DOCUMENT');

    if (!title.trim()) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanTitle = baseName.replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      setTitle(cleanTitle);
    }

    const localUrl = URL.createObjectURL(file);
    setFileUrl(localUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) {
      alert('Please select or fill evidence title and filename.');
      return;
    }

    const newEvidence: AttachmentFile = {
      id: `ev-${Date.now()}`,
      title: title.trim(),
      fileType,
      fileName: fileName.trim(),
      fileSize,
      fileUrl,
      uploadDate: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      uploadedBy: currentOfficerName || caseItem.currentIO.name,
      geoTag: includeGeoTag
        ? {
            latitude,
            longitude,
            locationName: locationName.trim()
          }
        : undefined,
      notes: notes.trim() || undefined
    };

    onAddEvidence(caseItem.id, newEvidence);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Upload Media Evidence & Geo-tag
              </h2>
              <p className="text-xs text-slate-300">
                Case: {caseItem.firDetails?.firNumber || caseItem.complaintNumber} • Chain of Custody Record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/50 overflow-y-auto flex-1 text-xs">
          
          {/* Native Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />

          {/* Drag and Drop & Browse File Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileSelected(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2.5 ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/80 scale-[0.99]'
                : fileName
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 bg-white'
            }`}
          >
            {fileUrl && fileType === 'PHOTO' ? (
              <div className="relative">
                <img
                  src={fileUrl}
                  alt="Preview"
                  className="h-24 w-32 object-cover rounded-lg border border-emerald-300 shadow-sm mx-auto"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center gap-0.5">
                  <Check className="h-2.5 w-2.5" /> Selected
                </span>
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shadow-xs">
                {fileType === 'VIDEO' ? (
                  <Film className="h-5 w-5" />
                ) : fileType === 'AUDIO' ? (
                  <Music className="h-5 w-5" />
                ) : fileType === 'DOCUMENT' ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <FolderOpen className="h-5 w-5" />
                )}
              </div>
            )}

            <div className="space-y-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                {fileName ? 'Choose Different File' : 'Browse & Pick Local File (फ़ाइल चुनें)'}
              </button>
              <p className="text-[11px] text-slate-500">
                {fileName ? (
                  <span className="text-emerald-800 font-semibold font-mono">
                    ✓ {fileName} ({fileSize})
                  </span>
                ) : (
                  'Or click anywhere / drag & drop photo, video, audio or document'
                )}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Evidence Title / Description *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CCTV Camera 1 footage showing accused entry, Seized weapon photograph, Bank ledger"
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evidence Media Type *
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="PHOTO">Photograph (फ़ोटो / Spot Photo)</option>
                <option value="VIDEO">Video (वीडियो / CCTV / Drone)</option>
                <option value="AUDIO">Audio (ऑडियो / Call Recording)</option>
                <option value="DOCUMENT">Document (दस्तावेज़ / Invoices)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                File Attachment Name *
              </label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. CrimeScene_Backdoor_14.jpg"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Geo-tag option */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGeoTag}
                  onChange={(e) => setIncludeGeoTag(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Attach Geo-Tag Coordinates & Location Proof
              </label>
              <span className="text-[10px] text-slate-400">GPS Verified</span>
            </div>

            {includeGeoTag && (
              <div className="space-y-2 pt-1 text-xs">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Location Name / Landmark"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5"
                />
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Officer Notes / Seizure Details
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Link Evidence to Case
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
