"use client";

import { ICON_NAMES } from "@/components/link-icon";
import type { Link } from "@/lib/links";
import { ImageField } from "./image-field";
import { fieldClass, labelClass } from "./ui";

/** The title / address / icon / featured fields, shared by add and edit. */
export function LinkFields({ link }: { link?: Link }) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor={`title-${link?.id ?? "new"}`}>
          Title
        </label>
        <input
          id={`title-${link?.id ?? "new"}`}
          name="title"
          defaultValue={link?.title}
          placeholder="Company Profile"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor={`url-${link?.id ?? "new"}`}>
          Web address
        </label>
        <input
          id={`url-${link?.id ?? "new"}`}
          name="url"
          defaultValue={link?.url}
          placeholder="https://damanvirtual.com"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor={`icon-${link?.id ?? "new"}`}>
          Icon
        </label>
        <select
          id={`icon-${link?.id ?? "new"}`}
          name="icon"
          defaultValue={link?.icon ?? ""}
          className={fieldClass}
        >
          <option value="">None</option>
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <ImageField
        initial={link?.image}
        fieldId={`image-${link?.id ?? "new"}`}
      />

      <label className="flex items-center gap-2.5 text-sm font-light text-dv-grey">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={link?.featured}
          className="size-4 accent-dv-teal"
        />
        Highlight this link in teal
      </label>
    </>
  );
}
