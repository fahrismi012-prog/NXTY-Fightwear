import { cn } from "@/lib/utils";

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  /** Apply top safe area (untuk header di bawah notch) */
  top?: boolean;
  /** Apply bottom safe area (untuk konten di atas home indicator) */
  bottom?: boolean;
}

/**
 * Wrapper yang apply safe-area padding untuk device iOS dengan notch/home indicator.
 * Pakai CSS env() function yang native di-support iOS 11+ dan Android.
 */
export default function SafeArea({
  children,
  className,
  top = false,
  bottom = true,
}: SafeAreaProps) {
  return (
    <div
      className={cn(
        top && "pt-[env(safe-area-inset-top)]",
        bottom && "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      {children}
    </div>
  );
}
