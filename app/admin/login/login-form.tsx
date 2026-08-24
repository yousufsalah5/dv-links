"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "../actions";
import { fieldClass, primaryButtonClass } from "../ui";

const initialState: FormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-10 flex flex-col gap-3">
      <label htmlFor="password" className="sr-only">
        Password
      </label>

      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        placeholder="Password"
        className={fieldClass}
      />

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Signing in…" : "Sign in"}
      </button>

      {state.error ? (
        <p role="alert" className="mt-1 text-center text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
