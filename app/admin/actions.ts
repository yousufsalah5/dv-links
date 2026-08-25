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

/**
 * The upload arrives as a data URI built in the browser, so it is treated as
 * untrusted: only real image types are allowed through, and only up to a size
 * a 128px thumbnail could plausibly reach. This keeps anything script-bearing
 * (an SVG, say) out of the `src` on the public page.
 */
const MAX_IMAGE_BYTES = 400_000;
const ALLOWED_IMAGE_TYPES = ["webp", "png", "jpeg", "jpg", "gif"];

function readImage(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const match = /^data:image\/([a-z0-9+.-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(
    value,
  );
  if (!match) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(match[1].toLowerCase())) return null;
  if (value.length > MAX_IMAGE_BYTES) return null;

  return value;
}

function readForm(formData: FormData):
  | { ok: true; value: links.LinkInput }
  | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const url = normaliseUrl(String(formData.get("url") ?? ""));
  const icon = String(formData.get("icon") ?? "").trim();
  const rawImage = String(formData.get("image") ?? "");
  const image = readImage(rawImage);

  if (!title) return { ok: false, error: "Give the link a title." };
  if (!url) {
    return {
      ok: false,
      error: "That web address doesn't look right. Try something like https://damanvirtual.com",
    };
  }
  if (rawImage.trim() && !image) {
    return {
      ok: false,
      error: "That image couldn't be saved. Try a JPG or PNG under a few megabytes.",
    };
  }

  return {
    ok: true,
    value: {
      title,
      url,
      icon: icon || undefined,
      image: image ?? undefined,
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
