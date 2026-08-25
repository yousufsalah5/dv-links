"use client";

import { useRef, useState } from "react";
import { ghostButtonClass, labelClass } from "./ui";

/** Stored size. Displayed around 26px, so this stays crisp on retina screens. */
const OUTPUT_SIZE = 128;

/**
 * Lets you upload your own image for a link.
 *
 * The picture is cropped to a centred square and shrunk right here in the
 * browser before it is saved, so whatever you upload — a photo, a screenshot,
 * a tall logo — always ends up square, small, and sitting the same as every
 * other icon. Nothing large ever reaches the database.
 */
export function ImageField({
  initial,
  fieldId,
}: {
  initial?: string;
  fieldId: string;
}) {
  const [image, setImage] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image.");
      return;
    }

    setBusy(true);
    const objectUrl = URL.createObjectURL(file);

    try {
      const bitmap = await createImageBitmap(await fetch(objectUrl).then((r) => r.blob()));

      // Take the largest centred square we can, so nothing looks stretched.
      const side = Math.min(bitmap.width, bitmap.height);
      const sx = (bitmap.width - side) / 2;
      const sy = (bitmap.height - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas");
      ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      setImage(canvas.toDataURL("image/webp", 0.85));
    } catch {
      setError("Couldn't read that image. Try a JPG or PNG.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClass}>Or upload your own</span>

      {/* What actually gets saved. */}
      <input type="hidden" name="image" value={image} />

      <div className="flex items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- a data URI, already sized
          <img
            src={image}
            alt=""
            className="size-11 shrink-0 rounded-[10px] border border-dv-line object-cover"
          />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-dv-line text-[0.6rem] text-dv-grey/50">
            1:1
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className={ghostButtonClass}
          >
            {busy ? "Working…" : image ? "Replace" : "Choose image"}
          </button>

          {image ? (
            <button
              type="button"
              onClick={() => {
                setImage("");
                if (fileRef.current) fileRef.current.value = "";
              }}
              className={ghostButtonClass}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={fileRef}
        id={fieldId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-[0.7rem] font-light text-dv-grey/60">
          Any shape works — it gets cropped square and rounded automatically.
          Used instead of the icon above.
        </p>
      )}
    </div>
  );
}
