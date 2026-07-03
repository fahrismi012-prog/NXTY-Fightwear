"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Input primitive dengan label, error, hint, dan icon slots.
 *
 * Sizes:
 * - md: 44px tinggi (default)
 * - lg: 52px tinggi (mobile primary)
 *
 * Sertakan inputMode yang relevan untuk mobile keyboard:
 *   <Input type="tel" inputMode="numeric" />
 *   <Input type="email" inputMode="email" />
 */

export type InputSize = "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: InputSize;
  containerClassName?: string;
}

const inputSizeClasses: Record<InputSize, string> = {
  md: "h-11 text-body",
  lg: "h-[3.25rem] text-body-lg",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    size = "md",
    className,
    containerClassName,
    id: idProp,
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
      <div className="relative">
        {leftIcon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center"
            aria-hidden
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={hasError || ariaInvalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full bg-surface-1 text-text-primary",
            "rounded-subtle",
            "border",
            hasError
              ? "border-error-500 focus:border-error-500"
              : "border-border-default focus:border-brand-black",
            "focus:outline-none",
            "placeholder:text-text-muted",
            "transition-colors duration-fast",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            inputSizeClasses[size],
            leftIcon ? "pl-10" : "pl-4",
            rightIcon ? "pr-10" : "pr-4",
            className
          )}
          {...rest}
        />
        {rightIcon && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center"
            aria-hidden
          >
            {rightIcon}
          </span>
        )}
      </div>
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
