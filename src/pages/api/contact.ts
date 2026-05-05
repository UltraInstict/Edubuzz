import type { APIRoute } from 'astro';
import { cleanString, isEmail, json } from '../../lib/api';
import { sendMail } from '../../lib/mailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const name = cleanString(data.name, 80);
    const email = cleanString(data.email, 120).toLowerCase();
    const message = cleanString(data.message, 5000);
    if (!name || !isEmail(email) || !message) return json({ message: 'Name, valid email, and message are required.' }, { status: 400 });
    const to = import.meta.env.SMTP_USER || 'admin@edubuzz.co.za';
    await sendMail(to, `Edubuzz contact from ${name}`, `<p>From: ${name} (${email})</p><p>${message}</p>`);
    return json({ ok: true });
  } catch {
    return json({ message: 'Could not send message.' }, { status: 500 });
  }
};
