export type RawJob = {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  city?: string;
  province?: string;
  description?: string;
  apply_url?: string;
  apply_email?: string;
  category?: string;
  job_type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  expires?: string;
  source?: string;
};

function text(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1]?.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim() || '';
}

function blocks(xml: string, tag: string) {
  return [...xml.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map((m) => m[1]);
}

function parseLocation(location: string) {
  const parts = location.split(',').map((part) => part.trim()).filter(Boolean);
  return {
    city: parts[0] || '',
    province: parts[1] || parts[0] || '',
  };
}

export function parseIndeedXml(xml: string): RawJob[] {
  return blocks(xml, 'job').map((job) => {
    const location = parseLocation(text(job, 'location') || `${text(job, 'city')}, ${text(job, 'state')}`);
    return {
      id: text(job, 'referencenumber') || text(job, 'id'),
      title: text(job, 'title'),
      company: text(job, 'company'),
      description: text(job, 'description'),
      apply_url: text(job, 'url'),
      city: text(job, 'city') || location.city,
      province: text(job, 'state') || location.province,
      category: text(job, 'category') || 'General',
      job_type: text(job, 'jobtype') || 'Full-time',
      expires: text(job, 'expirationdate'),
      source: 'xml_feed',
    };
  });
}

export function parseRssXml(xml: string): RawJob[] {
  return blocks(xml, 'item').map((item) => {
    const title = text(item, 'title');
    return {
      id: text(item, 'guid') || text(item, 'link') || title,
      title,
      company: text(item, 'company') || 'Imported employer',
      description: text(item, 'description'),
      apply_url: text(item, 'link'),
      city: text(item, 'city'),
      province: text(item, 'province') || text(item, 'region'),
      category: text(item, 'category') || 'General',
      job_type: text(item, 'jobtype') || 'Full-time',
      source: 'xml_feed',
    };
  });
}

export function parseXmlFeed(xml: string, format = 'generic_rss') {
  if (format === 'indeed_xml') return parseIndeedXml(xml);
  return parseRssXml(xml);
}
