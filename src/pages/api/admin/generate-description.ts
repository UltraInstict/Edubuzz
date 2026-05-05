import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin } from '../../../lib/auth';
import { cleanString, json } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const { redirect } = requireAdmin(request);
  if (redirect) return redirect;

  try {
    const { jobId } = await request.json();
    const id = cleanString(jobId, 80);
    if (!id) return json({ message: 'Job ID is required.' }, { status: 400 });

    const pb = await getAdminPB();
    const job: any = await pb.collection('jobs').getOne(id, {
      fields: 'id,title,company,city,province,category,job_type,salary_min,salary_max',
    });

    const apiKey = import.meta.env.ANTHROPIC_API_KEY;
    if (!apiKey) return json({ message: 'AI generation is not configured.' }, { status: 503 });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Write a professional job description for the following position. Return only the description, no preamble, no markdown headers.

Job title: ${job.title}
Company: ${job.company}
Location: ${job.city}, ${job.province}, South Africa
Category: ${job.category}
Type: ${job.job_type}
Salary: R${job.salary_min || ''} - R${job.salary_max || ''}/month

Write 3 short paragraphs: (1) about the role, (2) key responsibilities, (3) requirements. Keep it factual, professional, under 250 words. South African context.`,
        }],
      }),
    });

    if (!response.ok) return json({ message: 'AI generation failed.' }, { status: 502 });
    const result = await response.json();
    const description = result.content?.[0]?.text || '';
    await pb.collection('jobs').update(id, { description, ai_written: true });
    return json({ success: true, description });
  } catch {
    return json({ message: 'Could not regenerate description.' }, { status: 500 });
  }
};
