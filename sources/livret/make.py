#!/usr/bin/env python3
"""Construit les PDF du livret niveau 2.
   python3 make.py            → QR codes, HTML, mise en page, PDF élève + prof + un PDF par chapitre
   python3 make.py --html     → seulement les HTML (pour regarder dans un navigateur)
   python3 make.py --publier  → en plus, copie le livret élève et les PDF des chapitres dans ../../pdf (racine du dépôt)
La version professeur (build/livret-niveau-2-professeur.pdf) n’est jamais copiée dans le dépôt.
Sorties : build/livret-maths-allophones-niveau-2.pdf, build/prof.pdf, build/pdf/chapitre-NN-id.pdf"""
import asyncio, json, subprocess, sys, pathlib, shutil
from playwright.async_api import async_playwright
from pypdf import PdfReader, PdfWriter

HERE = pathlib.Path(__file__).parent
B = HERE / 'build'
DATA = json.loads((HERE.parent / 'dist' / 'data.json').read_text(encoding='utf-8'))
IDS = [m['id'] for m in DATA['modules']]

def run(*a):
    subprocess.run(a, check=True, cwd=HERE)

async def render(name, pdf):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 794, 'height': 1123})
        await pg.goto((B / f'{name}.html').as_uri())
        await pg.wait_for_function('window.__result', timeout=600000)
        res = await pg.evaluate('window.__result')
        await pg.pdf(path=str(pdf), prefer_css_page_size=True, print_background=True)
        await b.close()
    return res

def meta(path, title):
    r = PdfReader(str(path)); w = PdfWriter(clone_from=r)
    w.add_metadata({'/Title': title, '/Author': 'Tom Rougeaud', '/Subject': 'Maths Allophones · Niveau 2 — CC BY-NC 4.0'})
    with open(path, 'wb') as f: w.write(f)

def split(full, res):
    """Un PDF par chapitre : les pages du chapitre puis ses fiches du glossaire."""
    r = PdfReader(str(full)); n = len(r.pages); secs = res['secs']
    starts = sorted((v, k) for k, v in secs.items())
    def rng(key):
        a = secs[key]; nxt = [v for v, k in starts if v > a]
        return list(range(a - 1, (min(nxt) if nxt else n + 1) - 1))
    out = B / 'pdf'; out.mkdir(exist_ok=True)
    for i, cid in enumerate(IDS):
        w = PdfWriter()
        pages = rng(cid) + rng('g-' + cid)
        for k in pages: w.add_page(r.pages[k])
        m = DATA['modules'][i]
        w.add_metadata({'/Title': f"Maths Allophones · Niveau 2 — Chapitre {i + 1} : {m['titre']}", '/Author': 'Tom Rougeaud'})
        f = out / f'chapitre-{i + 1:02d}-{cid}.pdf'
        with open(f, 'wb') as fh: w.write(fh)
        print(f'  {f.name} : {len(pages)} pages')

async def main():
    run('python3', 'qr.py', json.dumps(IDS))
    run('node', 'gen.js')
    if '--html' in sys.argv: return
    ok = True
    for name, pdf, title in [('eleve', B / 'livret-maths-allophones-niveau-2.pdf', 'Maths Allophones · Niveau 2 — livret'), ('prof', B / 'livret-niveau-2-professeur.pdf', 'Maths Allophones · Niveau 2 — version professeur')]:
        res = await render(name, pdf)
        (B / f'{name}.result.json').write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
        print(f"{name} : {res['pages']} pages · {res['notes']} zones de notes · {res['fits']} textes réduits")
        for e in res['errors']: print('  ✗', e); ok = False
        for e in res['warnings'][:20]: print('  ⚠', e)
        meta(pdf, title)
        if name == 'eleve': split(pdf, res)
    if '--publier' in sys.argv:
        dest = HERE.parent.parent / 'pdf'; dest.mkdir(exist_ok=True)
        shutil.copy(B / 'livret-maths-allophones-niveau-2.pdf', dest)
        for f in sorted((B / 'pdf').glob('chapitre-*.pdf')): shutil.copy(f, dest)
        print('copié dans', dest)
    sys.exit(0 if ok else 1)

asyncio.run(main())
