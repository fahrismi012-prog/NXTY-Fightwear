"use client";

import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-text-muted mb-6 text-center leading-relaxed">
          Ada pertanyaan atau perlu bantuan? Hubungi tim Anxiety Fightwear.
        </p>

        <div className="flex flex-col gap-3">
          <div className="bg-surface-1 border border-border-subtle rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-red-600/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">email</p>
              <p className="text-sm font-medium text-text-primary">anxietyfightwear@gmail.com</p>
            </div>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-red-600/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">WhatsApp</p>
              <p className="text-sm font-medium text-text-primary">+62 895-2484-0900</p>
            </div>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-red-600/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">Alamat</p>
              <p className="text-sm font-medium text-text-primary">
                Jl. Barunagri No. 60, RT 02/RW 11, Desa Sukajaya, Kec. Lembang, Bandung, West Java, Indonesia
              </p>
            </div>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-red-600/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">Jam Operasional</p>
              <p className="text-sm font-medium text-text-primary">Senin-Sabtu, 09.00 - 18.00 WIB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
