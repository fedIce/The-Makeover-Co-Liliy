import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer id="contact" className="bg-charcoal text-cream">
      <div className="container-site grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:py-16">
        <div>
          <h2 className="font-serif text-[1.55rem] leading-snug font-medium text-cream sm:text-[1.75rem]">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-xs text-[0.85rem] leading-relaxed text-cream/60">
            {t("body")}
          </p>
          <Link href="/book" className="btn-primary mt-7 inline-flex">
            {t("cta")}
            <CalendarIcon />
          </Link>
        </div>

        <div className="text-center sm:col-span-2 lg:col-span-1">
          <p className="font-serif text-lg font-semibold tracking-[0.14em]">
            {t("brand")}
          </p>
          <p className="mt-1.5 text-[0.58rem] font-medium tracking-[0.28em] text-cream/55">
            {t("brandBy")}
          </p>
          <div className="mt-7 flex justify-center gap-5 text-copper">
            <SocialLink label={t("social.instagram")} href="https://instagram.com">
              <InstagramIcon />
            </SocialLink>
            <SocialLink label={t("social.facebook")} href="https://facebook.com">
              <FacebookIcon />
            </SocialLink>
            <SocialLink label={t("social.tiktok")} href="https://tiktok.com">
              <TikTokIcon />
            </SocialLink>
            <SocialLink label={t("social.whatsapp")} href="https://wa.me/35799123456">
              <WhatsAppIcon />
            </SocialLink>
          </div>
        </div>

        <div className="space-y-4 border-cream/10 text-sm text-cream/75 lg:border-l lg:pl-10">
          <ContactRow icon={<PhoneIcon />} href="tel:+35799123456">
            {t("phone")}
          </ContactRow>
          <ContactRow icon={<MailIcon />} href="mailto:info@themakeoverco.com">
            {t("email")}
          </ContactRow>
          <ContactRow icon={<PinIcon />}>{t("address")}</ContactRow>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-site flex flex-col gap-3 py-4 text-[0.65rem] text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright")}</p>
          <div className="flex gap-3">
            <a href="#" className="transition-colors hover:text-cream/70">
              {t("privacy")}
            </a>
            <span aria-hidden>|</span>
            <a href="#" className="transition-colors hover:text-cream/70">
              {t("terms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="transition-opacity hover:opacity-70">
      {children}
    </a>
  );
}

function ContactRow({
  icon,
  href,
  children,
}: {
  icon: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}) {
  const content = (
    <span className="flex items-start gap-3">
      <span className="mt-0.5 text-copper">{icon}</span>
      <span>{children}</span>
    </span>
  );
  if (href) {
    return (
      <a href={href} className="block transition-colors hover:text-cream">
        {content}
      </a>
    );
  }
  return content;
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.6 8.2a5.8 5.8 0 01-3.4-1.1v7.2a5.4 5.4 0 11-5.4-5.4c.3 0 .6 0 .9.1v2.7a2.7 2.7 0 102 2.6V3.5h2.6c.2 1.5 1.2 2.8 2.6 3.4v1.3z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3a8.5 8.5 0 00-7.3 12.9L3.5 20.5l4.7-1.2A8.5 8.5 0 1012 3zm4.8 12.1c-.2.6-1.1 1.1-1.8 1.2-.5.1-1.1.1-1.8-.1a14 14 0 01-6.1-5.1 6 6 0 01-1.2-3.1c0-.7.3-1.4.8-1.8.2-.2.5-.3.8-.3h.6c.2 0 .4 0 .5.4l.8 2c.1.2 0 .4-.1.6l-.4.5c-.1.2-.3.3-.1.6.4.6 1 1.2 1.7 1.7.6.4 1.1.7 1.6.8.2.1.4 0 .6-.2l.5-.6c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.5 0 .1 0 .3-.1.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 3.5h2.8l1.4 4.2-1.9 1.4a11 11 0 005.1 5.1l1.4-1.9 4.2 1.4V18a1.8 1.8 0 01-2 1.8A14 14 0 015.2 7.5 1.8 1.8 0 017 3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7.5l7.5 5.5 7.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 20.5s5.5-4.8 5.5-10a5.5 5.5 0 10-11 0c0 5.2 5.5 10 5.5 10z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="10.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
