# -*- coding: utf-8 -*-
"""Restore polytonic Greek in the Machen scan.

The ABBYY text layer has correct letters but lost every breathing, circumflex
and iota subscript. A second OCR pass with Tesseract's ancient-Greek model
(`grc`) over the same 600-dpi page images reads the diacritics. Neither engine
is trusted alone: a restored form is accepted only when, after stripping
diacritics, the grc reading matches what ABBYY read.

Three passes, widest context first (OCR is far better with context):
  1. whole line   - best for Greek-dominant lines (exercises, vocabulary)
  2. Greek runs   - for Greek quoted inside Russian prose
  3. single word  - last resort for isolated forms and table cells
"""
import pymupdf, sys, os, re, json, io, subprocess, difflib, tempfile
import unicodedata as ud
from concurrent.futures import ThreadPoolExecutor

SPD = sys.argv[1]
OUTF = sys.argv[2]
PAGES = list(range(241)) if len(sys.argv) < 4 else [int(x) for x in sys.argv[3].split(",")]
TESS = SPD + r"\mm\env\Library\bin\tesseract.exe"
os.environ["TESSDATA_PREFIX"] = SPD + r"\mm\env\share\tessdata"
PDF = r"C:\Users\user\Downloads\Telegram Desktop\Uchiebnik ghriechieskogho iazyka Novogho Z - Mieichien D.pdf"

HOMO = {'а':'α','е':'ε','о':'ο','р':'ρ','с':'σ','у':'υ','х':'χ','к':'κ','м':'μ','т':'τ',
 'і':'ι','ѕ':'σ','п':'π','н':'η','в':'β','г':'γ','д':'δ','и':'ι','л':'λ','ф':'φ',
 'a':'α','e':'ε','o':'ο','p':'ρ','c':'σ','y':'υ','x':'χ','i':'ι','u':'υ','v':'ν','n':'η'}
GRK_RE = re.compile(r"[Ͱ-Ͽἀ-῿]")
TOK_RE = re.compile(r"[Ͱ-Ͽἀ-῿]+")


def dehomo(w):
    return ''.join(HOMO.get(c, c) for c in w)


def skel(w):
    """Letter skeleton: diacritics, case and final-sigma removed."""
    d = ud.normalize('NFD', dehomo(w).lower())
    d = ''.join(c for c in d if not (0x300 <= ord(c) <= 0x36F))
    d = ud.normalize('NFC', d.replace('\u0345', '')).replace('ς', 'σ')
    return ''.join(c for c in d if c.isalpha())


def is_greek(w):
    letters = re.sub(r"[^^\w]", "", w, flags=re.U)
    return bool(letters) and len(GRK_RE.findall(w)) >= 0.6 * len(letters)


def ocr(path, psm):
    r = subprocess.run([TESS, path, "-", "-l", "grc", "--psm", str(psm)],
                       capture_output=True, text=True, encoding="utf-8")
    return r.stdout or ""


def lines_of(page, tol=4.0):
    ws = page.get_text("words")
    ws.sort(key=lambda w: (w[1], w[0]))
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


def align(words, got, into, method):
    """Match OCR tokens to ABBYY words by skeleton; record agreements only."""
    sa = [skel(w[4]) for w in words]
    sb = [skel(t) for t in got]
    sm = difflib.SequenceMatcher(a=sa, b=sb, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != 'equal':
            continue
        for k in range(i2 - i1):
            key = id(words[i1 + k])
            if key not in into:
                into[key] = (got[j1 + k], method)


def crop_ocr(page, tmpd, name, box, psms):
    f = os.path.join(tmpd, name + ".png")
    page.get_pixmap(dpi=600, clip=pymupdf.Rect(*box)).save(f)
    for psm in psms:
        toks = TOK_RE.findall(ocr(f, psm))
        if toks:
            yield toks


def bbox(ws, pad=4):
    return (min(w[0] for w in ws) - pad, min(w[1] for w in ws) - pad,
            max(w[2] for w in ws) + pad, max(w[3] for w in ws) + pad)


def do_page(idx):
    doc = pymupdf.open(PDF)
    page = doc[idx]
    tmpd = tempfile.mkdtemp()
    found = {}
    line_grc = {}
    greek_words = []
    try:
        for li, ln in enumerate(lines_of(page)):
            gi = [j for j, w in enumerate(ln) if is_greek(w[4])]
            if not gi:
                continue
            gw = [ln[j] for j in gi]
            greek_words.extend((li, w) for w in gw)

            # pass 1 - the whole line
            for toks in crop_ocr(page, tmpd, f"l{li}", bbox(ln), (6,)):
                line_grc[li] = " ".join(toks)
                align(gw, toks, found, "line")

            # pass 2 - contiguous Greek runs
            if any(id(w) not in found for w in gw):
                runs, cur = [], [gi[0]]
                for prev, j in zip(gi, gi[1:]):
                    if j == prev + 1 and ln[j][0] - ln[prev][2] < 25:
                        cur.append(j)
                    else:
                        runs.append(cur); cur = [j]
                runs.append(cur)
                for run in runs:
                    sub = [ln[j] for j in run]
                    if all(id(w) in found for w in sub):
                        continue
                    for toks in crop_ocr(page, tmpd, f"r{li}_{run[0]}",
                                         bbox(sub), (6, 7)):
                        align(sub, toks, found, "run")

            # pass 3 - one word at a time
            for w in gw:
                if id(w) in found:
                    continue
                for toks in crop_ocr(page, tmpd, f"w{li}_{w[0]:.0f}",
                                     bbox([w], 3), (8, 7, 13, 10)):
                    if len(toks) == 1 and skel(toks[0]) == skel(w[4]):
                        found[id(w)] = (toks[0], "word")
                        break
    finally:
        doc.close()
        for fn in os.listdir(tmpd):
            try: os.remove(os.path.join(tmpd, fn))
            except OSError: pass
        os.rmdir(tmpd)

    out = []
    for li, w in greek_words:
        grc, method = found.get(id(w), (None, None))
        out.append({"idx": idx, "line": li,
                    "x0": round(w[0], 1), "y0": round(w[1], 1),
                    "x1": round(w[2], 1), "y1": round(w[3], 1),
                    "abbyy": w[4], "grc": grc, "method": method,
                    "ok": bool(grc) and skel(grc) == skel(w[4]),
                    "line_grc": line_grc.get(li)})
    return out


if __name__ == "__main__":
    allr = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        for n, res in enumerate(ex.map(do_page, PAGES), 1):
            allr.extend(res)
            if n % 20 == 0:
                print(f"  {n}/{len(PAGES)} pages", flush=True)
    json.dump(allr, io.open(OUTF, "w", encoding="utf-8"), ensure_ascii=False)
    ok = sum(1 for r in allr if r["ok"])
    print(f"Greek words: {len(allr)}  verified: {ok} ({100*ok/max(1,len(allr)):.1f}%)")
