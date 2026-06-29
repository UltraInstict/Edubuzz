import urllib.request, re, http.cookiejar, urllib.parse
import ssl

BASE = 'https://edubuzz.co.za'
ctx = ssl.create_default_context()
cj = http.cookiejar.CookieJar()
o = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Get login page + CSRF via HTTPS
print('Fetching login page...')
r = o.open(urllib.request.Request(f'{BASE}/login'))
html = r.read().decode()
csrf = re.search(r'name="_csrf"[^>]*value="([^"]+)"', html)
csrftok = csrf.group(1) if csrf else ''
print(f'CSRF: {csrftok[:40]}...')
print(f'Page status: {r.status}')

# 2. POST login via HTTPS
print('\nPosting login...')
data = urllib.parse.urlencode({
    'email': 'praiseleeto@gmail.com',
    'password': 'Mogaila1996!@#',
    '_csrf': csrftok,
}).encode()

req = urllib.request.Request(f'{BASE}/api/auth/login', data=data, headers={
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://edubuzz.co.za',
})
try:
    r2 = o.open(req)
    body = r2.read().decode()
    print(f'Status: {r2.status}')
    print(f'Body: {body[:500]}')
    for c in cj:
        print(f'Cookie set: {c.name}={c.value[:30]}...')
except urllib.error.HTTPError as e:
    print(f'Error: {e.code}')
    print(f'Body: {e.read().decode()[:500]}')

# 3. Test public URL
print('\nTesting public access...')
r3 = urllib.request.urlopen(f'{BASE}/')
print(f'Homepage: {r3.status}')
