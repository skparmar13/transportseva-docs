# -*- coding: utf-8 -*-
"""Remove duplicate status.* keys I just added."""
import io, re

FILES = [
    r"src\app\core\i18n\translations.en.ts",
    r"src\app\core\i18n\translations.hi.ts",
]

DUPES = {
    'status.pending', 'status.cancelled', 'status.open',
    'status.completed', 'status.onTrip', 'status.idle',
    'status.maintenance', 'status.offline', 'status.paid',
    'status.suspended',
}

for path in FILES:
    with io.open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    marker = '// --- retrofitted marketplace/drivers/fleet page keys ---'
    marker_idx = None
    for i, ln in enumerate(lines):
        if marker in ln:
            marker_idx = i
            break
    if marker_idx is None:
        raise SystemExit(f'marker not found in {path}')
    out = []
    removed = 0
    for i, ln in enumerate(lines):
        if i > marker_idx:
            m = re.match(r"\s*'([^']+)':", ln)
            if m and m.group(1) in DUPES:
                removed += 1
                continue
        out.append(ln)
    with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.writelines(out)
    print(f"{path}: removed {removed} lines")
