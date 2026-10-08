"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

const inputClass =
  "w-full bg-white text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-sm";

export default function AdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Gagal mengganti password");
        return;
      }
      setSuccess("Password berhasil diganti. Gunakan password baru untuk login berikutnya.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-2 border-black bg-white p-5 shadow-[8px_8px_0_#000]">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={16} className="text-black" />
        <p className="text-xs font-black uppercase tracking-wider text-black">
          Ganti Password
        </p>
      </div>
      <p className="text-[11px] text-neutral-600 mb-4">
        Password dipakai untuk login admin dan konfirmasi aksi sensitif.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <div>
          <label
            htmlFor="current-password"
            className="block text-[11px] font-black uppercase tracking-wider text-black mb-1"
          >
            Password Saat Ini
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label
            htmlFor="new-password"
            className="block text-[11px] font-black uppercase tracking-wider text-black mb-1"
          >
            Password Baru (min. 8 karakter)
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-[11px] font-black uppercase tracking-wider text-black mb-1"
          >
            Ulangi Password Baru
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p className="text-xs font-bold text-red-600 border-2 border-red-600 bg-red-50 p-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs font-bold text-green-700 border-2 border-green-700 bg-green-50 p-2">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 min-h-[40px]"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Simpan Password Baru
        </button>
      </form>
    </div>
  );
}
