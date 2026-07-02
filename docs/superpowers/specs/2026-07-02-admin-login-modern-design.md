# Admin Login — Redesain Modern dengan Split Layout & Animasi

**Tanggal**: 2026-07-02
**Branch**: `feature/client-branding-v2`
**File target**: `app/admin/login/page.tsx` (rewrite penuh)

## Tujuan

Membuat halaman login admin tidak polos dengan **split layout** desktop (kiri visual hitam, kanan form putih) dan **4 jenis animasi CSS murni** (tanpa library tambahan). Style bahasa brutalism dipertahankan, ditingkatkan dengan motion design modern.

## Konsep visual

### Desktop (md+)

```
┌─────────────────────────────┬─────────────────────────────┐
│                             │                             │
│   [bg: black + dot grid]    │   [bg: white]               │
│                             │                             │
│        NXTY                 │       Admin Panel           │
│        (logo 6xl)           │                             │
│                             │       Password Admin        │
│   ─────────                 │       ┌──────────────────┐  │
│   FIGHT GEAR                │       │ ••••••••         │  │
│   FOR THE                   │       └──────────────────┘  │
│   RELENTLESS                │                             │
│   (tagline eyebrow)         │       [  Masuk  ]           │
│                             │                             │
│   © 2026 NXTY Fightwear     │   Akses terbatas. Staff.    │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘
   50% (md:flex)              50%
```

- **Kiri**: bg-black, dot grid pattern putih samar (1px dot, 24px spacing), logo NXTY putih besar vertikal-centered, tagline uppercase di bawah logo, copyright di bawah
- **Kanan**: bg-white, form login (eyebrow "Admin Panel", label password, input, tombol submit, footer text)

### Mobile (<md)

Stack vertical — area visual jadi hero strip atas (lebih pendek, ~30vh), form di bawah. Dot grid pattern tetap di hero.

## Animasi (CSS murni, Tailwind v4 arbitrary syntax)

### 1. Entrance (sekali saat mount, total ~900ms)

- Logo NXTY: opacity 0→1, scale 0.95→1, duration 600ms, ease-out
- Tagline: opacity 0→1, translateY 8px→0, duration 500ms, delay 200ms
- Pattern background: opacity 0→1, duration 800ms, delay 100ms
- Form container: opacity 0→1, translateY 16px→0, duration 600ms, delay 300ms
- Input + tombol: stagger fade-in, each delay 80ms setelah container
- Footer text: opacity 0→1, delay 700ms

### 2. Interactive (per interaksi user)

- Hover tombol submit: `shadow-[4px_4px_0_black]` → `shadow-[6px_6px_0_black]` + `translate-x-[-1px] translate-y-[-1px]`
- Active/click tombol: `shadow-none` + `translate-x-[2px] translate-y-[2px]`
- Hover tombol: background invert halus (`bg-black` → `bg-neutral-900`, transition 200ms)
- Focus input: border color `border-neutral-600` → `border-black` (transition 150ms) + subtle ring glow `shadow-[0_0_0_3px_rgba(0,0,0,0.05)]`
- Hover card visual (logo area): subtle scale logo (1 → 1.02)

### 3. Ambient (loop infinite, subtle)

- Dot grid pattern: scroll vertikal pelan, `translateY 0 → 4px`, duration 8s, ease-in-out, alternate, infinite
- Tagline opacity: pulse subtle, 0.85 → 1.0 → 0.85, duration 4s, infinite
- Logo NXTY shadow: subtle pulse, `0 0 0 transparent` → `0 0 20px rgba(255,255,255,0.1)` → `0 0 0 transparent`, duration 5s, infinite (efek "breathing glow")

### 4. Error feedback (saat password salah)

- Form container: shake animation, translateX -6px → 6px → -4px → 4px → -2px → 2px → 0, duration 400ms
- Error message: slide-down + fade-in, translateY -8px → 0, opacity 0 → 1, duration 300ms
- Border input: flash merah, `border-[#dc2626]` solid + `shadow-[0_0_0_3px_rgba(220,38,38,0.15)]` selama 600ms, lalu kembali ke state normal

## Implementasi teknis

### CSS keyframes

Semua via arbitrary value di className Tailwind:
- `[animation:fadeIn_600ms_ease-out_forwards]`
- `[animation:slideUp_500ms_ease-out_forwards]`
- `[animation:shake_400ms_ease-in-out]`
- `[animation:ambientScroll_8s_ease-in-out_infinite_alternate]`

Atau pakai `<style jsx>` untuk keyframes definitions (jika perlu beberapa keyframes kompleks).

**Keputusan**: pakai inline `<style>` tag di dalam component untuk keyframes definitions, dan pakai className dengan `animation-[...]` arbitrary value untuk applying. Tidak edit `globals.css`.

### Dot grid pattern

Inline style:
```jsx
backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
backgroundSize: '24px 24px',
```

### Mobile responsive

- `<md`: stack vertical, area visual jadi `h-48 md:h-auto` (hero strip), pattern tetap
- `md+`: split 50:50 dengan `md:grid md:grid-cols-2`

### Accessibility

- `prefers-reduced-motion`: disable ambient & entrance animations, retain focus/hover feedback
- `aria-label` pada input & tombol tetap
- Keyboard navigation tetap berfungsi
- Animation tidak mengganggu screen reader (pakai `aria-hidden` pada decorative pattern)

## File yang berubah

- **Modify**: `app/admin/login/page.tsx` (rewrite penuh)

**Tidak diubah**: layout admin, API login, password handling, semua file lain.

## Verifikasi

1. Dev server jalan, `/admin/login` HTTP 200
2. **Desktop**: split layout 50:50, logo di kiri, form di kanan
3. **Mobile**: stack vertical, hero strip dengan pattern di atas, form di bawah
4. **Animasi entrance**: terlihat saat refresh halaman (muncul halus, total <1s)
5. **Ambient**: pattern scroll halus, logo breathing glow
6. **Hover/focus**: tombol ada shadow grow, input ada ring focus
7. **Error**: input shake + border merah saat password salah
8. **prefers-reduced-motion**: animasi ambient/entrance off (test via DevTools rendering)
9. **No regresi**: password benar → redirect ke `/admin` seperti biasa

## Risiko

- **Bundle size**: zero impact (CSS inline, no library)
- **Performance**: animasi GPU-accelerated (transform/opacity), tidak ada layout thrashing
- **Reduced motion**: harus respect `prefers-reduced-motion` — saya tambahkan media query
