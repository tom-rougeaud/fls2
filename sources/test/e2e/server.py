#!/usr/bin/env python3
"""Faux Supabase + serveur du site, pour les tests de bout en bout.
   /sb/...  : API simulée (auth, rest, storage) ; le reste : fichiers du dossier site/.
   Option --no-tables : les tables fls2_* n’existent pas (404), pour tester le message."""
import json, sys, os, re, uuid, time, urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
ROOT = os.path.join(os.path.dirname(__file__), 'site')
NO_TABLES = '--no-tables' in sys.argv
DB = {'fls2_clips': [], 'fls2_textes': [], 'fls_clips': [], 'fls_textes': []}
FILES = {}
TOKEN = 'tok-' + uuid.uuid4().hex
# un enregistrement « du niveau 1 » pour un commentaire partagé
with open(os.path.join(os.path.dirname(__file__), 'beep.mp3'), 'rb') as f: BEEP = f.read()
FILES['fls-voix/clips/n1/a.mp3'] = BEEP
DB['fls_clips'].append({'id': 'n1-1', 'cle': 'et c’est le but', 'texte': 'Et c’est le but !', 'chemin': 'clips/n1/a.mp3', 'duree': 1.0, 'actif': True, 'created_at': '2026-01-01'})
LOG = []

class H(SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(s, *a): pass
    def end_headers(s):
        s.send_header('Access-Control-Allow-Origin', '*'); s.send_header('Access-Control-Allow-Headers', '*'); s.send_header('Access-Control-Allow-Methods', '*'); s.send_header('Cache-Control', 'no-store'); super().end_headers()
    def j(s, code, obj):
        b = json.dumps(obj).encode() if obj is not None else b''
        s.send_response(code); s.send_header('Content-Type', 'application/json'); s.send_header('Content-Length', str(len(b))); s.end_headers(); s.wfile.write(b)
    def body(s):
        n = int(s.headers.get('Content-Length') or 0); return s.rfile.read(n) if n else b''
    def authed(s):
        a = s.headers.get('Authorization') or ''
        return a == 'Bearer ' + TOKEN
    def bad_bearer(s):
        a = s.headers.get('Authorization') or ''
        if a.startswith('Bearer sb_'): s.j(401, {'message': 'Bearer avec une clé publiable : interdit'}); return True
        if s.headers.get('apikey') != 'sb_publishable_test': s.j(401, {'message': 'apikey manquante'}); return True
        return False
    def do_OPTIONS(s): s.send_response(204); s.end_headers()
    def route(s, method):
        u = urllib.parse.urlparse(s.path); p = u.path; q = urllib.parse.parse_qs(u.query)
        LOG.append(f'{method} {p}')
        if not p.startswith('/sb/'):
            if method == 'GET': return super().do_GET()
            return s.j(405, {})
        p = p[3:]
        if p == '/__log': return s.j(200, {'log': LOG[-200:], 'db': DB})
        if not p.startswith('/storage/v1/object/public/') and s.bad_bearer(): return
        if p.startswith('/auth/v1/token'):
            b = json.loads(s.body() or b'{}')
            if q.get('grant_type') == ['password'] and b.get('password') != 'secret': return s.j(400, {'error': 'invalid_grant'})
            return s.j(200, {'access_token': TOKEN, 'refresh_token': 'r', 'expires_in': 3600, 'user': {'email': b.get('email', 'prof@test')}})
        m = re.match(r'^/rest/v1/(\w+)$', p)
        if m:
            t = m.group(1)
            if t not in DB or (NO_TABLES and t.startswith('fls2')): return s.j(404, {'code': '42P01', 'message': f'relation "public.{t}" does not exist'})
            rows = DB[t]
            flt = {k: v[0][3:] for k, v in q.items() if v[0].startswith('eq.')}
            sel = [r for r in rows if all(str(r.get(k)).lower() == v.lower() for k, v in flt.items())]
            if method == 'GET': return s.j(200, sel)
            if not s.authed(): return s.j(401, {'message': 'non connecté'})
            if method == 'POST':
                b = json.loads(s.body()); b['id'] = uuid.uuid4().hex; b['created_at'] = time.strftime('%Y-%m-%dT%H:%M:%S'); rows.append(b); return s.j(201, [b])
            if method == 'PATCH':
                b = json.loads(s.body()); [r.update(b) for r in sel]; return s.j(204, None)
            if method == 'DELETE':
                DB[t] = [r for r in rows if r not in sel]; return s.j(204, None)
        m = re.match(r'^/storage/v1/object/public/(.+)$', p)
        if m and method == 'GET':
            k = urllib.parse.unquote(m.group(1))
            if k not in FILES: return s.j(404, {})
            b = FILES[k]; s.send_response(200); s.send_header('Content-Type', 'audio/mpeg'); s.send_header('Content-Length', str(len(b))); s.end_headers(); s.wfile.write(b); return
        m = re.match(r'^/storage/v1/object/(.+)$', p)
        if m:
            if not s.authed(): return s.j(401, {})
            k = urllib.parse.unquote(m.group(1))
            if method == 'POST': FILES[k] = s.body(); return s.j(200, {'Key': k})
            if method == 'DELETE': FILES.pop(k, None); return s.j(200, {})
        return s.j(404, {'message': 'route inconnue ' + p})
    def do_GET(s): s.route('GET')
    def do_POST(s): s.route('POST')
    def do_PATCH(s): s.route('PATCH')
    def do_DELETE(s): s.route('DELETE')

if __name__ == '__main__':
    port = 8899
    print('serveur sur', port, '(sans tables)' if NO_TABLES else ''); sys.stdout.flush()
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
