type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

function encodeBase64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

async function readLine(socket: any): Promise<string> {
  return await new Promise((resolve, reject) => {
    socket.once('data', (chunk: Buffer) => resolve(chunk.toString('utf8')));
    socket.once('error', reject);
  });
}

async function writeLine(socket: any, line: string) {
  socket.write(`${line}\r\n`);
  return await readLine(socket);
}

export async function sendMail(to: string, subject: string, html: string) {
  const host = import.meta.env.SMTP_HOST;
  const port = Number(import.meta.env.SMTP_PORT || 465);
  const user = import.meta.env.SMTP_USER;
  const pass = import.meta.env.SMTP_PASS;
  if (!host || !user || !pass) return;

  const tls = await import('node:tls');
  const socket = tls.connect({ host, port, servername: host });
  await readLine(socket);
  await writeLine(socket, `EHLO edubuzz.co.za`);
  await writeLine(socket, 'AUTH LOGIN');
  await writeLine(socket, encodeBase64(user));
  await writeLine(socket, encodeBase64(pass));
  await writeLine(socket, `MAIL FROM:<noreply@edubuzz.co.za>`);
  await writeLine(socket, `RCPT TO:<${to}>`);
  await writeLine(socket, 'DATA');
  socket.write([
    `From: "Edubuzz" <noreply@edubuzz.co.za>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
    '.',
    '',
  ].join('\r\n'));
  await readLine(socket);
  socket.end('QUIT\r\n');
}

export async function sendMany(messages: MailOptions[]) {
  for (const message of messages) {
    await sendMail(message.to, message.subject, message.html);
  }
}
