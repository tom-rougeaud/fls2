"""Tests de bout en bout dans Chromium (vrai navigateur), avec le faux Supabase.
   Micro simulé (Chromium fournit un son de test) pour essayer le studio."""
import asyncio, json, sys, urllib.request
from playwright.async_api import async_playwright
BASE = 'http://127.0.0.1:8899/index.html'
import os, tempfile
OUT = os.environ.get('CAPTURES', os.path.join(tempfile.gettempdir(), 'captures-fls2'))
ok = 0; ko = []
def check(c, m):
    global ok
    if c: ok += 1
    else: ko.append(m); print('✗', m)
def log(): return json.loads(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8899/sb/__log', headers={'apikey': 'sb_publishable_test'})).read())

async def main():
    import os; os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'])
        errs = []
        async def page_for(vp):
            ctx = await b.new_context(viewport=vp, permissions=['microphone'])
            pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            return pg
        # ---------- ordinateur ----------
        pg = await page_for({'width': 1280, 'height': 900})
        await pg.goto(BASE + '#/'); await pg.wait_for_timeout(800)
        check(await pg.locator('.chapcard').count() == 16, '16 cartes de chapitres')
        await pg.screenshot(path=f'{OUT}/d-accueil.png', full_page=False)
        for tab in ['cours', 'methode', 'mots', 'exos']:
            await pg.goto(BASE + f'#/chap/fonctions/{tab}'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'{OUT}/d-fonctions-{tab}.png', full_page=False)
        # bulle de définition au survol
        await pg.goto(BASE + '#/chap/pythagore/cours'); await pg.wait_for_timeout(300)
        await pg.locator('#main .lex').first.hover(); await pg.wait_for_timeout(600)
        check(await pg.locator('#pop').is_visible(), 'bulle au survol')
        await pg.screenshot(path=f'{OUT}/d-bulle.png')
        # exercices : un de chaque sorte
        for h, n in [('#/maths/statistiques/1', 'comprendre'), ('#/maths/fractions/2', 'calcul'), ('#/maths/pythagore/3', 'brevet'), ('#/maths/algorithmique/3', 'scratch'), ('#/exo/fonctions/1', 'mots')]:
            await pg.goto(BASE + h); await pg.wait_for_timeout(500); await pg.screenshot(path=f'{OUT}/d-{n}.png', full_page=True)
        # brevet : une mauvaise réponse → aide ; puis la bonne
        await pg.goto(BASE + '#/maths/proportionnalite/3'); await pg.wait_for_timeout(400)
        await pg.fill('#pqcur input[name=a]', '1'); await pg.click('#pqcur button[type=submit]'); await pg.wait_for_timeout(200)
        check(await pg.locator('#pqcur .paide').count() == 1, 'aide après une erreur')
        await pg.fill('#pqcur input[name=a]', '96 km/h'); await pg.click('#pqcur button[type=submit]'); await pg.wait_for_timeout(200)
        check(await pg.locator('[data-act=pnext]').count() == 1, 'question suivante après bonne réponse')
        await pg.screenshot(path=f'{OUT}/d-brevet-corr.png', full_page=True)
        # fraction en deux cases
        await pg.goto(BASE + '#/maths/probabilites/3'); await pg.wait_for_timeout(400)
        await pg.fill('#pqcur input[name=n]', '5'); await pg.fill('#pqcur input[name=d]', '10'); await pg.click('#pqcur button[type=submit]'); await pg.wait_for_timeout(200)
        check('simplifier' in (await pg.locator('#fb').inner_text()), 'fraction à simplifier signalée')
        await pg.fill('#pqcur input[name=n]', '1'); await pg.fill('#pqcur input[name=d]', '2'); await pg.click('#pqcur button[type=submit]'); await pg.wait_for_timeout(200)
        check(await pg.locator('[data-act=pnext]').count() == 1, 'fraction 1/2 acceptée')
        # voix du niveau 1 réutilisée (même texte)
        await pg.goto(BASE + '#/'); await pg.wait_for_timeout(1200)
        await pg.evaluate("speak('Et c’est le but !')"); await pg.wait_for_timeout(800)
        check(any('fls-voix/clips/n1/a.mp3' in l for l in log()['log']), 'enregistrement du niveau 1 joué')
        # glossaire, carnet, paramètres, pages
        for h in ['glossaire', 'carnet', 'parametres', 'a-propos', 'confidentialite', 'entrainement', 'chapitres']:
            await pg.goto(BASE + '#/' + h); await pg.wait_for_timeout(300); await pg.screenshot(path=f'{OUT}/d-{h}.png')
        # ---------- studio : connexion, enregistrement, rattachement ----------
        await pg.goto(BASE + '#/studio'); await pg.wait_for_timeout(500)
        await pg.fill('#lgE', 'prof@test.fr'); await pg.fill('#lgP', 'secret'); await pg.click('form[data-form=login] button'); await pg.wait_for_timeout(1200)
        check(await pg.locator('.studio-tabs').count() == 1, 'studio ouvert après connexion')
        await pg.click('[data-act=st-grp][data-g=cours]'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'{OUT}/d-studio.png')
        await pg.click('[data-act=st-rec]'); await pg.wait_for_timeout(1500); await pg.click('[data-act=st-stop]'); await pg.wait_for_timeout(1500)
        check(await pg.locator('#stWave').count() == 1, 'prise enregistrée (aperçu)')
        await pg.click('[data-act=st-keep]'); await pg.wait_for_timeout(2500)
        L = log(); check(len(L['db']['fls2_clips']) == 1, 'prise envoyée dans fls2_clips'); check(any(l.startswith('POST /sb/storage/v1/object/fls2-voix/') for l in L['log']), 'son envoyé dans fls2-voix')
        check(not any('/fls_clips' in l and not l.startswith('GET') for l in L['log']), 'aucune écriture dans les tables du niveau 1')
        # commentaire partagé : marqué « niveau 1 »
        await pg.click('[data-act=st-grp][data-g=commentaires]'); await pg.click('[data-act=st-filtre][data-f=all]'); await pg.wait_for_timeout(300)
        check('niv. 1' in await pg.locator('#stList').inner_text(), 'commentaire signalé « niveau 1 »')
        # orphelin : on modifie la clé en base, puis on rattache
        cle = L['db']['fls2_clips'][0]['cle']
        await pg.evaluate("Bank.rows[0].cle='texte disparu'; Bank.rows[0].texte='Texte disparu'; Bank.clips=bankIndex(Bank.rows);")
        await pg.click('[data-act=st-grp][data-g=orphelins]'); await pg.wait_for_timeout(300)
        check(await pg.locator('.orph').count() == 1, 'prise à rattacher listée')
        await pg.click('[data-act=st-attach]'); await pg.wait_for_timeout(800)
        check(log()['db']['fls2_clips'][0]['cle'] != 'texte disparu', 'prise rattachée')
        # ---------- téléphone ----------
        mp = await page_for({'width': 390, 'height': 844})
        for h, n in [('#/', 'accueil'), ('#/chap/litteral/cours', 'cours'), ('#/chap/litteral/methode', 'methode'), ('#/chap/litteral/mots', 'mots'), ('#/maths/litteral/2', 'calcul'), ('#/maths/aires-volumes/3', 'brevet'), ('#/maths/relatifs/1', 'comprendre'), ('#/glossaire', 'glossaire'), ('#/studio', 'studio')]:
            await mp.goto(BASE + h); await mp.wait_for_timeout(500)
            sw = await mp.evaluate('document.documentElement.scrollWidth')
            check(sw <= 392, f'pas de défilement horizontal sur mobile ({h} : {sw}px)')
            await mp.screenshot(path=f'{OUT}/m-{n}.png', full_page=True)
        # zoom 200 %
        await mp.evaluate("S.zoom=2; saveS(); applySettings();"); await mp.goto(BASE + '#/chap/pythagore/methode'); await mp.wait_for_timeout(400)
        await mp.screenshot(path=f'{OUT}/m-zoom.png')
        check(not errs, 'aucune erreur JavaScript : ' + ' | '.join(errs[:5]))
        await b.close()
    print(f'{ok} vérifications OK, {len(ko)} problèmes')
asyncio.run(main())
