"use client";

import { useState, type FormEvent } from "react";
import { Button, Eyebrow, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * NewsletterSignup — email capture form untuk footer dan landing pages.
 *
 * Layout:
 * - stacked  : input di atas, button di bawah (mobile / column kecil)
 * - inline   : input + button sebaris (desktop / column lebar)
 */

export interface NewsletterSignupProps {
  title?: string;
  description?: string;
  layout?: "stacked" | "inline";
  className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterSignup({
  title = "Update terbaru",
  description = "Berlangganan untuk drop baru, promo, dan tips latihan.",
  layout = "stacked",
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Email wajib diisi");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setMessage("Format email tidak valid");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Gagal mendaftar. Coba lagi nanti.");
        return;
      }
      setStatus("success");
      setMessage("Terima kasih! Cek email kamu untuk konfirmasi.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Gagal terhubung. Coba lagi nanti.");
    }
  };

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div>
        <Eyebrow color="red" className="mb-2">
          {title}
        </Eyebrow>
        <p className="text-body-sm text-text-secondary">{description}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex gap-2",
          layout === "stacked" ? "flex-col" : "flex-col sm:flex-row"
        )}
      >
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          aria-label="Alamat email"
          disabled={isSubmitting || isSuccess}
          containerClassName="flex-1"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting || isSuccess}
        >
          {isSuccess ? "Terdaftar" : "Berlangganan"}
        </Button>
      </form>

      {message && (
        <p
          className={cn(
            "text-body-sm",
            status === "error" ? "text-error-500" : "text-success-500"
          )}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default NewsletterSignup;
