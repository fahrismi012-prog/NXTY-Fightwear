"use client";

import Link from "next/link";
import { Target, Flame, Shield } from "lucide-react";

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <img
            src="/brand/logo-full.png"
            alt="Anxiety Fightwear"
            className="h-16 object-contain mx-auto mb-2"
            width={300}
            height={64}
          />
          <p className="text-sm text-brand-black font-medium">Born to Fight. Built to Last.</p>
        </div>

        <p className="text-sm text-neutral-400 leading-relaxed mb-6 text-center">
          Anxiety Fightwear adalah brand peralatan olahraga beladiri yang berasal dari Bandung. Berdiri sejak 2014 dan kami memproduksi barang di pabrik kami sendiri sehingga dapat menjamin kualitas dan harga yang bersaing.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          <div className="bg-[#161616] border border-[#262626] rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-brand-black/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-brand-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Misi Kami</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Menyediakan peralatan olahraga berkualitas tinggi dengan harga terjangkau, sehingga setiap fighter bisa latihan dengan gear terbaik.
              </p>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#262626] rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-brand-black/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 text-brand-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Semangat</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Kami percaya bahwa fighter sejati tidak lahir, melainkan dibuat. Dengan latihan yang konsisten dan perlengkapan yang tepat, siapa pun bisa mencapai level terbaiknya.
              </p>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#262626] rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-brand-black/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-brand-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Garansi</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Setiap produk kami dijamin kualitasnya. Jika ada cacat produksi, kami siap melakukan penukaran atau pengembalian dana sesuai kebijakan yang berlaku.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-brand-black hover:bg-brand-black-hover text-white text-sm font-bold rounded-xl transition-colors"
          >
            Jelajahi Produk
          </Link>
        </div>
      </div>
    </div>
  );
}
