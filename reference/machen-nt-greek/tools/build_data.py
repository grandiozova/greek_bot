# -*- coding: utf-8 -*-
"""Stage 3: structured JSON — per-lesson vocabulary and the appendix glossary."""
import json, io, os, re, sys

ROOT = sys.argv[1]
ROWS = json.load(io.open(sys.argv[2], encoding="utf-8"))
META = json.load(io.open(sys.argv[3], encoding="utf-8"))["lessons"]
OUT  = os.path.join(ROOT, "reference", "machen-nt-greek", "data")
LESSON_START = [p["idx"] for p in ROWS if re.match(r"^УРОК\s+\d+", p["text"])]

GREEK = r"Ͱ-Ͽἀ-῿"
DASH  = re.compile(r"\s*[—–\-]\s*")


def rows_of(words, tol=4.0):
    """Group [x0,y0,x1,y1,text] words into visual rows."""
    ws = sorted(words, key=lambda w: (w[1], w[0]))
    out, cur, base = [], [], None
    for w in ws:
        mid = (w[1] + w[3]) / 2
        if base is None or abs(mid - base) <= tol:
            cur.append(w); base = mid if base is None else (base + mid) / 2
        else:
            out.append(cur); cur = [w]; base = mid
    if cur:
        out.append(cur)
    for r in out:
        r.sort(key=lambda w: w[0])
    return out


def column_split(words, lo=90.0, hi=260.0, min_gap=12.0):
    """Find the widest vertical whitespace band between lo..hi -> column boundary."""
    if not words:
        return None
    spans = sorted((w[0], w[2]) for w in words)
    best, cur_end = None, spans[0][1]
    for a, b in spans[1:]:
        if a - cur_end >= min_gap:
            mid = (cur_end + a) / 2
            if lo <= mid <= hi:
                gap = a - cur_end
                if best is None or gap > best[0]:
                    best = (gap, mid)
        cur_end = max(cur_end, b)
    return best[1] if best else None


def _parse_group(words):
    """Read one column group row-wise into 'greek - russian' entries."""
    out, buf = [], []
    for r in rows_of(words):
        line = " ".join(w[4] for w in r).strip()
        if not line or line in ("СЛОВАРЬ", "УПРАЖНЕНИЯ"):
            continue
        if re.match(rf"^[{GREEK}]", line) and DASH.search(line):
            if buf:
                out.append(" ".join(buf))
            buf = [line]
        elif buf:
            buf.append(line)
    if buf:
        out.append(" ".join(buf))
    parsed = []
    for e in out:
        m = DASH.split(e, maxsplit=1)
        if len(m) == 2 and m[0].strip() and m[1].strip():
            parsed.append({"greek": m[0].strip(), "ru": m[1].strip()})
    return parsed


def entry_split(words):
    """Locate the second column by where second entries start on shared rows.

    In a two-column vocabulary a row reads "greek - russian   greek - russian".
    For every such row take the x of the word beginning the second entry; the
    median of those is the column boundary.
    """
    xs = []
    for r in rows_of(words):
        toks = [w[4] for w in r]
        dashes = [i for i, t in enumerate(toks) if DASH.fullmatch(t) or
                  (len(t) > 1 and t[0] in "—–-")]
        if len(dashes) < 2:
            continue
        for i in range(dashes[0] + 1, dashes[-1] + 1):
            if re.match(rf"^[{GREEK}]", toks[i]):
                xs.append(r[i][0])
                break
    if len(xs) < 3:
        return None
    xs.sort()
    return xs[len(xs) // 2]


def entries_from(words):
    """Vocabulary blocks are either one key/value column or two side by side.

    A gap-based split cannot tell those apart (the dash column also leaves a
    band), so try every reading and keep whichever yields the most entries.
    """
    if not words:
        return []
    best = _parse_group(words)
    for split in (entry_split(words), column_split(words)):
        if split is None:
            continue
        two = (_parse_group([w for w in words if w[0] < split])
               + _parse_group([w for w in words if w[0] >= split]))
        if len(two) > len(best):
            best = two
    # flag entries that still look like two merged rows
    for e in best:
        if re.search(rf"[{GREEK}][^\s]*\s*[—–]", e["ru"]):
            e["needs_review"] = True
    return best


# ------------------------------------------------------- per-lesson vocabulary
vocab = []
for i, (num, page, title, topics) in enumerate(META):
    a = LESSON_START[i]
    b = LESSON_START[i + 1] if i + 1 < 33 else 166
    block, collecting = [], False
    for p in ROWS[a:b]:
        ws = p["words"]
        start_y = next((w[1] for w in ws if w[4] == "СЛОВАРЬ"), None)
        end_y = next((w[1] for w in ws if w[4] == "УПРАЖНЕНИЯ"), None)
        if start_y is not None:
            collecting = True
            sel = [w for w in ws if w[1] > start_y and (end_y is None or w[1] < end_y)]
        elif collecting:
            sel = [w for w in ws if end_y is None or w[1] < end_y]
        else:
            sel = []
        block.extend(sel)
        if collecting and end_y is not None:
            collecting = False
    ents = entries_from(block)
    raw = [" ".join(w[4] for w in r).strip() for r in rows_of(block)]
    raw = [l for l in raw if l and l not in ("СЛОВАРЬ", "УПРАЖНЕНИЯ")]
    vocab.append({"lesson": num, "book_page": page, "title": title,
                  "entries": ents,
                  "parsed_ok": len(ents) >= 0.6 * len(raw),
                  "raw_lines": raw})

# ------------------------------------------------------------------- glossary
gl_words = [w for p in ROWS[219:235] for w in p["words"]]
gloss = []
buf = []
for p in ROWS[219:235]:
    for r in rows_of(p["words"]):
        line = " ".join(w[4] for w in r).strip()
        if not line or line == "СЛОВАРЬ":
            continue
        if re.match(rf"^[{GREEK}]", line) and r[0][0] < 40:
            if buf:
                gloss.append(" ".join(buf))
            buf = [line]
        elif buf:
            buf.append(line)
if buf:
    gloss.append(" ".join(buf))
gl = []
for e in gloss:
    m = DASH.split(e, maxsplit=1)
    if len(m) == 2 and m[0].strip() and m[1].strip():
        gl.append({"greek": m[0].strip(), "ru": m[1].strip()})

os.makedirs(OUT, exist_ok=True)
json.dump(vocab, io.open(os.path.join(OUT, "vocabulary-by-lesson.json"), "w",
                         encoding="utf-8", newline="\n"), ensure_ascii=False, indent=1)
json.dump(gl, io.open(os.path.join(OUT, "glossary.json"), "w",
                      encoding="utf-8", newline="\n"), ensure_ascii=False, indent=1)
print("lessons with vocab:", sum(1 for v in vocab if v["entries"]),
      "| total lesson entries:", sum(len(v["entries"]) for v in vocab),
      "| glossary entries:", len(gl))
for v in vocab[:6]:
    print(f"  L{v['lesson']}: {len(v['entries'])}")
