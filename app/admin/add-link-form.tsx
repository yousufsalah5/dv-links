"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLinkAction, type FormState } from "./actions";
import { LinkFields } from "./link-fields";
import { primaryButtonClass } from "./ui";

const initialState: FormState = {};

export function AddLinkForm() {
  const [state, formAction, pending] = useActionState(
    createLinkAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form once a link has been added successfully.
  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 flex flex-col gap-4 rounded-xl border border-dv-line bg-dv-surface p-5"
    >
      <LinkFields />

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Adding…" : "Add link"}
      </button>

      {state.error ? (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
