"""Builds dist/ (the website) from src/ + public/.

src/academy.html is the app shell: styles, markup, and <script src> tags for the curriculum files and app.js.
The build inlines those scripts into one index.html, swaps the local-storage boot in app.js for web-boot.js
(Firebase progress store, sign-in, service worker), and copies public/ as-is.
"""
import hashlib, os, re, shutil
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
src_dir = os.path.join(root, "src")
read = lambda *p: open(os.path.join(*p), encoding="utf-8").read()
html = read(src_dir, "academy.html")

V = "10.12.2"  # Firebase JS SDK
imports = f'''import {{ initializeApp }} from "https://www.gstatic.com/firebasejs/{V}/firebase-app.js";
import {{ initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator, doc, collection, onSnapshot, setDoc, getDocs, deleteDoc, query, orderBy, limit, writeBatch }} from "https://www.gstatic.com/firebasejs/{V}/firebase-firestore.js";
import {{ getAuth, connectAuthEmulator, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signInWithCredential, linkWithPopup, linkWithCredential, signOut }} from "https://www.gstatic.com/firebasejs/{V}/firebase-auth.js";
import {{ firebaseConfig }} from "./firebase-config.js";
'''

def inline(m):
    name = m.group(1)
    body = read(src_dir, name)
    if name == "app.js":
        boot = read(src_dir, "web-boot.js")
        start, end = "/* @@BOOT-START */", "/* @@BOOT-END */"
        a, b = body.index(start), body.index(end) + len(end)
        body = body[:a] + boot + body[b:]
        return '<script type="module">\n' + imports + body + "\n</script>"
    return "<script>\n" + body + "\n</script>"
html = re.sub(r'<script src="([^"]+)"></script>', inline, html)
assert '<script type="module">' in html and "@@BOOT" not in html

# head: everything up to the end of the <style> block; body: the rest
head_end = html.index("</style>") + len("</style>")
head_part, body_part = html[:head_end], html[head_end:]
head_part = head_part.replace('<meta name="claude:viewport-fit-sides" content="cover">', "")
reset = """<style>
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0}img{max-width:100%}[hidden]{display:none!important}
</style>"""
page = f"""<!doctype html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Learn pétanque in five levels: lessons, drills, practice sessions and your progress, on your phone.">
<meta name="theme-color" content="#1d6a54">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Academy">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
{reset}
{head_part}
</head>
<body>
{body_part}
</body>
</html>
"""
out = os.path.join(root, "dist")
os.makedirs(out, exist_ok=True)
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(page)
for f in os.listdir(os.path.join(root, "public")):
    if os.path.isfile(os.path.join(root, "public", f)): shutil.copy(os.path.join(root, "public", f), out)
open(os.path.join(out, ".nojekyll"), "w").write("")
# stamp the service worker with this build so phones pick up new versions
sw = os.path.join(out, "sw.js"); ver = hashlib.md5(page.encode("utf-8")).hexdigest()[:10]
txt = open(sw, encoding="utf-8").read(); open(sw, "w", encoding="utf-8").write(txt.replace("__VERSION__", ver).replace("__FBV__", V))
print("built dist/index.html", len(page), "version", ver)
