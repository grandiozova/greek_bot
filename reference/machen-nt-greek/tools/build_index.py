# -*- coding: utf-8 -*-
"""Stage 4: INDEX.md — the map agents read first."""
import json, io, os, re, sys

ROOT = sys.argv[1]
ROWS = json.load(io.open(sys.argv[2], encoding="utf-8"))
META = json.load(io.open(sys.argv[3], encoding="utf-8"))["lessons"]
OUT  = os.path.join(ROOT, "reference", "machen-nt-greek")
VOC  = json.load(io.open(os.path.join(OUT, "data", "vocabulary-by-lesson.json"), encoding="utf-8"))
LS   = [p["idx"] for p in ROWS if re.match(r"^УРОК\s+\d+", p["text"])]
IN_APP = set(range(1, 11))          # LESSONS_DATA currently holds lessons 1-10
vmap = {v["lesson"]: v for v in VOC}

rows = []
for i, (num, page, title, topics) in enumerate(META):
    a = LS[i]
    b = (LS[i + 1] if i + 1 < 33 else 166) - 1
    v = vmap[num]
    n = len(v["entries"])
    vocab_cell = "—" if n == 0 else (f"{n}" if v["parsed_ok"] else f"{n} ⚠")
    rows.append(
        f"| {num} | [{title}](lessons/lesson-{num:02d}.md) | "
        f"{ROWS[a]['book_page']}–{ROWS[b]['book_page']} | {a+1}–{b+1} | "
        f"{vocab_cell} | {'✅' if num in IN_APP else '—'} |")

topic_lines = []
for num, page, title, topics in META:
    topic_lines.append(f"**Урок {num}. {title}** — " + "; ".join(topics))

md = f"""# Указатель: Мейчен, «Учебник греческого языка Нового Завета»

Карта книги. Начните отсюда, затем откройте нужный файл урока.
Правила работы с этим материалом — в [README.md](README.md).

- **Уроков:** 33 · **страниц:** 241 · **словарных статей в общем словаре:** {len(json.load(io.open(os.path.join(OUT,'data','glossary.json'), encoding='utf-8')))}
- **Колонка «В приложении»** — есть ли урок в `data/lessons.js` (сейчас там уроки 1–10).
- **Колонка «Словарь»** — сколько словарных статей разобрано в
  [`data/vocabulary-by-lesson.json`](data/vocabulary-by-lesson.json);
  ⚠ означает, что разбор неполный и надо смотреть `raw_lines` или сам урок.

## Уроки

| № | Тема | Стр. книги | Стр. PDF | Словарь | В приложении |
|---|---|---|---|---|---|
{chr(10).join(rows)}

## Приложения

| Раздел | Стр. книги | Стр. PDF | Файл |
|---|---|---|---|
| Титул, предисловие, оглавление | 1–6, 236–239 | 1–6, 236–239 | [front-matter.md](front-matter.md) |
| Образцы склонений и спряжений (Е. Б. Смагина) | 167–198 | 167–198 | [appendices/paradigms.md](appendices/paradigms.md) |
| История греческого языка (Е. Б. Смагина) | 199–219 | 199–219 | [appendices/history-of-greek.md](appendices/history-of-greek.md) |
| Общий словарь | 220–235 | 220–235 | [appendices/glossary.md](appendices/glossary.md) |

## Структурированные данные

| Файл | Что внутри |
|---|---|
| [data/vocabulary-by-lesson.json](data/vocabulary-by-lesson.json) | Словарь каждого урока: `entries` (`greek` / `ru`), `parsed_ok`, `raw_lines` |
| [data/glossary.json](data/glossary.json) | Общий словарь книги, те же поля |

## Темы по урокам

{chr(10).join('- ' + t for t in topic_lines)}
"""
io.open(os.path.join(OUT, "INDEX.md"), "w", encoding="utf-8", newline="\n").write(md)
print("INDEX.md written;", len(rows), "lesson rows")
