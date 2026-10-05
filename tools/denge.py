#!/usr/bin/env python3
"""Kart dengesi denetçisi — her build öncesi çalışır (CLAUDE.md §2).

data/cards.json'daki her normal karar kartının (type alanı olmayan) iki seçeneğini
dört güç (saray, yeniçeri, ulema, hazine) üzerinden karşılaştırır.

HATA (build durur):
  etkisiz   — iki seçenek aynı ya da toplam etki ≤ 2
  baskın    — bir seçenek her güçte eşit ya da daha iyi; iki tarafta da gizli sonuç yok
  bedelsiz  — bir seçenek hiçbir gücü düşürmüyor ve o seçeneğin gizli sonucu yok
  biçim     — bilinmeyen güç anahtarı, tekrarlanan id, eksik metin
UYARI (build sürer):
  baskın/bedelsiz ama gizli sonucu (bayrak, zincir, arc, dönem, eşya) olan kart
  bedel orantısız: bir seçenek büyük kazanç (≥ +8 toplam) verip yalnızca −1 bedel istiyor

İstisna: kartta "denge_muaf": "<sebep>" (ör. "ödül" — bilerek ödül veren sonuç kartları).

Kullanım:  python3 tools/denge.py          (özet + hatalar)
           python3 tools/denge.py -v       (uyarıları da listeler)
Çıkış kodu: hata varsa 1.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATS = ["saray", "yeniçeri", "ulema", "hazine"]
SHORT = dict(zip(STATS, ["S", "O", "U", "H"]))


def vec(card, side):
    fx = card.get(side + "_effects") or {}
    return [fx.get(k, 0) for k in STATS]


def hidden(card, side):
    return bool(card.get(side + "_flags_set") or card.get("triggers_on_" + side)
                or card.get("triggers_arc_on_" + side) or card.get(side + "_era")
                or card.get("grants_item_on_" + side))


def fmt(v):
    return " ".join(f"{SHORT[k]}{x:+d}" for k, x in zip(STATS, v) if x) or "0"


def main():
    verbose = "-v" in sys.argv
    with open(os.path.join(ROOT, "data", "cards.json"), encoding="utf-8") as f:
        cards = json.load(f)["cards"]

    errors, warns, seen = [], [], set()
    counts = {"gerçek ikilem": 0, "muaf": 0, "uyarılı": 0}
    for c in cards:
        cid = c.get("id", "?")
        if cid in seen:
            errors.append(f"biçim     {cid}: id tekrarlanıyor")
        seen.add(cid)
        for side in ("left", "right"):
            bad = set((c.get(side + "_effects") or {}).keys()) - set(STATS)
            if bad:
                errors.append(f"biçim     {cid}: bilinmeyen güç {sorted(bad)} ({side})")
        if c.get("type"):
            continue
        for k in ("text", "text_en"):
            if not c.get(k):
                errors.append(f"biçim     {cid}: '{k}' boş")
        if c.get("denge_muaf"):
            counts["muaf"] += 1
            continue

        L, R = vec(c, "left"), vec(c, "right")
        hl, hr = hidden(c, "left"), hidden(c, "right")
        line = f"{cid} [{c.get('character_name', '')}]  sol {fmt(L)}{' ⚑' if hl else ''} | sağ {fmt(R)}{' ⚑' if hr else ''}"

        if L == R or sum(map(abs, L + R)) <= 2:
            errors.append("etkisiz   " + line)
            continue
        if all(a >= b for a, b in zip(L, R)) or all(b >= a for a, b in zip(L, R)):
            (warns if (hl or hr) else errors).append("baskın    " + line)
            counts["uyarılı"] += bool(hl or hr)
            continue
        free = [s for s, v, h in (("left", L, hl), ("right", R, hr)) if not any(x < 0 for x in v)]
        if free:
            if all(hidden(c, s) for s in free):
                warns.append("bedelsiz  " + line)
                counts["uyarılı"] += 1
            else:
                errors.append("bedelsiz  " + line)
            continue
        for v in (L, R):
            if sum(x for x in v if x > 0) >= 8 and min(v) == -1:
                warns.append("orantısız " + line)
                break
        counts["gerçek ikilem"] += 1

    normal = sum(1 for c in cards if not c.get("type"))
    print(f"Denge denetçisi: {normal} karar kartı · {counts['gerçek ikilem']} gerçek ikilem · "
          f"{counts['uyarılı']} gizli sonuçlu istisna · {counts['muaf']} muaf · {len(errors)} hata")
    if verbose:
        for w in warns:
            print("  uyarı  " + w)
    for e in errors:
        print("  HATA   " + e)
    if errors:
        print("Build öncesi düzeltin ya da kartı bilinçli istisnaysa \"denge_muaf\": \"<sebep>\" ile işaretleyin.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
