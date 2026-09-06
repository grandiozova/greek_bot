# -*- coding: utf-8 -*-
"""Stage 2: turn the cleaned pages into the reference tree under reference/machen-nt-greek/."""
import json, io, os, re, sys

ROOT = sys.argv[1]                    # repo root
ROWS = json.load(io.open(sys.argv[2], encoding="utf-8"))
META = json.load(io.open(sys.argv[3], encoding="utf-8"))["lessons"]
OUT  = os.path.join(ROOT, "reference", "machen-nt-greek")

LESSON_START = [p["idx"] for p in ROWS if re.match(r"^УРОК\s+\d+", p["text"])]
assert len(LESSON_START) == 33, len(LESSON_START)

SECTIONS = {          # idx ranges, end-exclusive
    "front":     (0, 6),
    "paradigms": (166, 198),
    "history":   (198, 219),
    "glossary":  (219, 235),
    "toc":       (235, 239),
    "back":      (239, 241),
}

def w(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, "w", encoding="utf-8", newline="\n").write(text)

def body(a, b, mark=True):
    """Concatenate cleaned pages [a,b) with [p.N] markers."""
    out = []
    for p in ROWS[a:b]:
        t = p["text"].strip()
        if not t:
            continue
        if mark:
            out.append(f"\n[p. {p['book_page']}]\n")
        out.append(t)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip()

def promote(text):
    """Turn the book's section labels into markdown headings."""
    text = re.sub(r"^СЛОВАРЬ\s*$", "## Словарь", text, flags=re.M)
    text = re.sub(r"^УПРАЖНЕНИЯ\s*$", "## Упражнения", text, flags=re.M)
    return text

# ---------------------------------------------------------------- lessons
lesson_files = []
for i, (num, page, title, topics) in enumerate(META):
    a = LESSON_START[i]
    b = LESSON_START[i + 1] if i + 1 < 33 else 166
    txt = body(a, b)
    txt = re.sub(r"^(\[p\. \d+\]\s*\n+)УРОК\s+\d+[^\n]*\n", r"\1", txt, count=1)
    txt = promote(txt)
    head = (
        f"# Урок {num}. {title}\n\n"
        f"**Страницы книги:** {ROWS[a]['book_page']}–{ROWS[b-1]['book_page']} · "
        f"**страницы PDF:** {a+1}–{b} (0-based idx {a}–{b-1})\n\n"
        "**Темы урока:**\n" + "".join(f"{n}. {t}\n" for n, t in enumerate(topics, 1)) +
        "\n> Политоника восстановлена: 95% слов подтверждено двумя источниками.\n"
        "> Слово без придыхания — из оставшихся 5%; сверьте его по "
        "[restoration-report.md](../restoration-report.md).\n\n---\n\n"
    )
    fn = f"lesson-{num:02d}.md"
    w(os.path.join(OUT, "lessons", fn), head + txt + "\n")
    lesson_files.append((num, page, title, topics, fn, ROWS[a]['book_page'], ROWS[b-1]['book_page']))

# ---------------------------------------------------------------- appendices
w(os.path.join(OUT, "appendices", "paradigms.md"),
  "# Приложение 1. Образцы склонений и спряжений\n\n"
  "Е. Б. Смагина. Страницы книги 167–198.\n\n"
  "> Политоника восстановлена; непроверенные слова — в [restoration-report.md](../restoration-report.md).\n\n---\n\n"
  + body(*SECTIONS["paradigms"]) + "\n")

w(os.path.join(OUT, "appendices", "history-of-greek.md"),
  "# Приложение 2. История греческого языка\n\n"
  "Е. Б. Смагина. «Место и особенности языка Нового Завета». Страницы книги 199–219.\n\n"
  "---\n\n" + body(*SECTIONS["history"]) + "\n")

w(os.path.join(OUT, "appendices", "glossary.md"),
  "# Приложение 3. Словарь (греческо-русский)\n\n"
  "Общий словарь учебника. Страницы книги 220–235.\n\n"
  "> Политоника восстановлена; непроверенные слова — в [restoration-report.md](../restoration-report.md).\n\n---\n\n"
  + body(*SECTIONS["glossary"]) + "\n")

w(os.path.join(OUT, "front-matter.md"),
  "# Титул и предисловие\n\n" + body(*SECTIONS["front"]) + "\n\n"
  "---\n\n# Содержание (оригинальное)\n\n" + body(*SECTIONS["toc"]) + "\n\n"
  "---\n\n# Выходные данные\n\n" + body(*SECTIONS["back"]) + "\n")

print("lessons:", len(lesson_files))
json.dump(lesson_files, io.open(os.path.join(sys.argv[4]), "w", encoding="utf-8"), ensure_ascii=False)
