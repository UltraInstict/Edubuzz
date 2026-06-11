import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { randomBytes } from 'crypto';
import { validateToken } from '../../lib/csrf';
import { checkRateLimit, ok, fail } from '../../lib/api';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function sanitizeFilename(originalName: string): string {
  const ext = originalName.match(/\.([a-z]{3,5})$/i)?.[1]?.toLowerCase() || 'bin';
  const safeExt = ['pdf', 'doc', 'docx'].includes(ext) ? ext : 'pdf';
  return `${randomBytes(16).toString('hex')}.${safeExt}`;
}

function isValidMime(type: string, filename: string): boolean {
  if (ALLOWED_MIME_TYPES.includes(type)) return true;
  const ext = filename.toLowerCase().match(/\.([a-z]+)$/)?.[1];
  if (ext === 'pdf' && type === 'application/pdf') return true;
  if (ext === 'doc' && type === 'application/msword') return true;
  if (ext === 'docx' && type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return true;
  return false;
}

function scanForMalware(buffer: ArrayBuffer): string | null {
  const header = new Uint8Array(buffer.slice(0, 8));
  const signatures: [number[], string][] = [
    [[0x4D, 0x5A], 'EXE/DLL - executable not allowed'],
    [[0x7F, 0x45, 0x4C, 0x46], 'ELF - executable not allowed'],
    [[0xCA, 0xFE, 0xBA, 0xBE], 'Java class - not allowed'],
    [[0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00], 'Encrypted ZIP - not allowed'],
  ];
  for (const [sig, reason] of signatures) {
    if (sig.every((byte, i) => header[i] === byte)) return reason;
  }
  const text = new TextDecoder().decode(header);
  if (text.includes('<script') || text.includes('<?php') || text.includes('eval(')) {
    return 'Script content detected in file';
  }
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  if (!checkRateLimit(request)) return fail('Too many submissions. Please try again later.', 429);

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return fail('Invalid form data.', 400);
  }

  if (!validateToken(fd.get('_csrf') as string)) return fail('Invalid request.', 403);

  const jobId = (fd.get('job_id') as string)?.trim();
  const name = (fd.get('name') as string)?.trim();
  const email = (fd.get('email') as string)?.trim().toLowerCase();
  const phone = (fd.get('phone') as string)?.trim() ?? '';
  const letter = (fd.get('cover_letter') as string)?.trim() ?? '';
  const cv = fd.get('cv_file');

  if (!jobId) return fail('Job ID missing.', 400);
  if (!name) return fail('Name is required.', 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Valid email is required.', 400);
  if (/[<>]/.test(name)) return fail('Name contains invalid characters.', 400);
  if (phone && !/^[0-9 +()-]{6,20}$/.test(phone)) return fail('Invalid phone number format.', 400);

  const safeName = name.slice(0, 80);
  const safeEmail = email.slice(0, 120);
  const safePhone = phone.slice(0, 30);
  const safeLetter = letter.slice(0, 5000);

  const pb = new PocketBase(import.meta.env.PB_URL ?? 'http://127.0.0.1:8090');

  if (cv instanceof File && cv.size > 0) {
    if (cv.size > MAX_FILE_SIZE) return fail('CV must be under 5MB.', 400);
    if (!isValidMime(cv.type, cv.name)) return fail('CV must be a PDF or Word document.', 400);

    try {
      const buf = await cv.arrayBuffer();
      const scanResult = scanForMalware(buf);
      if (scanResult) return fail('File rejected for security reasons.', 400);
    } catch {
      return fail('Could not verify file.', 400);
    }

    const randomName = sanitizeFilename(cv.name);
    const renamedFile = new File([cv], randomName, { type: cv.type });

    try {
      const data = new FormData();
      data.append('job', jobId);
      data.append('name', safeName);
      data.append('email', safeEmail);
      data.append('phone', safePhone);
      data.append('text', safeLetter);
      data.append('cv_file', renamedFile);
      await pb.collection('applications').create(data);
      return ok();
    } catch {
      return fail('Failed to submit application.', 500);
    }
  }

  try {
    const data = new FormData();
    data.append('job', jobId);
    data.append('name', safeName);
    data.append('email', safeEmail);
    data.append('phone', safePhone);
    data.append('text', safeLetter);
    await pb.collection('applications').create(data);
    return ok();
  } catch {
    return fail('Failed to submit application.', 500);
  }
};
