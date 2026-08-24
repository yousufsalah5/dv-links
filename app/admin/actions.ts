"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  isAuthenticated,
  isPasswordCorrect,
} from "@/lib/auth";
import * as links from "@/lib/links";

export type FormState = { error?: string };

/** Every mutation goes through this first. */
async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Not signed in.");
  }
}

/** Refresh both the dashboard and the public page. */
function refreshPages(): void {
  revalidatePath("/admin");
  revalidatePath("/links");
}

/**
 * Accepts normal web links plus mailto: and tel:, which are common on a
 * link-in-bio page. Anything else (javascript: in particular) is rejected.
 */
function normaliseUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  // A bare domain like "damanvirtual.com" is a reasonable thing to type.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value)
    ? value
    : `https://${value}`;

  try {
    const parsed = new URL(candidate);
    const allowed = ["http:", "https:", "mailto:", "tel:"];
    return allowed.includes(parsed.protocol) ? candidate : null;
  } catch {
    return null;
  }
}

function readForm(formData: FormData):
  | { ok: true; value: links.LinkInput }
  | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const url = normaliseUrl(String(formData.get("url") ?? ""));
  const icon = String(formData.get("icon") ?? "").trim();

  if (!title) return { ok: false, error: "Give the link a title." };
  if (!url) {
    return {
      ok: false,
      error: "That web address doesn't look right. Try something like https://damanvirtual.com",
    };
  }

  return {
    ok: true,
    value: {
      title,
      url,
      icon: icon || undefined,
      featured: formData.get("featured") === "on",
    },
  };
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");

  if (!password) return { error: "Enter your password." };
  if (!isPasswordCorrect(password)) return { error: "That password is wrong." };

  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function createLinkAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = readForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await links.createLink(parsed.value);
  refreshPages();
  return {};
}

export async function updateLinkAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = readForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await links.updateLink(id, parsed.value);
  refreshPages();
  return {};
}

export async function deleteLinkAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await links.deleteLink(String(formData.get("id") ?? ""));
  refreshPages();
}

export async function moveLinkAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await links.moveLink(
    String(formData.get("id") ?? ""),
    formData.get("direction") === "up" ? "up" : "down",
  );
  refreshPages();
}

export async function toggleFeaturedAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await links.toggleFeatured(String(formData.get("id") ?? ""));
  refreshPages();
}
