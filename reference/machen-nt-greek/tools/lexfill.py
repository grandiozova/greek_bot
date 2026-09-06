# -*- coding: utf-8 -*-
"""Fill remaining words from the NT lexicon, but only where it is unambiguous.

Runs after the OCR cross-check. A word is filled only when the SBLGNT/MorphGNT
lexicon holds exactly one polytonic form with that letter skeleton, and the word
is a real word rather than a quoted ending or a textbook notation like
"λύουσι(ν)" - matching those against a lexicon produces nonsense
(the ending "-ουσι(ν)" matches the participle οὖσιν).
"""
import json, io, sys, re, glob, unicodedata as ud
from collections import Counter, defaultdict

HOMO = {'а':'α','е':'ε','о':'ο','р':'ρ','с':'σ','у':'υ','х':'χ','к':'κ','м':'μ','т':'τ',
 'і':'ι','ѕ':'σ','п':'π','н':'η','в':'β','г':'γ','д':'δ','и':'ι','л':'λ','ф':'φ',
 'a':'α','e':'ε','o':'ο','p':'ρ','c':'σ','y':'υ','x':'χ','i':'ι','u':'υ','v':'ν','n':'η'}
NONGRK = re.compile(r"[^Ͱ-Ͽἀ-῿]")


def dehomo(w):
    return ''.join(HOMO.get(c, c) for c in w)


def skel(w):
    d = ud.normalize('NFD', dehomo(w).lower())
    d = ''.join(c for c in d if not (0x300 <= ord(c) <= 0x36F))
    d = ud.normalize('NFC', d.replace('ͅ', '')).replace('ς', 'σ')
    return ''.join(c for c in d if c.isalpha())


def eligible(w):
    """Only plain words: no quoted endings, no (ν) notation, long enough."""
    if w.strip().startswith(('-', '–', '—')):
        return False
    if any(ch in w for ch in "()[]{}0123456789"):
        return False
    return len(skel(w)) >= 4


def main():
    forms = defaultdict(Counter)
    for f in glob.glob("lex/*-morphgnt.txt"):
        for line in io.open(f, encoding="utf-8"):
            p = line.split()
            if len(p) >= 7:
                for w in (p[3], p[4], p[5], p[6]):
                    w = NONGRK.sub('', w)
                    if w:
                        forms[skel(w)][w] += 1

    R = json.load(io.open(sys.argv[1], encoding="utf-8"))
    filled = 0
    for r in R:
        if r["ok"] or not eligible(r["abbyy"]):
            continue
        s = skel(r["abbyy"])
        cands = forms.get(s)
        if not cands and s.endswith('φ'):        # ῳ misread as φ
            cands = forms.get(s[:-1] + 'ω')
        if cands and len(cands) == 1:
            r["grc"] = next(iter(cands))
            r["method"] = "lexicon"
            r["ok"] = True
            filled += 1
    json.dump(R, io.open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False)
    ok = sum(1 for x in R if x["ok"])
    print(f"lexicon-filled: {filled}   total verified: {ok}/{len(R)} ({100*ok/len(R):.1f}%)")


if __name__ == "__main__":
    main()
