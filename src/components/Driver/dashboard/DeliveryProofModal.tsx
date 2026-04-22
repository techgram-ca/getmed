"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, PenLine, FileText, X, Trash2, CheckCircle, XCircle } from "lucide-react";

type Outcome = "delivered" | "failed";

interface Props {
  patientName: string;
  onClose: () => void;
  onSubmit: (fd: FormData) => Promise<{ error: string | null }>;
  submitting: boolean;
}

export default function DeliveryProofModal({ patientName, onClose, onSubmit, submitting }: Props) {
  const [outcome, setOutcome] = useState<Outcome>("delivered");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasSig, setHasSig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Revoke object URL when photo changes
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Attach canvas draw events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#0d1f1c";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    function getPos(e: MouseEvent | TouchEvent) {
      const rect = canvas!.getBoundingClientRect();
      const sx = canvas!.width / rect.width;
      const sy = canvas!.height / rect.height;
      if ("touches" in e) {
        return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
      }
      return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
    }

    function start(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      isDrawing.current = true;
      const { x, y } = getPos(e);
      ctx!.beginPath();
      ctx!.moveTo(x, y);
    }
    function move(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      if (!isDrawing.current) return;
      const { x, y } = getPos(e);
      ctx!.lineTo(x, y);
      ctx!.stroke();
      setHasSig(true);
    }
    function stop() { isDrawing.current = false; }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mouseleave", stop);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", stop);
    };
  }, []);

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function isValid() {
    if (outcome === "failed") return note.trim().length > 0;
    return photo !== null && hasSig;
  }

  async function handleSubmit() {
    setError(null);
    if (!isValid()) return;

    const fd = new FormData();
    fd.append("outcome", outcome);
    fd.append("note", note.trim());

    if (outcome === "delivered") {
      if (!photo || !hasSig) return;
      fd.append("photo", photo);
      const canvas = canvasRef.current!;
      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) fd.append("signature", blob, "signature.png");
          resolve();
        }, "image/png");
      });
    }

    const result = await onSubmit(fd);
    if (result.error) setError(result.error);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e2efed] sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-sm font-bold text-[#0d1f1c]">Proof of Delivery</h2>
            <p className="text-xs text-[#6b8280]">{patientName}</p>
          </div>
          <button onClick={onClose} disabled={submitting} className="p-2 rounded-lg hover:bg-[#f0fbf9] text-[#6b8280] disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Outcome toggle */}
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2">Delivery outcome</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOutcome("delivered")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  outcome === "delivered"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-[#0d1f1c] border-[#e2efed] hover:border-emerald-300"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Delivered
              </button>
              <button
                onClick={() => setOutcome("failed")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  outcome === "failed"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-[#0d1f1c] border-[#e2efed] hover:border-red-300"
                }`}
              >
                <XCircle className="w-4 h-4" />
                Failed
              </button>
            </div>
          </div>

          {/* Photo — delivered only */}
          {outcome === "delivered" && (
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Delivery photo <span className="text-red-400 ml-0.5">*</span>
              </p>
              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Delivery proof" className="w-full object-cover max-h-52 rounded-xl" />
                  <button
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-500 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[#cfe3df] cursor-pointer hover:bg-[#f0fbf9] transition-colors">
                  <Camera className="w-6 h-6 text-[#2a9d8f] mb-1.5" />
                  <span className="text-xs text-[#6b8280] font-medium">Tap to take or upload photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                </label>
              )}
            </div>
          )}

          {/* Signature — delivered only */}
          {outcome === "delivered" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5" />
                  Recipient signature <span className="text-red-400 ml-0.5">*</span>
                </p>
                {hasSig && (
                  <button onClick={clearSignature} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="rounded-xl border-2 border-dashed border-[#cfe3df] overflow-hidden bg-[#fafffe]">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full touch-none"
                  style={{ cursor: "crosshair" }}
                />
              </div>
              {!hasSig && (
                <p className="text-[11px] text-[#6b8280] mt-1.5">Ask the recipient to sign inside the box above</p>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Note
              {outcome === "failed" && <span className="text-red-400 ml-0.5">*</span>}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={
                outcome === "failed"
                  ? "Describe why delivery failed (required)…"
                  : "Optional note about this delivery…"
              }
              className="w-full rounded-xl border border-[#cfe3df] px-3 py-2.5 text-sm text-[#0d1f1c] placeholder-[#9bb5b2] focus:outline-none focus:border-[#2a9d8f] resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !isValid()}
            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              outcome === "delivered"
                ? "bg-emerald-500 text-white active:bg-emerald-600"
                : "bg-red-500 text-white active:bg-red-600"
            }`}
          >
            {outcome === "delivered" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {submitting
              ? "Submitting…"
              : outcome === "delivered"
              ? "Confirm Delivered"
              : "Confirm Failed Delivery"}
          </button>
        </div>
      </div>
    </div>
  );
}
