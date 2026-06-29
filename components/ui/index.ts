/**
 * UI Primitives barrel export.
 *
 * Komponen-komponen dasar yang reusable dan jadi pondasi seluruh
 * redesign NXTY Fightwear. Pakai design tokens dari globals.css.
 *
 * Aturan import:
 *   import { Button, Input, Sheet } from "@/components/ui";
 *
 * Hindari import langsung dari file individu, kecuali untuk
 * tree-shaking optimization advanced.
 */

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

export { Card } from "./Card";
export type { CardProps } from "./Card";

export { Badge } from "./Badge";
export type { BadgeProps } from "./Badge";

export { Eyebrow } from "./Eyebrow";
export type { EyebrowProps } from "./Eyebrow";

export { IconButton } from "./IconButton";
export type { IconButtonProps } from "./IconButton";

export { PriceTag } from "./PriceTag";
export type { PriceTagProps } from "./PriceTag";

export { Sheet } from "./Sheet";
export type { SheetProps } from "./Sheet";

export { Dialog } from "./Dialog";
export type { DialogProps } from "./Dialog";

export { Skeleton } from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";
