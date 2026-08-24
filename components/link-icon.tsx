import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  Download,
  FileText,
  Globe,
  Link as LinkGlyph,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Shield,
  type LucideProps,
} from "lucide-react";

/**
 * lucide dropped its brand logos in v1, so the few we need are drawn here in
 * the same 24x24 outline style so they sit consistently beside the lucide set.
 */
type IconProps = Pick<LucideProps, "className" | "strokeWidth">;

function BrandSvg({
  className,
  strokeWidth = 1.5,
  children,
  fill = false,
}: IconProps & { children: React.ReactNode; fill?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function LinkedinIcon(props: IconProps) {
  return (
    <BrandSvg {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </BrandSvg>
  );
}

function InstagramIcon(props: IconProps) {
  return (
    <BrandSvg {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </BrandSvg>
  );
}

function YoutubeIcon(props: IconProps) {
  return (
    <BrandSvg {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </BrandSvg>
  );
}

function XIcon(props: IconProps) {
  // The X mark only reads as a solid glyph, so it is filled rather than stroked.
  return (
    <BrandSvg {...props} fill>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </BrandSvg>
  );
}

/**
 * Icon names that can be stored on a link. These lowercase keys are exactly
 * what gets picked in the dashboard.
 */
export const ICONS = {
  globe: Globe,
  "file-text": FileText,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  x: XIcon,
  mail: Mail,
  phone: Phone,
  message: MessageCircle,
  calendar: Calendar,
  "map-pin": MapPin,
  download: Download,
  briefcase: Briefcase,
  building: Building2,
  shield: Shield,
  play: Play,
  link: LinkGlyph,
} satisfies Record<string, React.ComponentType<IconProps>>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function LinkIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Icon = name && name in ICONS ? ICONS[name as IconName] : LinkGlyph;
  return <Icon className={className} strokeWidth={1.5} />;
}

export { ArrowUpRight };
