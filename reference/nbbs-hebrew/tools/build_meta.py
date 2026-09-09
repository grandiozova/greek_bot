# -*- coding: utf-8 -*-
"""
build_meta.py — собирает tools/meta.json из готовых уроков.

meta.json — компактная карта книги: [номер, первая страница, последняя
страница, заглавие, [темы]]. По ней строится INDEX.md, и по ней же удобно
за один взгляд понять, что вообще есть в справочнике.

Собирается ИЗ уроков, а не пишется руками: рассинхрона тогда быть не может.

    python build_meta.py
"""

import io
import json
import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LESSONS = os.path.join(ROOT, 'lessons')
OUT = os.path.join(HERE, 'meta.json')

TITLE_RE = re.compile(r'^#\s+\u0413\u043b\u0430\u0432\u0430\s+(\d+)\.\s*(.+?)\s*$')
PAGES_RE = re.compile(r'^\*\*\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u043a\u043d\u0438\u0433\u0438:\*\*\s*(\d+)\s*[\u2013-]\s*(\d+)')
TOPIC_RE = re.compile(r'^\d+\.\s+(.+?)\s*$')


def parse(path):
    lines = io.open(path, encoding='utf-8').read().split('\n')
    no = title = None
    first = last = None
    topics = []
    for ln in lines:
        if ln.startswith('---'):
            break
        m = TITLE_RE.match(ln)
        if m:
            no, title = int(m.group(1)), m.group(2)
            continue
        m = PAGES_RE.match(ln)
        if m:
            first, last = int(m.group(1)), int(m.group(2))
            continue
        m = TOPIC_RE.match(ln)
        if m:
            topics.append(m.group(1).replace('**', ''))
    return [no, first, last, title, topics]


def main():
    rows = []
    for name in sorted(os.listdir(LESSONS)):
        if name.startswith('lesson-') and name.endswith('.md'):
            rows.append(parse(os.path.join(LESSONS, name)))

    body = ',\n'.join(json.dumps(r, ensure_ascii=False) for r in rows)
    io.open(OUT, 'w', encoding='utf-8').write('{"lessons":[\n' + body + '\n]}\n')
    for r in rows:
        sys.stdout.write('\u0433\u043b\u0430\u0432\u0430 %-3s %-38s \u0441\u0442\u0440. %3d\u2013%-3d  %2d \u0442\u0435\u043c\n'
                         % (r[0], r[3][:38], r[1], r[2], len(r[4])))
    sys.stdout.write('\n\u0437\u0430\u043f\u0438\u0441\u0430\u043d\u043e: %s\n' % OUT)


if __name__ == '__main__':
    main()
