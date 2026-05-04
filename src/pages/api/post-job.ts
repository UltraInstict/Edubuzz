import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const required = ['employer_name', 'employer_email', 'company', 'title', 'province', 'job_type', 'description'];

    for (const field of required) {
      if (!data[field]) {
        return new Response(JSON.stringify({ message: `${field} is required.` }), { status: 400 });
      }
    }

    const pb = getPB();
    await pb.collection('pending_jobs').create({
      employer_name:  data.employer_name,
      employer_email: data.employer_email,
      company:        data.company,
      title:          data.title,
      description:    data.description,
      province:       data.province,
      city:           data.city || '',
      job_type:       data.job_type,
      salary_min:     data.salary_min ? parseInt(data.salary_min) : null,
      salary_max:     data.salary_max ? parseInt(data.salary_max) : null,
      apply_url:      data.apply_url || '',
      apply_email:    data.apply_email || '',
      status:         'pending',
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('Post job error:', err);
    return new Response(JSON.stringify({ message: 'Failed to submit job.' }), { status: 500 });
  }
};
