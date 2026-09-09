# -*- coding: utf-8 -*-
"""
build_index.py — собирает INDEX.md из meta.json и data/vocabulary-by-lesson.json.

Карта книги: глава -> темы, страницы, файл, число словарных статей.
Всё берётся из сгенерированных файлов, руками в INDEX.md ничего не правят —
поправка потеряется при следующей сборке.

    python build_index.py
"""

import io
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
META = os.path.join(HERE, 'meta.json')
VOCAB = os.path.join(ROOT, 'data', 'vocabulary-by-lesson.json')
OUT = os.path.join(ROOT, 'INDEX.md')

HEAD = u"""# \u0423\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c: \u041d\u0411\u0411\u0421, \u00ab\u0413\u0440\u0430\u043c\u043c\u0430\u0442\u0438\u043a\u0430 \u0434\u0440\u0435\u0432\u043d\u0435\u0435\u0432\u0440\u0435\u0439\u0441\u043a\u043e\u0433\u043e \u044f\u0437\u044b\u043a\u0430\u00bb

\u041a\u0430\u0440\u0442\u0430 \u043a\u043d\u0438\u0433\u0438. \u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u043e\u0442\u0441\u044e\u0434\u0430, \u0437\u0430\u0442\u0435\u043c \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043d\u0443\u0436\u043d\u044b\u0439 \u0444\u0430\u0439\u043b \u0433\u043b\u0430\u0432\u044b.
\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u0440\u0430\u0431\u043e\u0442\u044b \u0441 \u044d\u0442\u0438\u043c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u043c \u2014 \u0432 [README.md](README.md).

- **\u0420\u0430\u0441\u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u043e \u0433\u043b\u0430\u0432:** %(n)d \u0438\u0437 36 \u00b7 **\u0441\u0442\u0440\u0430\u043d\u0438\u0446:** %(p1)d\u2013%(p2)d \u0438\u0437 273 \u00b7 **\u0441\u043b\u043e\u0432\u0430\u0440\u043d\u044b\u0445 \u0441\u0442\u0430\u0442\u0435\u0439:** %(w)d
- \u0420\u0430\u0441\u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u044b \u0433\u043b\u0430\u0432\u044b 1\u201311 \u2014 \u0432\u0441\u044f \u0438\u043c\u0435\u043d\u043d\u0430\u044f \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u044f\u0437\u044b\u043a\u0430, \u0434\u043e \u0433\u043b\u0430\u0433\u043e\u043b\u0430.
  \u0413\u043b\u0430\u0432\u044b 12\u201336 (\u0433\u043b\u0430\u0433\u043e\u043b, \u043f\u043e\u0440\u043e\u0434\u044b) \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u0432 PDF \u0438 \u043f\u043e\u043a\u0430 \u043d\u0435 \u0440\u0430\u0437\u043e\u0431\u0440\u0430\u043d\u044b.
- **\u041a\u043e\u043b\u043e\u043d\u043a\u0430 \u00ab\u0421\u043b\u043e\u0432\u0430\u0440\u044c\u00bb** \u2014 \u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0441\u0442\u0430\u0442\u0435\u0439 \u0440\u0430\u0437\u043e\u0431\u0440\u0430\u043d\u043e \u0432
  [`data/vocabulary-by-lesson.json`](data/vocabulary-by-lesson.json);
  \u00ab\u2014\u00bb \u043e\u0437\u043d\u0430\u0447\u0430\u0435\u0442, \u0447\u0442\u043e \u0441\u043b\u043e\u0432\u0430\u0440\u043d\u043e\u0433\u043e \u0440\u0430\u0437\u0434\u0435\u043b\u0430 \u043d\u0435\u0442 \u0432 \u0441\u0430\u043c\u043e\u043c \u043f\u043e\u0441\u043e\u0431\u0438\u0438.
- **\u041a\u043e\u043b\u043e\u043d\u043a\u0430 \u00ab\u0412 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0438\u00bb** \u2014 \u0435\u0441\u0442\u044c \u043b\u0438 \u0433\u043b\u0430\u0432\u0430 \u0432 `data/hebrew-lessons.js`
  (\u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043d\u0438 \u043e\u0434\u043d\u043e\u0439: \u044d\u0442\u043e \u0444\u0430\u0437\u0430 5 \u043f\u043b\u0430\u043d\u0430).

## \u0413\u043b\u0430\u0432\u044b

| \u2116 | \u0422\u0435\u043c\u0430 | \u0421\u0442\u0440. \u043a\u043d\u0438\u0433\u0438 | \u0421\u043b\u043e\u0432\u0430\u0440\u044c | \u0412 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0438 |
|---|---|---|---|---|
"""


def main():
    meta = json.loads(io.open(META, encoding='utf-8').read())['lessons']
    vocab = json.loads(io.open(VOCAB, encoding='utf-8').read())
    by_no = dict((v['lesson'], v) for v in vocab)

    total = sum(len(v['entries']) for v in vocab)
    out = [HEAD % {'n': len(meta), 'p1': meta[0][1], 'p2': meta[-1][2], 'w': total}]

    for no, p1, p2, title, topics in meta:
        v = by_no.get(no, {})
        n = len(v.get('entries', []))
        if v.get('no_vocab'):
            cell = u'\u2014'
        elif not v.get('parsed_ok', True):
            cell = u'%d \u26a0' % n
        else:
            cell = u'%d' % n
        out.append(u'| %d | [%s](lessons/lesson-%02d.md) | %d\u2013%d | %s | \u2014 |\n'
                   % (no, title, no, p1, p2, cell))

    out.append(u'\n## \u0422\u0435\u043c\u044b \u043f\u043e \u0433\u043b\u0430\u0432\u0430\u043c\n')
    for no, p1, p2, title, topics in meta:
        out.append(u'\n**%d. %s** (\u0441\u0442\u0440. %d\u2013%d)\n\n' % (no, title, p1, p2))
        for i, t in enumerate(topics, 1):
            out.append(u'%d. %s\n' % (i, t))

    io.open(OUT, 'w', encoding='utf-8').write(''.join(out))
    sys.stdout.write(u'\u0437\u0430\u043f\u0438\u0441\u0430\u043d\u043e: %s (%d \u0433\u043b\u0430\u0432, %d \u0441\u0442\u0430\u0442\u0435\u0439)\n'
                     % (OUT, len(meta), total))


if __name__ == '__main__':
    main()
