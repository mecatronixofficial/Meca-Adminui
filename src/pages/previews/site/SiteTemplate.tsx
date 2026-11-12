/* Copied from Meca-UI src/components/preview/SiteTemplate.tsx — keep the two in sync. */
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Check, Clock, Mail, MapPin, Menu, Phone, Plus, Quote, Star } from "lucide-react";
import { photoUrl, type PhotoId, type PreviewBrand, type SiteTemplateDef } from "./templates";
import { cn } from "../../../lib/cn";
import { onColor } from "./color";

/**
 * A complete one-page website for a visitor's brand, built from an industry template.
 * Pure render (no hooks), so it works in server pages, the live builder and the viewer.
 *
 * Layout uses container queries (@3xl / @5xl), not media queries, so the tablet and
 * mobile frames in the viewer reflow exactly like a real device would.
 */

const PRICES: Record<string, string[]> = {
  textile: ["₹189 / m", "₹245 / m", "₹160 / m", "₹310 / m"],
  "real-estate": ["₹1.2 Cr", "₹2.8 Cr", "₹64 L", "₹88 L"],
  automotive: ["₹11.4 L", "₹18.9 L", "₹14.2 L", "₹7.6 L"],
};
const DEFAULT_PRICES = ["₹1,499", "₹2,999", "₹899", "₹2,249"];
const SLOTS = ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM", "6:00 PM"];
const STATUS = ["Won", "Proposal", "Negotiation", "Qualified", "New"];

