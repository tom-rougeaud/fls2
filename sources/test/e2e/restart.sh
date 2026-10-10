#!/bin/sh
# Relance le faux serveur (arrête l’ancien qui écoute sur le port 8899)
D=$(dirname "$0")
python3 - <<'PY'
import os, signal
for pid in os.listdir('/proc'):
    if not pid.isdigit(): continue
    try: cmd=open(f'/proc/{pid}/cmdline','rb').read().split(b'\0')
    except Exception: continue
    if any(c.endswith(b'server.py') for c in cmd) and b'python3' in cmd[0]:
        os.kill(int(pid), signal.SIGTERM)
PY
sleep 0.7
nohup python3 "$D/server.py" "$@" > "${TMPDIR:-/tmp}/fls2-server.log" 2>&1 &
sleep 1; cat "${TMPDIR:-/tmp}/fls2-server.log"
