"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
}

interface BankAccountsManagerProps {
  initialAccounts: BankAccount[];
}

interface EditState {
  id: string | null; // null = new
  bank_name: string;
  account_number: string;
  account_holder: string;
  instructions: string;
  is_active: boolean;
}

const EMPTY_EDIT: EditState = {
  id: null,
  bank_name: "",
  account_number: "",
  account_holder: "",
  instructions: "",
  is_active: true,
};

export default function BankAccountsManager({
  initialAccounts,
}: BankAccountsManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = () => {
    startTransition(() => router.refresh());
  };

  const startNew = () => {
    setError(null);
    setEditing({ ...EMPTY_EDIT });
  };

  const startEdit = (acc: BankAccount) => {
    setError(null);
    setEditing({
      id: acc.id,
      bank_name: acc.bank_name,
      account_number: acc.account_number,
      account_holder: acc.account_holder,
      instructions: acc.instructions ?? "",
      is_active: acc.is_active,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);

    if (!editing.bank_name.trim() || !editing.account_number.trim() || !editing.account_holder.trim()) {
      setError("Nama bank, nomor rekening, dan atas nama wajib diisi");
      return;
    }

    setBusyId(editing.id ?? "new");
    try {
      const url = editing.id
        ? `/api/admin/bank-accounts/${editing.id}`
        : "/api/admin/bank-accounts";
      const method = editing.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_name: editing.bank_name.trim(),
          account_number: editing.account_number.trim(),
          account_holder: editing.account_holder.trim(),
          instructions: editing.instructions.trim() || null,
          is_active: editing.is_active,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Gagal menyimpan");
      }
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (acc: BankAccount) => {
    if (!confirm(`Hapus rekening ${acc.bank_name} ${acc.account_number}?`)) return;
    setError(null);
    setBusyId(acc.id);
    try {
      const res = await fetch(`/api/admin/bank-accounts/${acc.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Gagal menghapus");
      }
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white border-2 border-neutral-800">
      {/* Error banner */}
      {error && (
        <div className="border-b-2 border-neutral-800 bg-neutral-100 p-3 flex items-start gap-2 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Account list */}
      {initialAccounts.length === 0 && editing === null && (
        <div className="p-6 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-600 mb-1">
            Belum ada rekening
          </p>
          <p className="text-[11px] text-neutral-500">
            Tambah rekening untuk ditampilkan di halaman checkout mode manual.
          </p>
        </div>
      )}

      {initialAccounts.length > 0 && (
        <ul className="divide-y-2 divide-neutral-200">
          {initialAccounts.map((acc) => (
            <li
              key={acc.id}
              className="flex items-center gap-3 p-4 hover:bg-neutral-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    {acc.bank_name}
                  </span>
                  {!acc.is_active && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 border border-neutral-400 px-1.5 py-0.5">
                      Nonaktif
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono font-bold text-black">
                  {acc.account_number}
                </p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  a.n. {acc.account_holder}
                </p>
                {acc.instructions && (
                  <p className="text-[11px] text-neutral-500 mt-1 italic">
                    {acc.instructions}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(acc)}
                  disabled={isPending || busyId === acc.id}
                  className="p-2 border-2 border-neutral-800 hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-50"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(acc)}
                  disabled={isPending || busyId === acc.id}
                  className="p-2 border-2 border-neutral-800 hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-50"
                  aria-label="Hapus"
                >
                  {busyId === acc.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Inline edit form */}
      {editing && (
        <div className="border-t-2 border-black p-4 bg-neutral-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-black mb-3">
            {editing.id ? "Edit Rekening" : "Rekening Baru"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field
              label="Nama Bank"
              value={editing.bank_name}
              onChange={(v) => setEditing({ ...editing, bank_name: v })}
              placeholder="BCA"
              required
            />
            <Field
              label="Nomor Rekening"
              value={editing.account_number}
              onChange={(v) => setEditing({ ...editing, account_number: v })}
              placeholder="123-456-7890"
              required
            />
            <Field
              label="Atas Nama"
              value={editing.account_holder}
              onChange={(v) => setEditing({ ...editing, account_holder: v })}
              placeholder="Anxiety Fightwear"
              required
            />
            <Field
              label="Instruksi (opsional)"
              value={editing.instructions}
              onChange={(v) => setEditing({ ...editing, instructions: v })}
              placeholder="Transfer tepat sampai 3 digit terakhir"
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={editing.is_active}
              onChange={(e) =>
                setEditing({ ...editing, is_active: e.target.checked })
              }
              className="w-4 h-4 accent-black"
            />
            <span className="font-bold">Aktif (tampil di checkout)</span>
          </label>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busyId !== null}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 min-h-[40px]"
            >
              {busyId === (editing.id ?? "new") ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Simpan
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={busyId !== null}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-neutral-800 text-[11px] font-black uppercase tracking-widest hover:border-black transition-colors disabled:opacity-50 min-h-[40px]"
            >
              <X size={12} />
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Add new button */}
      {editing === null && (
        <div className="border-t-2 border-neutral-200 p-4">
          <button
            type="button"
            onClick={startNew}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 min-h-[40px]"
          >
            <Plus size={12} />
            Tambah Rekening
          </button>
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, value, onChange, placeholder, required }: FieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-1">
        {label} {required && <span className="text-black">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white text-black px-3 py-2 border-2 border-neutral-800 focus:border-black focus:outline-none text-sm"
      />
    </div>
  );
}