export function SiteTemplate({ template: t, brand, className }: { template: SiteTemplateDef; brand: PreviewBrand; className?: string }) {
  const company = brand.company.trim() || "Your Company";
  const fill = (text: string) => text.replaceAll("{company}", company);
  const services = brand.services?.map((s) => s.trim()).filter(Boolean).length ? brand.services!.map((s) => s.trim()).filter(Boolean) : t.services;
  const vars = { "--brand": brand.color, "--on-brand": onColor(brand.color) } as CSSProperties;
  const dark = t.style === "app" || t.style === "industrial";
  const phone = brand.phone?.trim() || "+91 98765 43210";
  const email = brand.email?.trim() || `hello@${slugDomain(company)}`;

  return (
    <div className={cn("@container overflow-hidden bg-white font-sans text-[#0b0d12] antialiased", className)} style={vars}>
      {/* Header */}
      <header className={cn("relative z-10", dark ? "bg-[#0b0d12] text-white" : "bg-white")}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 @3xl:px-8">
          <Brand brand={brand} company={company} />
          <nav className={cn("hidden items-center gap-7 text-[14px] @3xl:flex", dark ? "text-white/70" : "text-[#4b5563]")}>
            {t.nav.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </nav>
          <span className="hidden whitespace-nowrap rounded-full bg-[var(--brand)] px-4 py-2 text-[13px] font-semibold text-[var(--on-brand)] @3xl:inline-block">{t.hero.cta}</span>
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl border @3xl:hidden", dark ? "border-white/15" : "border-[#e7e9ee]")} aria-hidden>
            <Menu className="size-5" />
          </span>
        </div>
      </header>

      <Hero t={t} brand={brand} company={company} fill={fill} />

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16 @3xl:px-8 @5xl:py-24">
        <SectionHead eyebrow="Why choose us" title={`Why customers choose ${company}`} />
        <div className="mt-10 grid gap-4 @3xl:grid-cols-2 @5xl:grid-cols-4">
          {t.features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
              <span className="grid size-11 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--brand)_12%,white)] text-[var(--brand)]">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold">{title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[#5b6170]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 @3xl:px-8 @5xl:grid-cols-2 @5xl:gap-16 @5xl:pb-24">
        <div className="relative">
          <Photo id={t.photos.about} width={900} alt={`The team at ${company}`} className="aspect-[4/3] w-full rounded-3xl @5xl:aspect-[4/5]" />
          <div className="absolute -bottom-5 right-5 rounded-2xl bg-white px-5 py-4 shadow-[0_20px_50px_-20px_rgba(11,13,18,0.45)]">
            <p className="font-display text-[1.8rem] font-bold leading-none text-[var(--brand)]">{t.stats[3]![0]}</p>
            <p className="mt-1.5 text-[13px] text-[#5b6170]">{t.stats[3]![1]}</p>
          </div>
        </div>
        <div>
          <SectionHead eyebrow="About us" title={fill(t.about.title)} />
          <p className="mt-5 text-[15.5px] leading-relaxed text-[#5b6170]">{brand.description?.trim() || fill(t.about.text)}</p>
          {brand.city?.trim() && (
            <p className="mt-4 flex items-center gap-2 text-[14px] font-medium">
              <MapPin className="size-4 text-[var(--brand)]" /> Proudly serving {brand.city.trim()} and beyond
            </p>
          )}
          <ul className="mt-8 grid gap-3 text-[14.5px] @3xl:grid-cols-2">
            {t.about.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[var(--on-brand)]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Showcase t={t} />

      {/* Services */}
      <section className="mx-auto max-w-6xl px-5 py-16 @3xl:px-8 @5xl:py-24">
        <SectionHead eyebrow="Our services" title={`What ${company} offers`} />
        <div className="mt-10 grid gap-3 @3xl:grid-cols-2 @5xl:grid-cols-3">
          {services.slice(0, 6).map((service, i) => (
            <div key={service + i} className="flex items-center justify-between gap-3 rounded-xl border border-[#e7e9ee] bg-[#fafbfc] px-5 py-4">
              <span className="flex min-w-0 items-center gap-3 text-[15px] font-medium">
                <span className="font-mono text-[12px] text-[var(--brand)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate">{service}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-[#9aa1ad]" />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#f4f5f7] py-16 @5xl:py-24">
        <div className="mx-auto max-w-6xl px-5 @3xl:px-8">
          <SectionHead eyebrow="How it works" title={t.process.title} />
          <ol className="mt-12 grid gap-4 @3xl:grid-cols-2 @5xl:grid-cols-4">
            {t.process.steps.map(([title, text], i) => (
              <li key={title} className="rounded-2xl border border-[#e2e4e9] bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--brand)] font-display text-[15px] font-bold text-[var(--on-brand)]">{i + 1}</span>
                  {i < t.process.steps.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-[color-mix(in_oklab,var(--brand)_35%,white)] @5xl:block" />}
                </div>
                <h3 className="mt-5 text-[17px] font-semibold">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#5b6170]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-5 py-16 @3xl:px-8 @5xl:py-24">
        <SectionHead eyebrow="Gallery" title={fill(t.gallery.title)} />
        <div className="mt-10 grid gap-4 @3xl:grid-cols-2 @5xl:grid-cols-[1.35fr_1fr]">
          {t.gallery.items.map(([id, caption], i) => (
            <figure
              key={id}
              className={cn(
                "relative overflow-hidden rounded-3xl bg-[#eef0f3]",
                i === 0 ? "aspect-[4/3] @3xl:col-span-2 @3xl:aspect-[16/8] @5xl:col-span-1 @5xl:row-span-2 @5xl:aspect-auto" : "aspect-[4/3] @5xl:aspect-[16/10]",
              )}
            >
              <Photo id={id} width={i === 0 ? 1100 : 700} alt={caption} className="absolute inset-0 size-full" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-14 text-[15px] font-semibold text-white">{caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[var(--brand)] text-[var(--on-brand)]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 @3xl:px-8 @5xl:grid-cols-4">
          {t.stats.map(([value, label]) => (
            <div key={label}>
              <p className="font-display text-[2rem] font-bold leading-none tracking-tight @5xl:text-[2.6rem]">{value}</p>
              <p className="mt-2 text-[14px] opacity-80">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-4xl px-5 py-16 text-center @3xl:px-8 @5xl:py-24">
        <Quote className="mx-auto size-9 text-[var(--brand)]" />
        <div className="mt-3 flex justify-center gap-1 text-[#f5a524]">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="size-4 fill-current" />
          ))}
        </div>
        <blockquote className="mt-6 font-display text-[1.35rem] font-medium leading-snug tracking-tight @5xl:text-[1.75rem]">“{t.testimonial.quote}”</blockquote>
        <p className="mt-6 text-[14px] text-[#5b6170]">
          <span className="font-semibold text-[#0b0d12]">{t.testimonial.name}</span> · {t.testimonial.role}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#9aa1ad]">Sample testimonial</p>
      </section>

      {/* FAQ */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 @3xl:px-8 @5xl:grid-cols-[0.8fr_1.2fr] @5xl:pb-24">
        <div>
          <SectionHead eyebrow="FAQ" title="Questions, answered" />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#5b6170]">
            Still have a question? Call us on <span className="font-semibold text-[#0b0d12]">{phone}</span> or write to{" "}
            <span className="font-semibold text-[#0b0d12]">{email}</span>.
          </p>
        </div>
        <div className="grid content-start gap-3">
          {t.faqs.map(([question, answer], i) => (
            <details key={question} open={i === 0} className="group rounded-2xl border border-[#e7e9ee] bg-white px-5 py-4 open:bg-[#fafbfc]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-semibold [&::-webkit-details-marker]:hidden">
                {question}
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,white)] text-[var(--brand)]">
                  <Plus className="size-4 transition-transform group-open:rotate-45" />
                </span>
              </summary>
              <p className="mt-3 pr-10 text-[14.5px] leading-relaxed text-[#5b6170]">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16 @3xl:px-8 @5xl:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#0b0d12] px-7 py-12 text-white @5xl:px-14 @5xl:py-16">
          <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-[var(--brand)] opacity-40 blur-3xl" />
          <div className="relative flex flex-col gap-6 @5xl:flex-row @5xl:items-center @5xl:justify-between">
            <div>
              <h2 className="font-display text-[1.8rem] font-bold leading-tight tracking-tight @5xl:text-[2.3rem]">{t.cta.title}</h2>
              <p className="mt-3 max-w-xl text-[15px] text-white/70">{t.cta.text}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[var(--brand)] px-6 py-3.5 text-[15px] font-semibold text-[var(--on-brand)] @5xl:self-auto">
              {t.cta.button} <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e7e9ee] bg-[#fafbfc]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 @3xl:grid-cols-[1.3fr_1fr_1fr] @3xl:px-8">
          <div>
            <Brand brand={brand} company={company} />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[#5b6170]">{brand.tagline?.trim() || t.blurb}</p>
          </div>
          <div>
            <p className="text-[13px] font-semibold">Explore</p>
            <ul className="mt-3 grid gap-2 text-[14px] text-[#5b6170]">
              {t.nav.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[13px] font-semibold">Contact</p>
            <ul className="mt-3 grid gap-2.5 text-[14px] text-[#5b6170]">
              <ContactLine icon={<Phone className="size-4" />}>{phone}</ContactLine>
              <ContactLine icon={<Mail className="size-4" />}>{email}</ContactLine>
              <ContactLine icon={<MapPin className="size-4" />}>{brand.city?.trim() || "Your city"}</ContactLine>
            </ul>
          </div>
        </div>
        <p className="border-t border-[#e7e9ee] px-5 py-5 text-center text-[12.5px] text-[#9aa1ad]">
          © {new Date().getFullYear()} {company}. All rights reserved. · Sample photos from Pexels
        </p>
      </footer>
    </div>
  );
}

/* ---------- Pieces ---------- */

function Brand({ brand, company }: { brand: PreviewBrand; company: string }) {
  const initials = company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {brand.logoUrl ? (
        // Visitor's logo: a blob: URL while editing, a storage URL afterwards
        <img src={brand.logoUrl} alt={`${company} logo`} className="h-9 w-auto max-w-[120px] shrink-0 rounded-md object-contain" />
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--brand)] font-display text-[14px] font-bold text-[var(--on-brand)]">{initials || "Co"}</span>
      )}
      <span className="truncate font-display text-[17px] font-bold tracking-tight">{company}</span>
    </span>
  );
}

/** A stock photo for the template (see photoUrl). Plain <img> so the template renders anywhere. */
function Photo({ id, width, alt, className, eager }: { id: PhotoId; width: number; alt: string; className?: string; eager?: boolean }) {
  return (
    <img src={photoUrl(id, width)} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className={cn("object-cover", className)} />
  );
}

function SectionHead({ eyebrow, title, light }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">{eyebrow}</p>
      <h2 className={cn("mt-3 font-display text-[1.75rem] font-bold leading-tight tracking-tight @5xl:text-[2.4rem]", light && "text-white")}>{title}</h2>
    </div>
  );
}

function ContactLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="text-[var(--brand)]">{icon}</span>
      <span className="truncate">{children}</span>
    </li>
  );
}

const slugDomain = (company: string) => `${company.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) || "company"}.com`;

function Buttons({ t, light }: { t: SiteTemplateDef; light?: boolean }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3.5 text-[15px] font-semibold text-[var(--on-brand)] shadow-[0_10px_30px_-10px_var(--brand)]">
        {t.hero.cta} <ArrowRight className="size-4" />
      </span>
      <span className={cn("inline-flex items-center rounded-full border px-6 py-3.5 text-[15px] font-semibold", light ? "border-white/25 text-white" : "border-[#d9dce3] text-[#0b0d12]")}>
        {t.hero.secondary}
      </span>
    </div>
  );
}

/* ---------- Heroes (one per layout family) ---------- */

function Hero({ t, brand, company, fill }: { t: SiteTemplateDef; brand: PreviewBrand; company: string; fill: (s: string) => string }) {
  const Icon = t.icon;
  const title = fill(t.hero.title);
  const text = brand.tagline?.trim() ? `${brand.tagline.trim()}. ${t.hero.text}` : t.hero.text;

  if (t.style === "app") {
    return (
      <section className="relative overflow-hidden bg-[#0b0d12] text-white">
        <div aria-hidden className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--brand)] opacity-30 blur-[110px]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 pt-16 text-center @3xl:px-8 @5xl:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12.5px] text-white/80">
            <span className="size-1.5 rounded-full bg-[var(--brand)]" /> {t.hero.eyebrow}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[2.3rem] font-bold leading-[1.05] tracking-tight @3xl:text-[3.2rem] @5xl:text-[4rem]">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/70 @5xl:text-[18px]">{text}</p>
          <div className="flex justify-center">
            <Buttons t={t} light />
          </div>
          <div className="relative mx-auto mt-14 max-w-5xl [perspective:1600px]">
            <div className="origin-bottom rounded-t-2xl border border-white/10 bg-[#11141b] p-2 shadow-[0_-20px_80px_-30px_var(--brand)] @5xl:[transform:rotateX(8deg)]">
              <Dashboard t={t} company={company} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (t.style === "commerce") {
    const prices = PRICES[t.slug] ?? DEFAULT_PRICES;
    return (
      <section className="relative overflow-hidden bg-[#faf7f2]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 @3xl:px-8 @5xl:grid-cols-2 @5xl:py-24">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">{t.hero.eyebrow}</p>
            <h1 className="mt-5 font-display text-[2.3rem] font-bold leading-[1.05] tracking-tight @3xl:text-[3.1rem] @5xl:text-[3.6rem]">{title}</h1>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#5b6170]">{text}</p>
            <Buttons t={t} />
          </div>
          <div className="relative">
            <Photo id={t.photos.hero} width={1000} eager alt={`${t.name} at ${company}`} className="aspect-[4/3] w-full rounded-[2rem] @5xl:aspect-[4/5]" />
            {/* Featured item */}
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-[0_20px_50px_-20px_rgba(11,13,18,0.5)] backdrop-blur @3xl:right-auto @3xl:w-[300px] @5xl:-left-8 @5xl:bottom-10">
              <span className="grid size-14 shrink-0 place-items-center rounded-xl" style={{ background: tileBackground(0) }}>
                <Icon className="size-7 text-[var(--brand)]" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--brand)]">Featured</p>
                <p className="truncate text-[15px] font-semibold">{t.showcase.items[0]}</p>
                <p className="text-[13px] text-[#5b6170]">{prices[0]}</p>
              </div>
            </div>
            {/* Headline stat */}
            <div className="absolute right-4 top-4 rounded-2xl bg-white px-4 py-3 shadow-[0_20px_50px_-20px_rgba(11,13,18,0.5)] @5xl:-right-5 @5xl:top-10">
              <p className="font-display text-[1.35rem] font-bold leading-none text-[var(--brand)]">{t.stats[0]![0]}</p>
              <p className="mt-1 text-[12px] text-[#5b6170]">{t.stats[0]![1]}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (t.style === "care") {
    return (
      <section className="relative overflow-hidden bg-[color-mix(in_oklab,var(--brand)_7%,white)]">
        <div aria-hidden className="absolute -right-32 -top-32 size-[520px] rounded-full bg-[var(--brand)] opacity-15 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 @3xl:px-8 @5xl:grid-cols-[1.15fr_0.85fr] @5xl:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--brand)] shadow-sm">
              <Icon className="size-3.5" /> {t.hero.eyebrow}
            </span>
            <h1 className="mt-6 font-display text-[2.3rem] font-bold leading-[1.05] tracking-tight @3xl:text-[3.1rem] @5xl:text-[3.7rem]">{title}</h1>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#5b6170]">{text}</p>
            <Buttons t={t} />
            <div className="mt-10 flex flex-wrap gap-6">
              {t.stats.slice(0, 3).map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-[1.6rem] font-bold leading-none">{value}</p>
                  <p className="mt-1 text-[13px] text-[#5b6170]">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <Photo id={t.photos.hero} width={1000} eager alt={`${t.name} at ${company}`} className="aspect-[4/3] w-full rounded-[2rem] @5xl:aspect-[4/5]" />
            <div className="relative -mt-16 px-4 @3xl:ml-auto @3xl:max-w-sm @5xl:absolute @5xl:-left-10 @5xl:bottom-8 @5xl:mt-0 @5xl:w-[300px] @5xl:px-0">
              <BookingCard t={t} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // industrial
  return (
    <section className="relative overflow-hidden bg-[#0b0d12] text-white">
      <Photo id={t.photos.hero} width={1600} eager alt="" className="absolute inset-0 size-full" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,13,18,0.95)_0%,rgba(11,13,18,0.82)_50%,rgba(11,13,18,0.6)_100%)]" />
      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0_2px,transparent_2px_26px)]" />
      <div aria-hidden className="absolute -bottom-40 -left-20 size-[520px] rounded-full bg-[var(--brand)] opacity-25 blur-[100px]" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 @3xl:px-8 @5xl:py-28">
        <p className="inline-flex items-center gap-2 border-l-4 border-[var(--brand)] pl-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80">{t.hero.eyebrow}</p>
        <h1 className="mt-6 max-w-4xl font-display text-[2.4rem] font-bold uppercase leading-[1] tracking-tight @3xl:text-[3.4rem] @5xl:text-[4.4rem]">{title}</h1>
        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/70 @5xl:text-[18px]">{text}</p>
        <Buttons t={t} light />
        <div className="mt-14 grid grid-cols-2 border-t border-white/15 @5xl:grid-cols-4">
          {t.stats.map(([value, label]) => (
            <div key={label} className="border-b border-white/10 py-6 pr-4 @5xl:border-b-0">
              <p className="font-display text-[1.9rem] font-bold leading-none text-[var(--brand)] @5xl:text-[2.4rem]">{value}</p>
              <p className="mt-2 text-[13px] uppercase tracking-wider text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Showcases ---------- */

function Showcase({ t }: { t: SiteTemplateDef }) {
  const s = t.showcase;
  const Icon = t.icon;

  if (t.style === "commerce") {
    const prices = PRICES[t.slug] ?? DEFAULT_PRICES;
    return (
      <section className="bg-[#fafbfc] py-16 @5xl:py-24">
        <div className="mx-auto max-w-6xl px-5 @3xl:px-8">
          <SectionHead eyebrow={s.eyebrow} title={s.title} />
          <div className="mt-10 grid grid-cols-2 gap-4 @5xl:grid-cols-4">
            {s.items.map((item, i) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-[#e7e9ee] bg-white">
                <div className="relative grid aspect-[4/3] place-items-center" style={{ background: tileBackground(i + 1) }}>
                  <Icon className="size-14 text-[var(--brand)] opacity-60" strokeWidth={1.2} />
                </div>
                <div className="p-4">
                  <p className="text-[14.5px] font-semibold leading-snug">{item}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-[var(--brand)]">{prices[i % prices.length]}</p>
                    <span className="flex items-center gap-1 text-[12px] text-[#5b6170]">
                      <Star className="size-3.5 fill-[#f5a524] text-[#f5a524]" /> 4.{8 - (i % 3)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (t.style === "care") {
    return (
      <section className="bg-[#fafbfc] py-16 @5xl:py-24">
        <div className="mx-auto max-w-6xl px-5 @3xl:px-8">
          <SectionHead eyebrow={s.eyebrow} title={s.title} />
          <p className="mt-3 text-[15px] text-[#5b6170]">{s.text}</p>
          <div className="mt-10 grid gap-4 @3xl:grid-cols-2 @5xl:grid-cols-4">
            {s.items.map((item, i) => (
              <div key={item} className="rounded-2xl border border-[#e7e9ee] bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,white)] text-[var(--brand)]">
                    <Icon className="size-5" />
                  </span>
                  <p className="text-[15px] font-semibold">{item}</p>
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-[#5b6170]">
                  <Clock className="size-3.5" /> Next available
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SLOTS.slice(i % 2, (i % 2) + 3).map((slot, j) => (
                    <span
                      key={slot}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium",
                        j === 0 ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]" : "border-[#e7e9ee] text-[#374151]",
                      )}
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (t.style === "industrial") {
    return (
      <section className="bg-[#f4f5f7] py-16 @5xl:py-24">
        <div className="mx-auto max-w-6xl px-5 @3xl:px-8">
          <SectionHead eyebrow={s.eyebrow} title={s.title} />
          <p className="mt-3 text-[15px] text-[#5b6170]">{s.text}</p>
          <ol className="mt-12 grid gap-4 @3xl:grid-cols-3 @5xl:grid-cols-5">
            {s.items.map((step, i) => (
              <li key={step} className="relative rounded-2xl border border-[#e2e4e9] bg-white p-5">
                <span className="font-display text-[2.2rem] font-bold leading-none text-[var(--brand)]">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-4 text-[15px] font-semibold">{step}</p>
                <span aria-hidden className="absolute inset-x-5 top-0 h-1 rounded-b bg-[var(--brand)]" style={{ opacity: 0.25 + (i / s.items.length) * 0.75 }} />
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  // app: detailed data table
  return (
    <section className="bg-[#fafbfc] py-16 @5xl:py-24">
      <div className="mx-auto max-w-6xl px-5 @3xl:px-8">
        <SectionHead eyebrow={s.eyebrow} title={s.title} />
        <p className="mt-3 text-[15px] text-[#5b6170]">{s.text}</p>
        <div className="mt-10 overflow-hidden rounded-2xl border border-[#e7e9ee] bg-white">
          {s.items.map((item, i) => (
            <div key={item} className="flex items-center justify-between gap-4 border-b border-[#eef0f3] px-5 py-4 last:border-0">
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--brand)_12%,white)] font-display text-[13px] font-bold text-[var(--brand)]">
                  {item[0]}
                </span>
                <span className="truncate text-[14.5px] font-medium">{item}</span>
              </span>
              <span className="hidden text-[14px] text-[#5b6170] @3xl:block">₹{(4.2 + i * 1.7).toFixed(1)}L</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold",
                  i === 0 ? "bg-[var(--brand)] text-[var(--on-brand)]" : "bg-[color-mix(in_oklab,var(--brand)_10%,white)] text-[var(--brand)]",
                )}
              >
                {STATUS[i % STATUS.length]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Product dashboard mock for app-style heroes. */
function Dashboard({ t, company }: { t: SiteTemplateDef; company: string }) {
  return (
    <div className="grid overflow-hidden rounded-xl bg-[#0f1219] text-left @3xl:grid-cols-[180px_1fr]">
      <aside className="hidden border-r border-white/5 p-4 @3xl:block">
        <p className="truncate font-display text-[13px] font-bold text-white">{company}</p>
        <ul className="mt-5 grid gap-1 text-[12.5px] text-white/50">
          {["Overview", ...t.nav.slice(0, 4)].map((item, i) => (
            <li key={item} className={cn("rounded-md px-2.5 py-2", i === 0 && "bg-white/10 text-white")}>
              {item}
            </li>
          ))}
        </ul>
      </aside>
      <div className="p-4 @5xl:p-6">
        <div className="grid grid-cols-2 gap-3 @5xl:grid-cols-4">
          {t.stats.map(([value, label], i) => (
            <div key={label} className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <p className="truncate text-[11px] text-white/45">{label}</p>
              <p className="mt-1.5 font-display text-[18px] font-bold text-white">{value}</p>
              <p className={cn("mt-1 text-[11px]", i % 3 === 2 ? "text-white/40" : "text-emerald-400")}>{i % 3 === 2 ? "steady" : `▲ ${8 + i * 3}%`}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between text-[11px] text-white/45">
            <span>Performance</span>
            <span>Last 12 weeks</span>
          </div>
          <svg viewBox="0 0 400 110" className="mt-2 h-28 w-full" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id={`fill-${t.slug}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--brand)" stopOpacity="0.45" />
                <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 90 C40 82 60 70 100 72 S160 50 200 54 S260 30 300 36 S360 14 400 18 L400 110 L0 110 Z" fill={`url(#fill-${t.slug})`} />
            <path d="M0 90 C40 82 60 70 100 72 S160 50 200 54 S260 30 300 36 S360 14 400 18" fill="none" stroke="var(--brand)" strokeWidth="2.5" />
            <path d="M0 100 C50 96 90 92 130 90 S210 80 250 82 S330 70 400 64" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Booking widget for care-style heroes. */
function BookingCard({ t }: { t: SiteTemplateDef }) {
  return (
    <div className="relative rounded-3xl border border-white bg-white/90 p-6 shadow-[0_30px_80px_-30px_rgba(11,13,18,0.35)] backdrop-blur">
      <p className="font-display text-[19px] font-bold">{t.hero.cta}</p>
      <p className="mt-1 text-[13.5px] text-[#5b6170]">Takes less than a minute</p>
      <div className="mt-5 grid gap-3">
        <FieldMock label={t.showcase.eyebrow === "Classes" ? "Class" : "Service"} value={t.showcase.items[0]} />
        <FieldMock label="Date" value="Tomorrow" />
      </div>
      <p className="mt-4 text-[12.5px] font-medium text-[#5b6170]">Available times</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {SLOTS.slice(0, 3).map((slot, i) => (
          <span
            key={slot}
            className={cn(
              "rounded-lg border py-2 text-center text-[12.5px] font-medium",
              i === 1 ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]" : "border-[#e7e9ee]",
            )}
          >
            {slot}
          </span>
        ))}
      </div>
      <span className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#0b0d12] py-3.5 text-[14.5px] font-semibold text-white">
        Confirm booking <ArrowRight className="size-4" />
      </span>
    </div>
  );
}

function FieldMock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7e9ee] bg-white px-4 py-2.5">
      <p className="text-[11px] text-[#9aa1ad]">{label}</p>
      <p className="text-[14px] font-medium">{value}</p>
    </div>
  );
}

/** Soft brand-tinted gradients for product tiles. */
function tileBackground(i: number) {
  const mixes = [
    "linear-gradient(145deg, color-mix(in oklab, var(--brand) 22%, white), color-mix(in oklab, var(--brand) 6%, white))",
    "linear-gradient(145deg, color-mix(in oklab, var(--brand) 10%, #fff7ed), #ffffff)",
    "linear-gradient(145deg, color-mix(in oklab, var(--brand) 14%, #eef2ff), #f8fafc)",
    "linear-gradient(145deg, color-mix(in oklab, var(--brand) 8%, #f0fdf4), #ffffff)",
    "linear-gradient(145deg, color-mix(in oklab, var(--brand) 16%, #fdf2f8), #ffffff)",
  ];
  return mixes[i % mixes.length];
}
