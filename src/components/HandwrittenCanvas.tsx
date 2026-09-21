import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Trash2, Check, Pen, Eraser } from 'lucide-react';

interface HandwrittenCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
  title?: string;
}

export const HandwrittenCanvas: React.FC<HandwrittenCanvasProps> = ({
  onSave,
  onCancel,
  title = 'Handwritten Statement / Digital Signature (हस्तलिखित बयान / हस्ताक्षर)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#0b2545'); // Classic police blue ink
  const [lineWidth, setLineWidth] = useState(2.5);
  const [hasContent, setHasContent] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Initialize canvas with white background and ruled lines optional
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Fill white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw faint subtle notebook lines for handwriting guidelines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let y = 35; y < rect.height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(rect.width - 10, y);
      ctx.stroke();
    }

    // Save initial blank state
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left,
        y: (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    // Save to history (max 10 steps)
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-9), currentState]);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Redraw faint guidelines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let y = 35; y < rect.height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(rect.width - 10, y);
      ctx.stroke();
    }

    setHasContent(false);
    const clearedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([clearedState]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistory(newHistory);
    if (newHistory.length === 1) {
      setHasContent(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Pen className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">{title}</span>
        </div>

        {/* Ink & Width controls */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400">Ink:</span>
            <button
              type="button"
              onClick={() => setColor('#0b2545')}
              className={`h-4 w-4 rounded-full bg-[#0b2545] border transition-transform ${color === '#0b2545' ? 'ring-2 ring-amber-400 scale-110 border-white' : 'border-slate-500'}`}
              title="Police Blue Ink"
            />
            <button
              type="button"
              onClick={() => setColor('#111827')}
              className={`h-4 w-4 rounded-full bg-slate-900 border transition-transform ${color === '#111827' ? 'ring-2 ring-amber-400 scale-110 border-white' : 'border-slate-500'}`}
              title="Black Ink"
            />
            <button
              type="button"
              onClick={() => setColor('#b91c1c')}
              className={`h-4 w-4 rounded-full bg-red-700 border transition-transform ${color === '#b91c1c' ? 'ring-2 ring-amber-400 scale-110 border-white' : 'border-slate-500'}`}
              title="Red Ink"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400">Width:</span>
            {[1.5, 2.5, 4].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setLineWidth(w)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lineWidth === w ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                {w === 1.5 ? 'Fine' : w === 2.5 ? 'Med' : 'Bold'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-lg overflow-hidden border-2 border-slate-600 bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-56 cursor-crosshair touch-none"
        />
        {!hasContent && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
            <span>✍️ Draw / write statement here using stylus, mouse, or touch</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasContent}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 disabled:opacity-40 text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasContent}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Attach Handwritten Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};
