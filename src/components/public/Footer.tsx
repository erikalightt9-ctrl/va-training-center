import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

interface FooterLink {
  readonly href: string;
  readonly label: string;
}

const productLinks: readonly FooterLink[] = [
  { href: "/features",  label: "Features"    },
  { href: "/pricing",   label: "Pricing"     },
  { href: "/contact",   label: "Book a Demo" },
  { href: "/login",     label: "Log In"      },
  { href: "/register",  label: "Start Free"  },
] as const;

const companyLinks: readonly FooterLink[] = [
  { href: "/about",   label: "About Us"   },
  { href: "/contact", label: "Contact"    },
] as const;

const resourceLinks: readonly FooterLink[] = [
  { href: "/features",  label: "Platform Overview" },
  { href: "/pricing",   label: "Compare Plans"     },
  { href: "/contact",   label: "Request a Demo"    },
] as const;

const legalLinks: readonly FooterLink[] = [
  { href: "/terms",   label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy"   },
] as const;

function LinkColumn({ title, links }: { readonly title: string; readonly links: readonly FooterLink[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{title}</h3>
      <ul className="space-y-2.5 text-sm text-slate-300">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ siteName }: { siteName?: string | null }) {
  const displayName = siteName ?? "HUMI Hub";
  return (
    <footer className="bg-slate-950 text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column — takes 2 cols */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <GraduationCap className="h-6 w-6 text-blue-400" />
              <span>{displayName}</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Training, HR operations, and payroll — unified in one platform
              so your people grow and your business runs without the chaos.
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                info@humihub.com
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                +63 912 345 6789
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                Manila, Philippines
              </span>
            </div>
          </div>

          {/* Link columns */}
          <LinkColumn title="Product"   links={productLinks}   />
          <LinkColumn title="Company"   links={companyLinks}   />
          <LinkColumn title="Resources" links={resourceLinks}  />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} {displayName}. All rights reserved.</p>
          <div className="flex gap-5">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-slate-300 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
