import subprocess, re

h = subprocess.run(['curl', '-s', 'http://127.0.0.1:4321/'], capture_output=True, text=True).stdout
types = re.findall(r'data-ad-type="([^"]+)"', h)
zones = re.findall(r'smart-ad smart-ad--(\S+)', h)
frames = len(re.findall(r'smart-ad__frame', h))
sponsored = h.count('SPONSORED')
text_ads = len(re.findall(r'text-ad', h))

print(f'Ad blocks: {len(types)}')
print(f'Frames: {frames}')
print(f'SPONSORED labels: {sponsored}')
print(f'Text ads: {text_ads}')
print(f'Types: { {t: types.count(t) for t in set(types)} }')
print(f'Zones: { {z: zones.count(z) for z in set(zones)} }')
