import subprocess, re
h = subprocess.run(['curl', '-s', 'http://127.0.0.1:4321/'], capture_output=True, text=True).stdout

for i, m in enumerate(re.finditer(r'smart-ad smart-ad--strip', h)):
    start = max(0, m.start() - 300)
    end = min(len(h), m.end() + 200)
    snippet = h[start:end]
    print(f'=== STRIP #{i+1} (offset {m.start()}) ===')
    print(snippet)
    print()
