import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getLinks } from "@/lib/links";
import { logoutAction } from "./actions";
import { AddLinkForm } from "./add-link-form";
import { LinkRow } from "./link-row";

export const dynamic = "force-dynamic";

export const metadata = { title: "Links dashboard — Daman Virtual" };

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const links = await getLinks();

  return (
    <main className="mx-auto w-full max-w-[680px] px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium tracking-[0.18em] text-dv-white uppercase">
            Links
          </h1>
          <p className="mt-1.5 text-xs font-light text-dv-grey">
            Changes appear on{" "}
            <Link
              href="/links"
              target="_blank"
              className="text-dv-teal underline-offset-4 hover:underline"
            >
              the public page
            </Link>{" "}
            straight away.
          </p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs text-dv-grey transition-colors hover:text-dv-white"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="mt-10">
        <h2 className="text-[0.6875rem] font-medium tracking-[0.08em] text-dv-grey uppercase">
          Add a link
        </h2>
        <AddLinkForm />
      </section>

      <section className="mt-12">
        <h2 className="text-[0.6875rem] font-medium tracking-[0.08em] text-dv-grey uppercase">
          {links.length} link{links.length === 1 ? "" : "s"}
        </h2>

        {links.length === 0 ? (
          <p className="mt-4 text-sm font-light text-dv-grey">
            Nothing yet. Add your first link above.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {links.map((link, index) => (
              <li key={link.id}>
                <LinkRow
                  link={link}
                  isFirst={index === 0}
                  isLast={index === links.length - 1}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
