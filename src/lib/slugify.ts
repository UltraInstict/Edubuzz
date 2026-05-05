export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const PROVINCES: Record<string, string> = {
  'gauteng': 'Gauteng',
  'western-cape': 'Western Cape',
  'kwazulu-natal': 'KwaZulu-Natal',
  'eastern-cape': 'Eastern Cape',
  'limpopo': 'Limpopo',
  'mpumalanga': 'Mpumalanga',
  'north-west': 'North West',
  'free-state': 'Free State',
  'northern-cape': 'Northern Cape',
  'remote': 'Remote',
};

export const CATEGORIES = [
  'government',
  'health',
  'it-tech',
  'education',
  'finance',
  'engineering',
  'logistics',
  'retail',
  'hospitality',
  'legal',
  'marketing',
  'construction',
  'agriculture',
  'mining',
  'general',
];

export function provinceName(slugOrName: string) {
  return PROVINCES[slugOrName] || Object.values(PROVINCES).find((p) => slugify(p) === slugOrName) || slugOrName;
}

export function titleFromSlug(slug: string) {
  return slug.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
