const KEY = import.meta.env.INDEXNOW_KEY || 'set-indexnow-key-in-env';
const SITE_URL = import.meta.env.SITE_URL || 'https://edubuzz.co.za';

const ENGINES = [
  'https://www.bing.com/indexnow',
  'https://api.indexnow.org/indexnow',
  'https://yandex.com/indexnow',
];

const SEARCHLY_API_ENDPOINT = 'https://www.bing.com/webmaster/api/indexnow';

export function getIndexNowKey(): string {
  return KEY;
}

export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;
  const host = new URL(SITE_URL).hostname;
  const keyLocation = `${SITE_URL}/.well-known/indexnow.txt`;
  const body = JSON.stringify({ host, key: KEY, keyLocation, urlList: urls });
  await Promise.allSettled(
    ENGINES.map((engine) =>
      fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).catch(() => {})
    )
  );
}

export async function pingJobCreated(jobSlug: string): Promise<void> {
  const urls = [
    `${SITE_URL}/job/${jobSlug}`,
    `${SITE_URL}/`,
    `${SITE_URL}/jobs`,
  ];
  await pingIndexNow(urls);
}

export async function pingJobUpdated(jobSlug: string): Promise<void> {
  await pingIndexNow([`${SITE_URL}/job/${jobSlug}`]);
}

export async function pingJobDeleted(jobSlug: string): Promise<void> {
  await pingIndexNow([`${SITE_URL}/job/${jobSlug}`]);
}
