"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Trigger shake animation on error (by remounting form via key)
  useEffect(() => {
    if (error) setShakeKey((k) => k + 1);
  }, [error]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok || !data.success) {
        const message = data.error ?? "Login gagal";
        setError(message);
        showToast("info", message);
        setLoading(false);
        return;
      }

      showToast("success", "Login berhasil");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Tidak dapat menghubungi server";
      setError(message);
      showToast("info", message);
      setLoading(false);
    }
  }

  // Animation helper: return animation class or empty if reduced motion
  const anim = (className: string) => (reducedMotion ? "" : className);

  return (
    <>
      {/* Keyframes definitions — scoped via element name in JSX, not global */}
      <style>{`
        @keyframes nxty-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes nxty-fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes nxty-slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nxty-slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nxty-slideRight {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes nxty-shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
        @keyframes nxty-ambient-scroll {
          from { transform: translateY(0); }
          to { transform: translateY(24px); }
        }
        @keyframes nxty-ambient-pulse-opacity {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes nxty-ambient-glow {
          0%, 100% { text-shadow: 0 0 0 transparent; }
          50% { text-shadow: 0 0 24px rgba(255, 255, 255, 0.15); }
        }
        @keyframes nxty-error-flash {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          50% { box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nxty-motion * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="nxty-motion min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white">
        {/* LEFT PANEL — Visual hitam dengan pattern */}
        <div
          className={anim(
            "relative overflow-hidden bg-black text-white p-8 md:p-12 flex flex-col justify-between min-h-[40vh] md:min-h-screen [animation:nxty-fadeIn_800ms_ease-out_forwards]",
          )}
          style={{ animationDelay: "100ms", opacity: reducedMotion ? 1 : 0 }}
          aria-hidden={false}
        >
          {/* Animated dot grid pattern */}
          <div
            className={anim(
              "absolute inset-0 pointer-events-none [animation:nxty-ambient-scroll_8s_ease-in-out_infinite_alternate]",
            )}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              opacity: reducedMotion ? 0.6 : 1,
            }}
            aria-hidden="true"
          />

          {/* Decorative bracket marks */}
          <div
            className={anim(
              "absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-white/30 [animation:nxty-fadeIn_1000ms_ease-out_forwards]",
            )}
            style={{ animationDelay: "400ms", opacity: reducedMotion ? 1 : 0 }}
            aria-hidden="true"
          />
          <div
            className={anim(
              "absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-white/30 [animation:nxty-fadeIn_1000ms_ease-out_forwards]",
            )}
            style={{ animationDelay: "400ms", opacity: reducedMotion ? 1 : 0 }}
            aria-hidden="true"
          />

          {/* Top: small label */}
          <div
            className={anim(
              "relative z-10 [animation:nxty-slideRight_500ms_ease-out_forwards]",
            )}
            style={{ animationDelay: "200ms", opacity: reducedMotion ? 1 : 0 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
              Admin Panel
            </p>
          </div>

          {/* Center: logo + tagline */}
          <div className="relative z-10 flex flex-col items-start gap-6">
            <h1
              className={anim(
                "text-7xl md:text-8xl font-black tracking-tighter leading-none [animation:nxty-fadeScaleIn_700ms_ease-out_forwards] [animation:nxty-ambient-glow_5s_ease-in-out_infinite]",
              )}
              style={{
                animationDelay: "300ms, 2s",
                opacity: reducedMotion ? 1 : 0,
              }}
            >
              NXTY
            </h1>
            <div
              className={anim(
                "[animation:nxty-slideUp_500ms_ease-out_forwards] [animation:nxty-ambient-pulse-opacity_4s_ease-in-out_infinite]",
              )}
              style={{
                animationDelay: "500ms, 3s",
                opacity: reducedMotion ? 1 : 0,
              }}
            >
              <div className="h-1 w-12 bg-white mb-4" aria-hidden="true" />
              <p className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/90 leading-relaxed">
                Fight Gear
                <br />
                For The
                <br />
                Relentless
              </p>
            </div>
          </div>

          {/* Bottom: copyright */}
          <div
            className={anim(
              "relative z-10 [animation:nxty-fadeIn_800ms_ease-out_forwards]",
            )}
            style={{ animationDelay: "700ms", opacity: reducedMotion ? 1 : 0 }}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">
              © 2026 NXTY Fightwear · Internal Access
            </p>
          </div>
        </div>

        {/* RIGHT PANEL — Form login putih */}
        <div className="flex items-center justify-center p-6 md:p-12 bg-white">
          <div className="w-full max-w-sm">
            {/* Eyebrow */}
            <div
              className={anim(
                "mb-8 [animation:nxty-slideUp_500ms_ease-out_forwards]",
              )}
              style={{ animationDelay: "400ms", opacity: reducedMotion ? 1 : 0 }}
            >
              <div className="h-1 w-8 bg-black mb-3" aria-hidden="true" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black">
                Sign In
              </p>
            </div>

            {/* Form with shake animation */}
            <form
              key={shakeKey}
              ref={formRef}
              onSubmit={handleSubmit}
              className={anim(
                error
                  ? "[animation:nxty-shake_400ms_ease-in-out]"
                  : "[animation:nxty-slideUp_600ms_ease-out_forwards]",
              )}
              style={{
                animationDelay: error ? "0ms" : "500ms",
                opacity: !error && !reducedMotion ? 0 : 1,
              }}
            >
              <label
                htmlFor="password"
                className="block text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2"
              >
                Password Admin
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
                className={anim(
                  "w-full bg-white border-2 text-black px-3 py-3 text-sm font-bold placeholder:text-neutral-400 focus:outline-none disabled:opacity-50 transition-all duration-150",
                  // input border: neutral-600 default, black focus, red error flash
                  error
                    ? "border-[#dc2626] [animation:nxty-error-flash_600ms_ease-in-out]"
                    : "border-neutral-600 focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]",
                )}
              />

              {error && (
                <p
                  role="alert"
                  className={anim(
                    "mt-4 border-2 border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] text-xs font-bold px-3 py-2 [animation:nxty-slideDown_300ms_ease-out_forwards]",
                  )}
                  style={{ opacity: reducedMotion ? 1 : 0 }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className={anim(
                  "mt-5 w-full bg-black text-white font-black uppercase tracking-wider text-sm py-3 border-2 border-black transition-all duration-200 shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] hover:-translate-x-[1px] hover:-translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_black] disabled:hover:translate-x-0 disabled:hover:translate-y-0",
                )}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <p
              className={anim(
                "mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400 [animation:nxty-fadeIn_800ms_ease-out_forwards]",
              )}
              style={{ animationDelay: "800ms", opacity: reducedMotion ? 1 : 0 }}
            >
              Akses terbatas. Hanya untuk staff NXTY.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
