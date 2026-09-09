# -*- coding: utf-8 -*-
"""
build_vocab.py — разбирает разделы «Словарь N» из уроков и складывает их
в data/vocabulary-by-lesson.json.

Читает УЖЕ РАСКОДИРОВАННЫЕ уроки (lessons/lesson-NN.md), а не raw: так
в JSON попадает ровно то, что видно в справочнике, и рассинхрона между
ними быть не может.

Формат словарной строки в уроке — строка таблицы:

    | אָב | отец, праотец (1211) |

Число в скобках — частота слова в еврейской Библии, её даёт само пособие.
Это тот самый признак, которого нет в греческих данных, и по нему потом
удобно отбирать «первые 200 самых частотных».

    python build_vocab.py            # пересобрать JSON
    python build_vocab.py --show     # показать разобранное и не писать файл
"""

import argparse
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
OUT = os.path.join(ROOT, 'data', 'vocabulary-by-lesson.json')

# Строка таблицы из двух колонок, где левая — еврейское слово.
ROW_RE = re.compile(r'^\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*$')
# Заголовок раздела со словарём: «## 3.13 Словарь 1», «## 4.10 Словарь 2»,
# а в поздних главах просто «## 10.7 Слова».
VOCAB_HEAD_RE = re.compile(r'^##\s+\d+\.\d+\s+(Словарь|Слова)\b')
ANY_HEAD_RE = re.compile(r'^##\s')
TITLE_RE = re.compile(r'^#\s+Глава\s+(\d+)\.\s*(.+?)\s*$')
PAGE_RE = re.compile(r'^\*\*Страницы книги:\*\*\s*(\d+)')
# Частота в скобках. У пятизначных чисел пособие ставит разделитель тысяч
# («10 978») — пробел обычный, неразрывный или узкий, поэтому допускаются все три.
FREQ_RE = re.compile(r'\((\d[\d   ]*\d|\d)\)')
FREQ_CLEAN_RE = re.compile(r'[   ]')

HEBREW = re.compile(r'[֐-׿]')
# Главы 1, 2 и 9 в пособии словаря не имеют. Урок говорит об этом явно,
# чтобы пустой разбор не путался с потерянным разделом.
NO_VOCAB_RE = re.compile(r'^\*В этой главе словарного раздела нет\.\*')


def parse_lesson(path):
    text = io.open(path, encoding='utf-8').read()
    lines = text.split('\n')

    lesson_no, title, page = None, '', None
    for ln in lines[:12]:
        m = TITLE_RE.match(ln)
        if m:
            lesson_no, title = int(m.group(1)), m.group(2)
        m = PAGE_RE.match(ln)
        if m:
            page = int(m.group(1))

    no_vocab = any(NO_VOCAB_RE.match(ln) for ln in lines[:24])

    entries, raw_lines = [], []
    in_vocab = False
    for ln in lines:
        if VOCAB_HEAD_RE.match(ln):
            in_vocab = True
            continue
        if in_vocab and ANY_HEAD_RE.match(ln):
            in_vocab = False
            continue
        if not in_vocab:
            continue
        m = ROW_RE.match(ln)
        if not m:
            continue
        word, gloss = m.group(1).strip(), m.group(2).strip()
        # шапка таблицы и разделитель |---|---|
        if not HEBREW.search(word):
            continue
        raw_lines.append(ln.strip())
        freq = FREQ_RE.search(gloss)
        entries.append({
            'he': word,
            'ru': gloss,
            'freq': int(FREQ_CLEAN_RE.sub('', freq.group(1))) if freq else None,
        })

    return {
        'lesson': lesson_no,
        'book_page': page,
        'title': title,
        'entries': entries,
        'parsed_ok': bool(entries) or no_vocab,
        'no_vocab': no_vocab,
        'raw_lines': raw_lines,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--show', action='store_true')
    args = ap.parse_args()

    out = []
    for name in sorted(os.listdir(LESSONS)):
        if not name.startswith('lesson-') or not name.endswith('.md'):
            continue
        out.append(parse_lesson(os.path.join(LESSONS, name)))

    total = sum(len(x['entries']) for x in out)
    for x in out:
        if x['no_vocab']:
            flag = '  (словаря нет в пособии)'
        elif x['parsed_ok']:
            flag = ''
        else:
            flag = '  <-- разбор пуст, проверьте урок'
        sys.stdout.write('глава %-3s %-42s %3d слов%s\n'
                         % (x['lesson'], x['title'][:42], len(x['entries']), flag))
    sys.stdout.write('\nвсего словарных статей: %d\n' % total)

    if args.show:
        for x in out:
            for e in x['entries']:
                sys.stdout.write('%-16s %s\n' % (e['he'], e['ru'][:60]))
        return

    io.open(OUT, 'w', encoding='utf-8').write(
        json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    sys.stdout.write('записано: %s\n' % OUT)


if __name__ == '__main__':
    main()
