import Image from "next/image";
import { ArrowUpRight, LinkIcon } from "@/components/link-icon";
import { getLinks, type Link } from "@/lib/links";

// Always read the database on request, so edits made in the dashboard show up
// on the next page load rather than being served from a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const links = await getLinks();

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6 pt-16 pb-8 sm:pt-20">
      {/* A single, very quiet teal halo behind the mark. The only ornament. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-dv-teal) 0%, transparent 65%)",
        }}
      />

      <div className="relative flex w-full max-w-[400px] flex-1 flex-col">
        <header className="flex flex-col items-center text-center">
          <Image
            src="/brand/dv-mark.png"
            alt="Daman Virtual"
            width={734}
            height={734}
            priority
            className="h-[88px] w-[88px]"
          />

          <h1 className="mt-7 text-[1.375rem] leading-none font-medium tracking-[0.18em] text-dv-white uppercase">
            Daman Virtual
          </h1>

          <p className="mt-3.5 text-[0.75rem] leading-none font-light tracking-[0.13em] text-dv-grey">
            Seamless. Secure. Safeguarded.
          </p>
        </header>

        <div className="mt-10 h-px w-full bg-dv-line" />

        {links.length === 0 ? (
          <p className="mt-10 text-center text-sm font-light text-dv-grey">
            No links yet.
          </p>
        ) : (
          <nav className="mt-8 flex flex-col gap-3">
            {links.map((link) => (
              <LinkButton key={link.id} link={link} />
            ))}
          </nav>
        )}

        {/* mt-auto pins the footer to the bottom; pt-14 keeps it clear of the
            links when the list is long enough to fill the screen. */}
        <footer className="mt-auto pt-14 text-center">
          <p className="text-[0.6875rem] font-light tracking-[0.1em] text-dv-grey/45">
            © {new Date().getFullYear()} Daman Virtual
          </p>
        </footer>
      </div>
    </main>
  );
}

function LinkButton({ link }: { link: Link }) {
  const base =
    "group flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-200 active:scale-[0.985]";

  const tone = link.featured
    ? "border-dv-teal/45 bg-dv-teal/[0.07] hover:border-dv-teal/80 hover:bg-dv-teal/[0.11]"
    : "border-dv-line bg-dv-surface hover:border-dv-line-strong hover:bg-dv-surface-hover";

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${tone}`}
    >
      <LinkIcon
        name={link.icon}
        className={`size-[18px] shrink-0 transition-colors duration-200 ${
          link.featured
            ? "text-dv-teal"
            : "text-dv-grey group-hover:text-dv-white"
        }`}
      />

      <span
        className={`min-w-0 flex-1 truncate text-[0.9375rem] font-normal tracking-[0.02em] transition-colors duration-200 ${
          link.featured ? "text-dv-white" : "text-dv-grey group-hover:text-dv-white"
        }`}
      >
        {link.title}
      </span>

      <ArrowUpRight
        strokeWidth={1.5}
        aria-hidden
        className={`size-4 shrink-0 transition-all duration-200 group-hover:-translate-y-px group-hover:translate-x-px ${
          link.featured
            ? "text-dv-teal"
            : "text-dv-grey/40 group-hover:text-dv-teal"
        }`}
      />
    </a>
  );
}
