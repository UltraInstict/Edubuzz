import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { title, company, province, job_type, salary_min, salary_max } = await request.json();

    if (!title || !company) {
      return new Response(JSON.stringify({ message: 'Title and company are required.' }), { status: 400 });
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ message: 'AI generation not configured.' }), { status: 503 });
    }

    const salaryText = salary_min
      ? `Salary range: R${parseInt(salary_min).toLocaleString()} – R${parseInt(salary_max || salary_min).toLocaleString()} per annum.`
      : '';

    const prompt = `Write a professional South African job listing description for the following role.

Use clear, engaging language suited to a South African audience. Structure it as follows:
1. A 2–3 sentence "About the Company" paragraph
2. "Key Responsibilities" — 5 bullet points
3. "Requirements" — 5 bullet points  
4. "What We Offer" — 3–4 bullet points

Format using clean HTML only (<p>, <ul>, <li>, <strong>). No markdown. No heading tags — use <strong> for section labels inside <p> tags.

Role details:
- Title: ${title}
- Company: ${company}
- Location: ${province ? `${province}, South Africa` : 'South Africa'}
- Type: ${job_type || 'Full-time'}
${salaryText}

Write the description now:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return new Response(JSON.stringify({ message: 'AI generation failed.' }), { status: 502 });
    }

    const result = await response.json();
    const description = result.content?.[0]?.text || '';

    return new Response(JSON.stringify({ description }), { status: 200 });
  } catch (err: any) {
    console.error('Generate description error:', err);
    return new Response(JSON.stringify({ message: 'Internal error.' }), { status: 500 });
  }
};
