import io, re, collections
for path in [r'src\app\core\i18n\translations.en.ts', r'src\app\core\i18n\translations.hi.ts']:
    s = io.open(path, 'r', encoding='utf-8').read()
    c = collections.Counter(re.findall(r"^\s*'([^']+)'\s*:", s, re.M))
    dups = [k for k, v in c.items() if v > 1]
    print(path, 'dupes:', dups)
