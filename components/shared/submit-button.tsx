"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
};

export function SubmitButton({ label, pendingLabel, disabled = false }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--yellow)] px-5 text-sm font-medium text-black transition hover:bg-[var(--yellow-dim)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
