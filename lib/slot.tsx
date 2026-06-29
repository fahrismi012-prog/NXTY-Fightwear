"use client";

import { Children, cloneElement, forwardRef, isValidElement, type ReactElement, type ReactNode, type Ref } from "react";

/**
 * Minimal Slot helper — meneruskan props ke child element saat asChild=true.
 *
 * Pakai untuk wrap Link/anchor sebagai button tanpa nested DOM:
 *   <Button asChild><Link href="/">Beranda</Link></Button>
 *
 * Inspired by @radix-ui/react-slot tapi minimal tanpa dependency.
 */

interface SlotProps {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

function mergeClassNames(...classes: Array<string | undefined>): string | undefined {
  const filtered = classes.filter(Boolean);
  return filtered.length > 0 ? filtered.join(" ") : undefined;
}

export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(props, ref) {
  const { children, ...slotProps } = props;

  // Jika tidak ada children, return null
  if (!children) {
    return null;
  }

  // Jika children bukan valid element (string, number, dll), render langsung
  if (!isValidElement(children)) {
    return <>{children}</>;
  }

  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props as Record<string, unknown>;

  // Merge className from slot + child
  const mergedClassName = mergeClassNames(
    typeof slotProps.className === "string" ? slotProps.className : undefined,
    typeof childProps.className === "string" ? childProps.className : undefined
  );

  // Merge ref: forward slot's ref to child, preserve child's existing ref
  const childRef = (child as ReactElement & { ref?: Ref<unknown> }).ref;
  const mergedRef = composeRefs(ref as Ref<unknown>, childRef);

  return cloneElement(child, {
    ...slotProps,
    ...childProps,
    className: mergedClassName,
    ref: mergedRef,
  });
});

function composeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    });
  };
}
