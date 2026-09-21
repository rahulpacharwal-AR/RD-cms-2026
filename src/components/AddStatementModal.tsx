import React, { useState, useRef, useEffect } from 'react';
import { PoliceCase, WitnessStatement, SuspectInfo, StatementMediaAttachment } from '../types';
import {
  X, Mic, Video, VideoOff, FileText, CheckCircle2, UserPlus, Trash2,
  Play, Pause, Square, AlertCircle, Camera, Upload, Pen, Volume2, ShieldCheck,
  Eye, RefreshCw, Paperclip, Maximize2, Minimize2
} from 'lucide-react';
import { HandwrittenCanvas } from './HandwrittenCanvas';

interface AddStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: PoliceCase | null;
  onAddStatement: (caseId: string, statement: WitnessStatement) => void;
  onAddSuspect?: (caseId: string, suspect: SuspectInfo) => void;
  currentOfficerName: string;
}

type MediaTab = 'AUDIO' | 'VIDEO' | 'HANDWRITTEN' | 'UPLOAD' | 'NONE';

export const AddStatementModal: React.FC<AddStatementModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onAddStatement,
  onAddSuspect,
  currentOfficerName
}) => {
  // Basic Details
  const [personName, setPersonName] = useState('');
  const [role, setRole] = useState<WitnessStatement['role']>('WITNESS');
  const [statementText, setStatementText] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  // Active Media Tool Tab
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTab>('AUDIO');

  // Multiple Recorded Attachments list
  const [attachments, setAttachments] = useState<StatementMediaAttachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<StatementMediaAttachment | null>(null);

  // Audio Recording State
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioRecordingSeconds, setAudioRecordingSeconds] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioTimerRef = useRef<number | null>(null);

  // Video Recording State
  const [isVideoCameraActive, setIsVideoCameraActive] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoRecordingSeconds, setVideoRecordingSeconds] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<number | null>(null);

  // Handwritten Pad State
  const [isHandwrittenPadOpen, setIsHandwrittenPadOpen] = useState(false);

  // Also if suspect, allow adding to suspect roster directly
  const [alsoAddToSuspects, setAlsoAddToSuspects] = useState(false);
  const [suspectFatherName, setSuspectFatherName] = useState('');
  const [suspectMobile, setSuspectMobile] = useState('');
  const [suspectAddress, setSuspectAddress] = useState('');
  const [suspectDescription, setSuspectDescription] = useState('');

  const stopAllMediaTracks = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (audioMediaRecorderRef.current && audioMediaRecorderRef.current.state !== 'inactive') {
      audioMediaRecorderRef.current.stop();
    }
  };

  // Clean up streams & timers on unmount
  useEffect(() => {
    return () => {
      stopAllMediaTracks();
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    };
  }, []);

  if (!isOpen || !caseItem) return null;

  // Helper format seconds
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==================== AUDIO RECORDING ====================
  const startAudioRecording = async () => {
    setAudioError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your current browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported mime type
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
      const supportedMime = mimeTypes.find((mime) => MediaRecorder.isTypeSupported(mime)) || '';

      const mediaRecorder = supportedMime ? new MediaRecorder(stream, { mimeType: supportedMime }) : new MediaRecorder(stream);
      audioMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMime || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const newAtt: StatementMediaAttachment = {
            id: `att-audio-${Date.now()}`,
            type: 'AUDIO',
            title: `Live Audio Statement #${attachments.filter(a => a.type === 'AUDIO').length + 1}`,
            dataUrl: base64Data,
            mimeType: supportedMime || 'audio/webm',
            durationSeconds: audioRecordingSeconds,
            recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fileSize: `${Math.round(audioBlob.size / 1024)} KB`
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Slice every 250ms
      setIsAudioRecording(true);
      setAudioRecordingSeconds(0);

      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
      audioTimerRef.current = window.setInterval(() => {
        setAudioRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setAudioError(err.message || 'Microphone access denied. Please grant permission in your browser or iframe.');
      setIsAudioRecording(false);
    }
  };

  const stopAudioRecording = () => {
    if (audioTimerRef.current) {
      clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    if (audioMediaRecorderRef.current && audioMediaRecorderRef.current.state !== 'inactive') {
      audioMediaRecorderRef.current.stop();
    }
    setIsAudioRecording(false);
  };

  // ==================== VIDEO RECORDING ====================
  const startVideoCamera = async () => {
    setVideoError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      // Stop existing tracks if any
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      videoStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
      setIsVideoCameraActive(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setVideoError(err.message || 'Camera permission denied or camera device unavailable.');
      setIsVideoCameraActive(false);
    }
  };

  const stopVideoCamera = () => {
    if (isVideoRecording) {
      stopVideoRecording();
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsVideoCameraActive(false);
  };

  const startVideoRecording = () => {
    if (!videoStreamRef.current) {
      setVideoError('Camera stream is not active.');
      return;
    }

    videoChunksRef.current = [];
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    try {
      const mediaRecorder = supportedMime
        ? new MediaRecorder(videoStreamRef.current, { mimeType: supportedMime })
        : new MediaRecorder(videoStreamRef.current);
      videoMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: supportedMime || 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const newAtt: StatementMediaAttachment = {
            id: `att-video-${Date.now()}`,
            type: 'VIDEO',
            title: `Live Video Statement #${attachments.filter(a => a.type === 'VIDEO').length + 1}`,
            dataUrl: base64Data,
            mimeType: supportedMime || 'video/webm',
            durationSeconds: videoRecordingSeconds,
            recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fileSize: `${Math.round(videoBlob.size / 1024)} KB`
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
        reader.readAsDataURL(videoBlob);
      };

      mediaRecorder.start(500); // chunk every 500ms
      setIsVideoRecording(true);
      setVideoRecordingSeconds(0);

      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      videoTimerRef.current = window.setInterval(() => {
        setVideoRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      setVideoError('Failed to initialize video recorder: ' + err.message);
      setIsVideoRecording(false);
    }
  };

  const stopVideoRecording = () => {
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    if (videoMediaRecorderRef.current && videoMediaRecorderRef.current.state !== 'inactive') {
      videoMediaRecorderRef.current.stop();
    }
    setIsVideoRecording(false);
  };

  // ==================== HANDWRITTEN NOTE ====================
  const handleSaveHandwritten = (dataUrl: string) => {
    const newAtt: StatementMediaAttachment = {
      id: `att-hw-${Date.now()}`,
      type: 'HANDWRITTEN',
      title: `Handwritten Statement / Memo #${attachments.filter(a => a.type === 'HANDWRITTEN').length + 1}`,
      dataUrl,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileSize: 'Canvas PNG'
    };
    setAttachments((prev) => [...prev, newAtt]);
    setIsHandwrittenPadOpen(false);
  };

  // ==================== FILE UPLOAD ====================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        let type: StatementMediaAttachment['type'] = 'PHOTO';
        if (file.type.startsWith('audio/')) type = 'AUDIO';
        else if (file.type.startsWith('video/')) type = 'VIDEO';
        else if (file.type.startsWith('image/')) type = 'PHOTO';

        const newAtt: StatementMediaAttachment = {
          id: `att-upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type,
          title: file.name,
          dataUrl: base64,
          mimeType: file.type,
          recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fileSize: `${Math.round(file.size / 1024)} KB`
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    if (previewAttachment?.id === id) {
      setPreviewAttachment(null);
    }
  };

  // Determine statement mode based on attachments
  const computeMode = (): WitnessStatement['mode'] => {
    if (attachments.length === 0) return 'TEXT_TRANSCRIPT';
    const hasAudio = attachments.some((a) => a.type === 'AUDIO');
    const hasVideo = attachments.some((a) => a.type === 'VIDEO');
    const hasHandwritten = attachments.some((a) => a.type === 'HANDWRITTEN' || a.type === 'PHOTO');

    const activeCount = [hasAudio, hasVideo, hasHandwritten].filter(Boolean).length;
    if (activeCount > 1) return 'MULTI_MEDIA';
    if (hasVideo) return 'VIDEO';
    if (hasAudio) return 'AUDIO';
    if (hasHandwritten) return 'HANDWRITTEN_MEMO';
    return 'TEXT_TRANSCRIPT';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      alert('Please enter the name of the person examined.');
      return;
    }
    if (!statementText.trim() && attachments.length === 0) {
      alert('Please provide a statement narrative or attach at least one audio/video/handwritten recording.');
      return;
    }

    // Stop all media before submitting
    stopVideoCamera();
    stopAudioRecording();

    const finalNarrative = statementText.trim() ||
      `Statement recorded via ${attachments.map(a => a.type).join(', ')} recording. Examined by ${currentOfficerName || caseItem.currentIO.name} under Section 180 BNSS / 161 CrPC.`;

    const newStatement: WitnessStatement = {
      id: `ws-${Date.now()}`,
      personName: personName.trim(),
      role,
      dateRecorded: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      recordedByOfficer: currentOfficerName || caseItem.currentIO.name,
      mode: computeMode(),
      statementText: finalNarrative,
      recordingUrl: attachments.length > 0 ? `${attachments.length} attachment(s) verified` : undefined,
      attachments,
      handwrittenDataUrl: attachments.find((a) => a.type === 'HANDWRITTEN')?.dataUrl,
      verified: true
    };

    onAddStatement(caseItem.id, newStatement);

    if (role === 'SUSPECT' && alsoAddToSuspects && onAddSuspect) {
      const newSuspect: SuspectInfo = {
        id: `susp-${Date.now()}`,
        name: personName.trim(),
        fatherName: suspectFatherName.trim() || 'Unknown',
        mobile: suspectMobile.trim() || 'N/A',
        address: suspectAddress.trim() || 'Address verified during examination',
        description: suspectDescription.trim() || 'Examined under statement',
        status: 'IDENTIFIED',
        custodyType: 'NOT_ARRESTED'
      };
      onAddSuspect(caseItem.id, newSuspect);
    }

    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isMaximized ? 'p-0' : 'p-3 sm:p-4'} bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150`}>
      <div className={`bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-800 transition-all duration-200 ${
        isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none my-0' : 'max-w-2xl w-full rounded-2xl max-h-[92vh]'
      }`}>
        
        {/* Header */}
        <div className="bg-[#0c1a30] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Record Statement (बयान दर्ज करें)
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30">
                  Audio • Video • Handwritten
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Witness / Suspect Statement u/s 180 BNSS / 161 CrPC • Case: {caseItem.complaintNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMaximized ? "Restore Size (सामान्य आकार)" : "Maximize Screen (पूर्ण स्क्रीन / बड़ा करें)"}
            >
              {isMaximized ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                stopVideoCamera();
                stopAudioRecording();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/60">
          
          {/* Person details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Person Examined (Name) *
              </label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Rameshwar Dayal (Eyewitness)"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role in Case *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="WITNESS">Eyewitness / Witness (गवाह)</option>
                <option value="COMPLAINANT">Complainant / Victim (पीड़ित)</option>
                <option value="SUSPECT">Suspect / Accused (संदिग्ध / आरोपी)</option>
                <option value="INFORMER">Secret Informer / Panch (मुखबिर / पंच)</option>
              </select>
            </div>
          </div>

          {/* Media Capture Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">
                  Live Media Recording & Handwritten Memo (डिजिटल साक्ष्य)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Supports Multiple Recordings
              </span>
            </div>

            {/* Media Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveMediaTab('AUDIO')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  activeMediaTab === 'AUDIO'
                    ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Live Audio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMediaTab('VIDEO');
                  if (!isVideoCameraActive) startVideoCamera();
                }}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  activeMediaTab === 'VIDEO'
                    ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMediaTab('HANDWRITTEN');
                  setIsHandwrittenPadOpen(true);
                }}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  activeMediaTab === 'HANDWRITTEN'
                    ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Pen className="h-3.5 w-3.5" />
                <span>Handwritten</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab('UPLOAD')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  activeMediaTab === 'UPLOAD'
                    ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            {/* TAB 1: AUDIO RECORDING UI */}
            {activeMediaTab === 'AUDIO' && (
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isAudioRecording ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      <Mic className={`h-4 w-4 ${isAudioRecording ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Live Microphone Statement Recording</h4>
                      <p className="text-[10px] text-slate-400">
                        {isAudioRecording ? 'Recording witness audio statement live...' : 'Click Start to begin live audio recording with device mic'}
                      </p>
                    </div>
                  </div>

                  {isAudioRecording && (
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                      <span className="font-mono text-xs font-bold text-red-400">
                        {formatTime(audioRecordingSeconds)}
                      </span>
                    </div>
                  )}
                </div>

                {audioError && (
                  <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{audioError}</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-1">
                  {!isAudioRecording ? (
                    <button
                      type="button"
                      onClick={startAudioRecording}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Start Audio Recording (ऑडियो रिकॉर्ड शुरू करें)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopAudioRecording}
                      className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-red-500/60 shadow-lg transition-all cursor-pointer animate-pulse"
                    >
                      <Square className="h-4 w-4 fill-red-500 text-red-500" />
                      <span>Stop & Attach Audio ({formatTime(audioRecordingSeconds)})</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: VIDEO CAMERA RECORDING UI */}
            {activeMediaTab === 'VIDEO' && (
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isVideoRecording ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <Video className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Live Camera Video Statement (वीडियो साक्ष्य)</h4>
                      <p className="text-[10px] text-slate-400">
                        {isVideoRecording ? 'Recording video deposition...' : 'Requires camera and microphone permission'}
                      </p>
                    </div>
                  </div>

                  {isVideoRecording && (
                    <div className="flex items-center gap-2 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-500/40">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-[10px] font-bold text-red-300">REC</span>
                      <span className="font-mono text-xs font-bold text-white">
                        {formatTime(videoRecordingSeconds)}
                      </span>
                    </div>
                  )}
                </div>

                {videoError && (
                  <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{videoError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={startVideoCamera}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white"
                    >
                      Retry Camera
                    </button>
                  </div>
                )}

                {/* Video Viewport */}
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${isVideoCameraActive ? 'block' : 'hidden'}`}
                  />

                  {!isVideoCameraActive && (
                    <div className="text-center p-4 space-y-2">
                      <div className="h-10 w-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <Camera className="h-5 w-5" />
                      </div>
                      <p className="text-xs text-slate-300">Camera preview is inactive</p>
                      <button
                        type="button"
                        onClick={startVideoCamera}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Enable Camera & Mic
                      </button>
                    </div>
                  )}

                  {isVideoCameraActive && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Camera Live
                    </div>
                  )}
                </div>

                {/* Controls */}
                {isVideoCameraActive && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={stopVideoCamera}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <VideoOff className="h-3.5 w-3.5 text-slate-400" />
                      <span>Stop Camera</span>
                    </button>

                    {!isVideoRecording ? (
                      <button
                        type="button"
                        onClick={startVideoRecording}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
                      >
                        <div className="h-2.5 w-2.5 rounded-full bg-white animate-ping"></div>
                        <span>Start Video Recording (रिकॉर्ड शुरू करें)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopVideoRecording}
                        className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-all animate-pulse"
                      >
                        <Square className="h-4 w-4 fill-white" />
                        <span>Stop & Attach Video ({formatTime(videoRecordingSeconds)})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: HANDWRITTEN CANVAS */}
            {activeMediaTab === 'HANDWRITTEN' && (
              <div className="space-y-2">
                <HandwrittenCanvas
                  onSave={handleSaveHandwritten}
                  onCancel={() => setActiveMediaTab('AUDIO')}
                  title="Digital Handwritten Statement / Sign (हस्तलिखित बयान या अंगूठा/हस्ताक्षर)"
                />
              </div>
            )}

            {/* TAB 4: FILE UPLOAD */}
            {activeMediaTab === 'UPLOAD' && (
              <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 text-center space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Upload Recorded Audio, Video, or Handwritten Photo
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Supports MP3, M4A, WAV, MP4, WebM, PNG, JPG files
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow cursor-pointer transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Choose Files from Device</span>
                  <input
                    type="file"
                    multiple
                    accept="audio/*,video/*,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* ATTACHMENTS LIST (MULTIPLE RECORDINGS) */}
            {attachments.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                    Attached Media Records ({attachments.length})
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    ✓ Ready to save with statement
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att, idx) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                          att.type === 'AUDIO'
                            ? 'bg-blue-100 text-blue-700'
                            : att.type === 'VIDEO'
                            ? 'bg-purple-100 text-purple-700'
                            : att.type === 'HANDWRITTEN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {att.type === 'AUDIO' && <Volume2 className="h-4 w-4" />}
                          {att.type === 'VIDEO' && <Video className="h-4 w-4" />}
                          {att.type === 'HANDWRITTEN' && <Pen className="h-4 w-4" />}
                          {att.type === 'PHOTO' && <Camera className="h-4 w-4" />}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate text-[11px]">
                            {att.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span>{att.type}</span>
                            {att.durationSeconds && <span>• {formatTime(att.durationSeconds)}</span>}
                            {att.fileSize && <span>• {att.fileSize}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(att)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-600 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PREVIEW MODAL / POPUP IF SELECTED */}
            {previewAttachment && (
              <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-blue-400" />
                    Preview: {previewAttachment.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewAttachment(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {previewAttachment.type === 'AUDIO' && (
                  <audio controls src={previewAttachment.dataUrl} className="w-full h-9" />
                )}

                {previewAttachment.type === 'VIDEO' && (
                  <video controls src={previewAttachment.dataUrl} className="w-full max-h-56 rounded-lg bg-black" />
                )}

                {(previewAttachment.type === 'HANDWRITTEN' || previewAttachment.type === 'PHOTO') && (
                  <div className="max-h-56 overflow-auto rounded-lg bg-white p-2 border border-slate-300">
                    <img
                      src={previewAttachment.dataUrl}
                      alt={previewAttachment.title}
                      className="max-h-48 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Statement Narrative */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Statement Narrative / Deposition Summary (बयान का पूर्ण विवरण) *
              </label>
              <span className="text-[10px] text-slate-500">
                {attachments.length > 0 ? 'Optional summary or verbatim notes' : 'Required'}
              </span>
            </div>
            <textarea
              rows={4}
              required={attachments.length === 0}
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              placeholder="State word-for-word account given by the examined person: what was seen, time, identities recognized, weapon/vehicle details, sequence of events..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          {/* If suspect, prompt to create profile card */}
          {role === 'SUSPECT' && onAddSuspect && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alsoAddToSuspects}
                  onChange={(e) => setAlsoAddToSuspects(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <UserPlus className="h-3.5 w-3.5 text-red-600" />
                Also register as Official Suspect Profile in this Case
              </label>

              {alsoAddToSuspects && (
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <input
                    type="text"
                    value={suspectFatherName}
                    onChange={(e) => setSuspectFatherName(e.target.value)}
                    placeholder="Father's Name (s/o)"
                    className="bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    value={suspectMobile}
                    onChange={(e) => setSuspectMobile(e.target.value)}
                    placeholder="Mobile number"
                    className="bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    value={suspectAddress}
                    onChange={(e) => setSuspectAddress(e.target.value)}
                    placeholder="Address / Area"
                    className="col-span-2 bg-white border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    value={suspectDescription}
                    onChange={(e) => setSuspectDescription(e.target.value)}
                    placeholder="Physical marks / photo ID"
                    className="col-span-2 bg-white border border-slate-300 rounded p-1.5"
                  />
                </div>
              )}
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                stopVideoCamera();
                stopAudioRecording();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Save Verified Statement ({attachments.length} Media Attached)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
