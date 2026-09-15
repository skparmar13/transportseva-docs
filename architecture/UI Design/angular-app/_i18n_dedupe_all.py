# -*- coding: utf-8 -*-
"""Dedupe translation files — keep first occurrence of each key."""
import io, re
for path in [r"src\app\core\i18n\translations.en.ts", r"src\app\core\i18n\translations.hi.ts"]:
    with io.open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    seen = set()
    out = []
    removed = 0
    for ln in lines:
        m = re.match(r"\s*'([^']+)'\s*:", ln)
        if m:
            k = m.group(1)
            if k in seen:
                removed += 1
                continue
            seen.add(k)
        out.append(ln)
    with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.writelines(out)
    print(f"{path}: removed {removed} duplicate keys")
