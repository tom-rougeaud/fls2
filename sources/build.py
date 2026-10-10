#!/usr/bin/env python3
"""Construit dist/index.html (Maths Allophones · Niveau 2) à partir de src/ et content/.
   python3 build.py            → construit et vérifie
   python3 build.py --check    → vérifie seulement
   python3 build.py --publier  → construit puis copie dans ../index.html"""
import json, re, sys, pathlib, glob

ROOT = pathlib.Path(__file__).parent
S = ROOT / 'src'
C = ROOT / 'content'
D = ROOT / 'dist'
D.mkdir(exist_ok=True)

NB = ' '   # espace insécable
NN = ' '   # espace fine insécable
UNITS = r'(?:cm²|cm³|dm²|dm³|m²|m³|km²|km/h|m/s|cm|mm|dm|km|m|kg|g|mg|cL|mL|L|h|min|s|€|%|°C|°|Go|Mo|ko|octets|pas|élèves|ans)'

def typo(s):
    if not isinstance(s, str):
        return s
    s = re.sub(r' ([?!:;»])', NB + r'\1', s)
    s = re.sub(r'« ', '«' + NB, s)
    for _ in range(3):
        s = re.sub(r'(\d) (\d{3})(?!\d)', r'\1' + NN + r'\2', s)
    s = re.sub(r'(\d) ' + UNITS + r'(?![A-Za-zÀ-ÿ])', lambda m: m.group(1) + NB + m.group(0)[len(m.group(1)) + 1:], s)
    return s

RAW = {'id', 'ill', 'fig', 'type', 'form', 'cat', 'g', 'art', 'mod', 'mod1', 'calc', 'icone'}

def walk(o):
    if isinstance(o, dict):
        return {k: (v if k in RAW else walk(v)) for k, v in o.items()}
    if isinstance(o, list):
        return [walk(x) for x in o]
    return typo(o)

def load():
    base = json.loads((C / 'base.json').read_text(encoding='utf-8'))
    chaps = [json.loads(pathlib.Path(f).read_text(encoding='utf-8')) for f in sorted(glob.glob(str(C / 'chap' / '*.json')))]
    words, mods = {}, []
    for w in base['rappels']:
        words[w['id']] = w
    l2 = []
    for ch in chaps:
        for w in ch.pop('mots'):
            w['mod'] = ch['id']
            if w['id'] in words and not words[w['id']].get('n1'):
                print('⚠ mot en double :', w['id'])
            if w['id'] in words:
                w['l1'] = True  # remplace un mot du niveau 1
            words[w['id']] = w
            l2.append(w['id'])
        mods.append(ch)
    known = set(words)
    def strip(s):
        return TOK.sub(lambda m: m.group(0) if (m.group(2) or slug(m.group(1))) in known else m.group(1), s) if isinstance(s, str) else s
    for w in words.values():
        if w.get('n1'):
            for k in ('def', 'note'):
                if k in w: w[k] = strip(w[k])
            w['ph'] = [strip(p) for p in w['ph']]
    data = {
        'app': base['app'], 'version': base['version'],
        'categories': base['categories'], 'modules': mods,
        'mots': [words[i] for i in l2] + [w for w in words.values() if w.get('n1')],
        'commentaires': base['commentaires'], 'evenements': base['evenements'],
    }
    return walk(data)

TOK = re.compile(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]')

def slug(s):
    import unicodedata
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').replace('œ', 'o').replace('æ', 'a')
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', s))

def check(data):
    ids = {w['id'] for w in data['mots']}
    bad, warn = set(), []
    def scan(o, where):
        if isinstance(o, dict):
            for k, v in o.items():
                scan(v, where)
        elif isinstance(o, list):
            for x in o:
                scan(x, where)
        elif isinstance(o, str):
            for m in TOK.finditer(o):
                i = m.group(2) or slug(m.group(1))
                if i not in ids:
                    bad.add((i, where))
            if o.count('{{') != o.count('}}'):
                warn.append(f'accolades {where}: {o[:60]}')
            if o.count('**') % 2:
                warn.append(f'gras {where}: {o[:60]}')
    for m in data['modules']:
        scan(m, m['id'])
        for k, it in enumerate(m.get('comprendre', [])):
            t = it['t']
            if t in ('qcm',) and not (0 <= it['a'] < len(it['o'])):
                warn.append(f"qcm a hors limite {m['id']}#{k}")
            if t == 'question' and not (0 <= it['a'] < len(it['txt'])):
                warn.append(f"question a hors limite {m['id']}#{k}")
            if t == 'donnees':
                for x in it['a']:
                    if x.replace(NN, ' ') not in it['txt'].replace(NN, ' ') and x not in it['txt']:
                        warn.append(f"donnée absente {m['id']}#{k}: {x}")
        for p in m.get('brevet', []):
            for q in p['qs']:
                if q['type'] == 'qcm' and not (0 <= q['a'] < len(q['o'])):
                    warn.append(f"brevet qcm {p['id']}")
    for w in data['mots']:
        scan(w, 'mot:' + w['id'])
        if not w.get('n1'):
            own = [p for p in w['ph'] if any((m.group(2) or slug(m.group(1))) == w['id'] for m in TOK.finditer(p))]
            if not own:
                warn.append(f"aucune phrase avec le mot lui-même : {w['id']}")
    for b in sorted(bad):
        print('✗ mot inconnu :', b)
    for x in warn:
        print('⚠', x)
    return not bad

def build():
    data = load()
    ok = check(data)
    n2 = [w for w in data['mots'] if not w.get('n1')]
    print(f"{len(data['modules'])} chapitres · {len(n2)} mots niveau 2 · {len(data['mots'])-len(n2)} rappels")
    shell = (S / 'shell.html').read_text(encoding='utf-8')
    css = (S / 'fonts.css').read_text(encoding='utf-8') + (S / 'style.css').read_text(encoding='utf-8')
    order = ['core.js', 'db.js', 'voice.js', 'illus.js', 'illus2.js', 'maths.js', 'exos.js', 'studio.js', 'views.js', 'main.js']
    js = '\n'.join((S / f).read_text(encoding='utf-8') for f in order)
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    html = shell.replace('/*CSS*/', css).replace('/*DATA*/', payload).replace('/*JS*/', js)
    (D / 'index.html').write_text(html, encoding='utf-8')
    (D / 'app.check.js').write_text(js, encoding='utf-8')
    (D / 'data.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print('dist/index.html', len(html) // 1024, 'ko')
    return ok

if __name__ == '__main__':
    if '--check' in sys.argv:
        check(load())
    else:
        ok = build()
        if '--publier' in sys.argv:
            # copie l’appli à la racine du dépôt (dossier parent de sources/)
            cible = ROOT.parent / 'index.html'
            cible.write_text((D / 'index.html').read_text(encoding='utf-8'), encoding='utf-8')
            print('copié dans', cible)
        sys.exit(0 if ok else 1)
