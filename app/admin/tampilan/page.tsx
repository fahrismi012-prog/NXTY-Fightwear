import { createAdminClient } from "@/lib/supabase/server";
import { normalizeTheme } from "@/lib/theme";
import ThemeEditor from "./ThemeEditor";

export const dynamic = "force-dynamic";

async function fetchTheme() {
  const supabase = createAdminClient();
  if (!supabase) return normalizeTheme(null);
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "theme")
    .maybeSingle();
  let value: unknown = data?.value ?? null;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      value = null;
    }
  }
  return normalizeTheme(value);
}

export default async function AdminTampilanPage() {
  const theme = await fetchTheme();

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">
          Tampilan
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Tema Toko
        </h1>
        <p className="text-sm text-neutral-600 mt-2">
          Atur warna, font, logo, dan nama brand toko. Perubahan tampil di
          storefront maksimal 1 menit setelah disimpan — tanpa deploy ulang.
        </p>
      </div>

      <ThemeEditor initialTheme={theme} />
    </div>
  );
}
