"""Run with python3 specs/design-system/check.py; checks the actual color tokens."""
import re
from pathlib import Path

config = (Path(__file__).parents[2] / 'apps/site/panda.config.ts').read_text()
pairs = re.findall(r'(\w+): \{ value: \{ base: "(#[0-9a-f]{6})", _dark: "(#[0-9a-f]{6})" \} \}', config)
assert len(pairs) == 8, 'Expected eight semantic color pairs'


def luminance(color):
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in channels]
    return sum(v * w for v, w in zip(linear, (0.2126, 0.7152, 0.0722)))


ratios = []
for index, mode in enumerate(('light', 'dark'), start=1):
    colors = {pair[0]: pair[index] for pair in pairs}
    for foreground in ('ink', 'secondary', 'muted', 'accent'):
        for background in ('paper', 'surface'):
            low, high = sorted((luminance(colors[foreground]), luminance(colors[background])))
            ratio = (high + 0.05) / (low + 0.05)
            assert ratio >= 4.5, f'{mode} {foreground}/{background}: {ratio:.2f}'
            ratios.append(ratio)
print(f'{len(ratios)} color pairs passed; minimum contrast {min(ratios):.2f}:1')
