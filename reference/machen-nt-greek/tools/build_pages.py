# -*- coding: utf-8 -*-
"""Stage 1b: row-wise page extraction with restored polytonic Greek spliced in."""
import pymupdf, sys, json, io, re

SRC = r"C:\Users\user\Downloads\Telegram Desktop\Uchiebnik ghriechieskogho iazyka Novogho Z - Mieichien D.pdf"

RUNNING_HEAD = re.compile(
    r"^\s*(?:(\d{1,3})\s+)?(?:Учебник\s+греческого\s+языка|Урок\s+\d+|"
    r"Приложения\.\s*[^\d]*|Содержание)\s*(?:\s(\d{1,3}))?\s*$")
BARE_NUM = re.compile(r"^\s*(\d{1,3})\s*$")
ODD_NUM = re.compile(r"^\s*(?:И|no|П|Ι)\s*$")
AFFIX = re.compile(r"^(\W*)(.*?)(\W*)$", re.U | re.S)


def splice(abbyy, grc):
    """Put the restored form back, keeping the original leading/trailing marks."""
    if not grc:
        return abbyy
    m = AFFIX.match(abbyy)
    if not m:
        return grc
    pre, _core, post = m.groups()
    return pre + grc + post


def rowwise(pg, tol=4.0):
    ws = pg.get_text("words")
    if not ws:
        return []
    ws.sort(key=lambda w: (w[1], w[0]))
    lines, cur, base = [], [], None
    for w in ws:
        mid = (w[1] + w[3]) / 2
        if base is None or abs(mid - base) <= tol:
            cur.append(w); base = mid if base is None else (base + mid) / 2
        else:
            lines.append(cur); cur = [w]; base = mid
    if cur:
        lines.append(cur)
    for ln in lines:
        ln.sort(key=lambda w: w[0])
    return lines


def strip_head(lines):
    page_no, keep = None, 0
    for i, ln in enumerate(lines[:3]):
        s = " ".join(w[4] for w in ln).strip()
        if not s:
            keep = i + 1; continue
        m = RUNNING_HEAD.match(s)
        if m:
            for g in m.groups():
                if g and page_no is None:
                    page_no = int(g)
            keep = i + 1; continue
        m = BARE_NUM.match(s)
        if m:
            if page_no is None:
                page_no = int(m.group(1))
            keep = i + 1; continue
        if ODD_NUM.match(s):
            keep = i + 1; continue
        break
    return page_no, lines[keep:]


def to_text(lines):
    out = "\n".join(" ".join(w[4] for w in ln) for ln in lines)
    out = re.sub(r"\u00ad\s*\n\s*", "", out)
    out = re.sub(r"(?<=\w)-\n(?=\w)", "", out)
    return re.sub(r"\n{3,}", "\n\n", out).strip()


def main():
    rest = json.load(io.open(sys.argv[2], encoding="utf-8"))
    fix = {}
    for r in rest:
        if r["ok"]:
            fix[(r["idx"], r["x0"], r["y0"], r["abbyy"])] = r["grc"]

    d = pymupdf.open(SRC)
    pages, n_fixed = [], 0
    for i in range(d.page_count):
        lines = rowwise(d[i])
        for ln in lines:
            for k, w in enumerate(ln):
                grc = fix.get((i, round(w[0], 1), round(w[1], 1), w[4]))
                if grc:
                    ln[k] = (w[0], w[1], w[2], w[3], splice(w[4], grc)) + tuple(w[5:])
                    n_fixed += 1
        page_no, body = strip_head(lines)
        pages.append({
            "idx": i,
            "book_page": page_no if page_no else i + 1,
            "text": to_text(body),
            "words": [[round(w[0], 1), round(w[1], 1), round(w[2], 1),
                       round(w[3], 1), w[4]] for ln in body for w in ln],
        })
    json.dump(pages, io.open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False)
    print(f"pages: {len(pages)}  words restored in text: {n_fixed}")


if __name__ == "__main__":
    main()
