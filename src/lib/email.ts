import { Resend } from "resend";
import { formatInTimeZone } from "date-fns-tz";
import { formatEur } from "@/lib/money";
import { APP_TZ } from "@/lib/timezone";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.EMAIL_FROM ?? "The Makeover Co. <onboarding@resend.dev>";
}

function brandWrap(body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9f5f0;font-family:Montserrat,Arial,sans-serif;color:#1a1412;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="font-family:Georgia,serif;letter-spacing:0.18em;font-size:12px;text-align:center;margin:0 0 24px;">THE MAKEOVER CO. BY LILLY</p>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#6e6560;text-align:center;">Limassol, Cyprus</p>
  </div></body></html>`;
}

export async function sendMagicLinkEmail(input: { to: string; url: string }) {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: "Your sign-in link — The Makeover Co.",
    text: `Sign in to The Makeover Co. by Lilly:\n\n${input.url}\n\nThis link expires in 24 hours. If you did not request it, you can ignore this email.`,
    html: brandWrap(`
      <h1 style="font-family:Georgia,serif;font-weight:500;font-size:28px;margin:0 0 12px;">Sign in</h1>
      <p style="line-height:1.6;">Use the button or the link below to open your account. It expires in 24 hours.</p>
      <p style="margin:28px 0;text-align:center;">
        <a href="${input.url}" style="display:inline-block;background:#b86a4a;color:#ffffff;text-decoration:none;padding:14px 24px;letter-spacing:0.14em;font-size:11px;text-transform:uppercase;">Sign in</a>
      </p>
      <p style="line-height:1.6;font-size:13px;word-break:break-all;">
        Or copy this link:<br/>
        <a href="${input.url}" style="color:#b86a4a;">${input.url}</a>
      </p>
      <p style="line-height:1.6;font-size:13px;color:#6e6560;">If you did not request this, you can ignore the email.</p>
    `),
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }
}

export async function sendBookingConfirmedEmail(input: {
  to: string;
  guestName: string;
  serviceTitle: string;
  startsAt: Date;
  depositPaidCents: number;
  balanceDueCents: number;
  accountUrl: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.info("[email] skip confirm (no RESEND_API_KEY)", input.to);
    return;
  }

  const when = formatInTimeZone(input.startsAt, APP_TZ, "EEEE d MMMM yyyy 'at' HH:mm");

  await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: `Confirmed — ${input.serviceTitle}`,
    html: brandWrap(`
      <h1 style="font-family:Georgia,serif;font-weight:500;font-size:28px;margin:0 0 12px;">You're booked</h1>
      <p style="line-height:1.6;">Hi ${input.guestName}, your <strong>${input.serviceTitle}</strong> is confirmed for <strong>${when}</strong> (Cyprus time).</p>
      <p style="line-height:1.6;">Deposit paid: <strong>${formatEur(input.depositPaidCents)}</strong><br/>Balance due in salon: <strong>${formatEur(input.balanceDueCents)}</strong></p>
      <p style="margin-top:24px;"><a href="${input.accountUrl}" style="display:inline-block;background:#b86a4a;color:#fff;text-decoration:none;padding:12px 20px;letter-spacing:0.14em;font-size:11px;text-transform:uppercase;">View appointment</a></p>
    `),
  });
}

export async function sendBookingCancelledEmail(input: {
  to: string;
  guestName: string;
  serviceTitle: string;
  startsAt: Date;
}) {
  const resend = getResend();
  if (!resend) {
    console.info("[email] skip cancel", input.to);
    return;
  }
  const when = formatInTimeZone(input.startsAt, APP_TZ, "EEEE d MMMM yyyy 'at' HH:mm");
  await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: `Cancelled — ${input.serviceTitle}`,
    html: brandWrap(`
      <h1 style="font-family:Georgia,serif;font-weight:500;font-size:28px;">Appointment cancelled</h1>
      <p style="line-height:1.6;">Hi ${input.guestName}, your ${input.serviceTitle} on ${when} has been cancelled.</p>
    `),
  });
}

export async function sendReminderEmail(input: {
  to: string;
  guestName: string;
  serviceTitle: string;
  startsAt: Date;
  label: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.info("[email] skip reminder", input.to);
    return;
  }
  const when = formatInTimeZone(input.startsAt, APP_TZ, "EEEE d MMMM yyyy 'at' HH:mm");
  await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: `Reminder — ${input.serviceTitle} ${input.label}`,
    html: brandWrap(`
      <h1 style="font-family:Georgia,serif;font-weight:500;font-size:28px;">See you soon</h1>
      <p style="line-height:1.6;">Hi ${input.guestName}, a quick reminder that your <strong>${input.serviceTitle}</strong> is on <strong>${when}</strong>.</p>
    `),
  });
}

export async function sendSlotLostRefundEmail(input: {
  to: string;
  guestName: string;
  bookUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: "Booking unavailable — deposit refunded",
    html: brandWrap(`
      <h1 style="font-family:Georgia,serif;font-weight:500;font-size:28px;">We're sorry</h1>
      <p style="line-height:1.6;">Hi ${input.guestName}, that time was taken just before payment completed. Your deposit has been refunded. Please choose another slot.</p>
      <p><a href="${input.bookUrl}" style="color:#b86a4a;">Book again</a></p>
    `),
  });
}

export async function notifyAdminNewBooking(input: {
  serviceTitle: string;
  guestName: string;
  guestEmail: string;
  startsAt: Date;
}) {
  const resend = getResend();
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  if (!admins.length || !resend) return;
  const when = formatInTimeZone(input.startsAt, APP_TZ, "EEEE d MMMM yyyy 'at' HH:mm");
  await resend.emails.send({
    from: fromAddress(),
    to: admins,
    subject: `New booking — ${input.serviceTitle}`,
    html: brandWrap(`
      <p><strong>${input.guestName}</strong> (${input.guestEmail}) booked <strong>${input.serviceTitle}</strong> for ${when}.</p>
    `),
  });
}
