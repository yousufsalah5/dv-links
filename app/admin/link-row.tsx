"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Star } from "lucide-react";
import { LinkIcon } from "@/components/link-icon";
import type { Link } from "@/lib/links";
import {
  deleteLinkAction,
  moveLinkAction,
  toggleFeaturedAction,
  updateLinkAction,
  type FormState,
} from "./actions";
import { LinkFields } from "./link-fields";
import { ghostButtonClass, primaryButtonClass } from "./ui";

const initialState: FormState = {};

export function LinkRow({
  link,
  isFirst,
  isLast,
}: {
  link: Link;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [state, formAction, pending] = useActionState(
    updateLinkAction,
    initialState,
  );

  // Collapse the edit form once the save has gone through.
  useEffect(() => {
    if (!pending && !state.error) setEditing(false);
  }, [pending, state]);

  return (
    <div
      className={`rounded-xl border bg-dv-surface transition-colors ${
        link.featured ? "border-dv-teal/40" : "border-dv-line"
      }`}
    >
      {/* On a phone the controls drop to their own row, so long titles and
          addresses get the full width instead of being cut to a few letters. */}
      <div className="flex flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center">
            {link.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- a data URI, already sized
              <img
                src={link.image}
                alt=""
                className="size-6 rounded-[6px] object-cover"
              />
            ) : (
              <LinkIcon
                name={link.icon}
                className={`size-4 ${
                  link.featured ? "text-dv-teal" : "text-dv-grey"
                }`}
              />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-dv-white">{link.title}</p>
            <p className="truncate text-xs font-light text-dv-grey/60">
              {link.url}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:ml-auto">
          <IconAction
            action={moveLinkAction}
            id={link.id}
            direction="up"
            disabled={isFirst}
            label={`Move ${link.title} up`}
          >
            <ArrowUp className="size-3.5" strokeWidth={1.5} />
          </IconAction>

          <IconAction
            action={moveLinkAction}
            id={link.id}
            direction="down"
            disabled={isLast}
            label={`Move ${link.title} down`}
          >
            <ArrowDown className="size-3.5" strokeWidth={1.5} />
          </IconAction>

          <IconAction
            action={toggleFeaturedAction}
            id={link.id}
            label={
              link.featured
                ? `Remove highlight from ${link.title}`
                : `Highlight ${link.title}`
            }
          >
            <Star
              className={`size-3.5 ${link.featured ? "text-dv-teal" : ""}`}
              strokeWidth={1.5}
              fill={link.featured ? "currentColor" : "none"}
            />
          </IconAction>

          <button
            type="button"
            onClick={() => setEditing((open) => !open)}
            className={ghostButtonClass}
          >
            {editing ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="border-t border-dv-line px-4 py-5">
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={link.id} />
            <LinkFields link={link} />

            <button
              type="submit"
              disabled={pending}
              className={`${primaryButtonClass} w-auto self-start`}
            >
              {pending ? "Saving…" : "Save changes"}
            </button>

            {state.error ? (
              <p role="alert" className="text-xs text-destructive">
                {state.error}
              </p>
            ) : null}
          </form>

          {/* Deleting is its own form, and it has to sit outside the edit form
              above — a form nested inside another form is invalid HTML and
              silently never submits. */}
          <div className="mt-5 flex items-center gap-2 border-t border-dv-line pt-4">
            {confirmingDelete ? (
              <>
                <span className="text-xs text-dv-grey">
                  Delete “{link.title}” for good?
                </span>
                <DeleteButton id={link.id} />
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className={ghostButtonClass}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={`${ghostButtonClass} hover:!text-destructive`}
              >
                Delete this link
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** A one-button form that posts an id (and optionally a direction). */
function IconAction({
  action,
  id,
  direction,
  disabled,
  label,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  direction?: "up" | "down";
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {direction ? (
        <input type="hidden" name="direction" value={direction} />
      ) : null}
      <button
        type="submit"
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`${ghostButtonClass} px-2`}
      >
        {children}
      </button>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteLinkAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-destructive/40 px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10"
      >
        Delete
      </button>
    </form>
  );
}
