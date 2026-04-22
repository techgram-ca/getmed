import { Camera, PenLine, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

export interface DeliveryProof {
  outcome: "delivered" | "failed";
  note?: string | null;
  photo_path?: string | null;
  signature_path?: string | null;
  captured_at?: string | null;
}

interface Props {
  proof: DeliveryProof;
  photoUrl: string | null;
  signatureUrl: string | null;
}

export default function DeliveryProofSection({ proof, photoUrl, signatureUrl }: Props) {
  const delivered = proof.outcome === "delivered";

  return (
    <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${delivered ? "bg-emerald-50" : "bg-red-50"}`}>
          {delivered
            ? <CheckCircle className="w-4 h-4 text-emerald-500" />
            : <XCircle className="w-4 h-4 text-red-500" />}
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0d1f1c]">Proof of Delivery</h2>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
            delivered
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}>
            {delivered ? "Delivered" : "Failed"}
          </span>
        </div>
        {proof.captured_at && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[#6b8280]">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {new Date(proof.captured_at).toLocaleString()}
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Photo */}
        {delivered && (
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Delivery photo
            </p>
            {photoUrl ? (
              <a href={photoUrl} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Delivery proof photo"
                  className="rounded-xl max-h-64 object-cover border border-[#e2efed] hover:opacity-90 transition-opacity"
                />
              </a>
            ) : proof.photo_path ? (
              <p className="text-sm text-[#6b8280]">Photo unavailable (link expired)</p>
            ) : (
              <p className="text-sm text-[#6b8280]">No photo captured</p>
            )}
          </div>
        )}

        {/* Signature */}
        {delivered && (
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2 flex items-center gap-1.5">
              <PenLine className="w-3.5 h-3.5" />
              Recipient signature
            </p>
            {signatureUrl ? (
              <div className="inline-block rounded-xl border border-[#e2efed] bg-[#fafffe] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={signatureUrl}
                  alt="Recipient signature"
                  className="max-h-28 object-contain"
                />
              </div>
            ) : proof.signature_path ? (
              <p className="text-sm text-[#6b8280]">Signature unavailable (link expired)</p>
            ) : (
              <p className="text-sm text-[#6b8280]">No signature captured</p>
            )}
          </div>
        )}

        {/* Note */}
        {proof.note && (
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Driver note
            </p>
            <p className="text-sm text-[#0d1f1c] bg-[#f8fffe] rounded-xl px-3 py-2.5 border border-[#e2efed] leading-relaxed">
              {proof.note}
            </p>
          </div>
        )}

        {!proof.note && !delivered && (
          <p className="text-sm text-[#6b8280]">No note provided.</p>
        )}
      </div>
    </section>
  );
}
