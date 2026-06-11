import type { APIRoute } from 'astro';
import { checkRateLimit, cleanString, isEmail, ok, fail } from '../../lib/api';
import { sendMail } from '../../lib/mailer';
import { validateToken } from '../../lib/csrf';

function escapeHtml(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
}

export const POST: APIRoute = async ({ request }) => {
  if (!checkRateLimit(request)) return fail('Too many submissions. Please try again later.', 429);

  try {
    const data = await request.json();
    if (!validateToken(data._csrf as string)) return fail('Invalid request.', 403);

    const name = cleanString(data.name, 80);
    const email = cleanString(data.email, 120).toLowerCase();
    const message = cleanString(data.message, 5000);
    const honeypot = cleanString(data.website || data.url || '', 10);

    // Silent discard — bot detected. Return success to not tip off the bot.
    if (honeypot) return ok();

    if (!name || !isEmail(email) || !message) {
      return fail('Name, valid email, and message are required.', 400);
    }

    const to = import.meta.env.SMTP_USER || 'admin@edubuzz.co.za';
    await sendMail(
      to,
      `Edubuzz contact from ${name}`,
      `<p>From: ${escapeHtml(name)} (${escapeHtml(email)})</p><p>${escapeHtml(message)}</p>`,
    );
    return ok();
  } catch {
    return fail('Could not send message.', 500);
  }
};
