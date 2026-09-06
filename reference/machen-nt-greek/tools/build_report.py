# -*- coding: utf-8 -*-
"""Stage 5: the restoration audit — what was verified and what still is not."""
import json, io, os, sys, re
from collections import Counter

ROOT = sys.argv[1]
REST = json.load(io.open(sys.argv[2], encoding="utf-8"))
OUT = os.path.join(ROOT, "reference", "machen-nt-greek")

SECTIONS = [("Уроки 1–33", 6, 166), ("Приложение: парадигмы", 166, 198),
            ("Приложение: история языка", 198, 219), ("Приложение: словарь", 219, 235),
            ("Титул, предисловие, оглавление", 0, 6), ("Выходные данные", 235, 241)]

tot = len(REST)
ok = sum(1 for r in REST if r["ok"])
bad = [r for r in REST if not r["ok"]]

# per-word audit trail, keyed by page
audit = {}
for r in REST:
    audit.setdefault(str(r["idx"] + 1), []).append({
        "abbyy": r["abbyy"], "restored": r["grc"] if r["ok"] else None,
        "verified": r["ok"], "method": r["method"],
        **({"grc_line": r.get("line_grc")} if not r["ok"] else {}),
    })
json.dump(audit, io.open(os.path.join(OUT, "data", "greek-restoration.json"), "w",
                         encoding="utf-8", newline="\n"), ensure_ascii=False, indent=1)

sec_rows = []
for name, a, b in SECTIONS:
    s = [r for r in REST if a <= r["idx"] < b]
    if not s:
        continue
    o = sum(1 for r in s if r["ok"])
    sec_rows.append(f"| {name} | {len(s)} | {o} | {100*o/len(s):.1f}% |")

by_page = Counter(r["idx"] + 1 for r in bad)
worst = "\n".join(f"| {p} | {n} |" for p, n in by_page.most_common(15))

rows = []
for r in bad[:400]:
    line = (r.get("line_grc") or "").strip()
    line = (line[:80] + "…") if len(line) > 80 else line
    rows.append(f"| {r['idx']+1} | `{r['abbyy']}` | {line} |")

md = f"""# Отчёт о восстановлении политоники

Как это сделано — в [README.md](README.md#восстановление-политоники).
Коротко: слой ABBYY даёт буквы, второй проход Tesseract моделью `grc`
по тем же изображениям 600 dpi даёт диакритику. Форма принимается,
**только если оба чтения совпадают по буквам** — иначе слово остаётся
как было и попадает в список ниже.

## Итог

| | |
|---|---|
| Греческих слов всего | {tot} |
| Восстановлено | **{ok} ({100*ok/tot:.1f}%)** |
| Осталось как было | {len(bad)} ({100*len(bad)/tot:.1f}%) |

По способу восстановления:

| Способ | Слов | Что это значит |
|---|---|---|
| `ocr` | {sum(1 for r in REST if r['ok'] and r['method'] != 'lexicon')} | **Два независимых источника согласны.** ABBYY и `grc` прочитали одни и те же буквы, диакритика взята из `grc`. Высшая надёжность. |
| `lexicon` | {sum(1 for r in REST if r['ok'] and r['method'] == 'lexicon')} | `grc` не дал совпадения, но в словаре Нового Завета есть **ровно одна** форма с таким набором букв. Надёжно, но подтверждено одним источником. |

| Раздел | Слов | Проверено | Доля |
|---|---|---|---|
{chr(10).join(sec_rows)}

## Что означает «непроверено»

Почти всегда это места, где **сам слой ABBYY повреждён** — склеенные
или удвоенные фрагменты вроде `βλέπειθίάνθρωπον.` или
`άξειάξειсо31κύριοςXτούςθ`. Сверять там нечего: у ABBYY нет чистого слова,
с которым можно сопоставить чтение `grc`. Такие слова оставлены **как есть**
(без придыханий) — их видно невооружённым глазом.

В колонке «чтение grc» — как ту же строку прочитала греческая модель.
Обычно она читает эти места правильно, так что строка годится как подсказка,
но она **не проверена** вторым источником: перед переносом в `data/lessons.js`
сверьтесь с текстом Нового Завета.

## Страницы с наибольшим числом непроверенных слов

| Стр. книги | Непроверено |
|---|---|
{worst}

## Список непроверенных слов

Полные данные по каждому греческому слову, включая проверенные, —
в [`data/greek-restoration.json`](data/greek-restoration.json)
(ключ — номер страницы книги).

| Стр. | Слой ABBYY | Чтение grc для этой строки |
|---|---|---|
{chr(10).join(rows)}
"""
if len(bad) > 400:
    md += f"\n_Показаны первые 400 из {len(bad)}; остальные — в JSON._\n"
io.open(os.path.join(OUT, "restoration-report.md"), "w",
        encoding="utf-8", newline="\n").write(md)
print(f"report written: {ok}/{tot} verified ({100*ok/tot:.1f}%), {len(bad)} flagged")
