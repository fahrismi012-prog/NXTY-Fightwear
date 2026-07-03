"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea primitive dengan label, error, hint.
 * Tidak ada size variant — tinggi dikontrol via `rows` prop.
 */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    className,
    containerClassName,
    id: idProp,
    rows = 3,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const id = idProp || autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  const describedBy = [
    ariaDescribedBy,
    hint ? hintId : null,
    hasError ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="text-caption font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={hasError || ariaInvalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full bg-surface-1 text-text-primary text-body",
          "rounded-subtle",
          "border",
          hasError
            ? "border-error-500 focus:border-error-500"
            : "border-border-default focus:border-brand-black",
          "focus:outline-none",
          "placeholder:text-text-muted",
          "transition-colors duration-fast",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "resize-none px-4 py-3",
          className
        )}
        {...rest}
      />
      {hint && !hasError && (
        <p id={hintId} className="text-body-sm text-text-muted">
          {hint}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="text-body-sm text-error-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
