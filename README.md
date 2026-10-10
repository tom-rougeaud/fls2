# Maths Allophones · Niveau 2

Les mathématiques de 3ᵉ en français facile (FALC), pour les élèves allophones qui passent du niveau A2 au niveau B1.

**En ligne :** https://tom-rougeaud.github.io/fls2/
**Niveau 1 (le vocabulaire de base) :** https://tom-rougeaud.github.io/fls/

## Ce que contient l’application

**Partie 1 : les maths de 3ᵉ.** 16 chapitres, qui couvrent le programme du cycle 4 :

| Domaine | Chapitres |
|---|---|
| Lire et répondre | Les consignes de 3ᵉ |
| Nombres et calculs | Relatifs · Fractions · Puissances et racines carrées · Diviseurs et nombres premiers · Calcul littéral · Équations |
| Grandeurs et données | Proportionnalité et pourcentages |
| Données et fonctions | Statistiques · Probabilités · Repère et fonctions |
| Grandeurs et mesures | Aires et volumes |
| Espace et géométrie | Angles et triangles · Pythagore, Thalès et trigonométrie · Transformations et espace |
| Algorithmique | Algorithmique avec Scratch |

Chaque chapitre est organisé en quatre onglets :

- **Cours** (131 fiches) : phrases courtes, un exemple, un dessin, et un encadré « Attention ».
- **Méthode** (51 méthodes) : les étapes à suivre, puis un exemple résolu pas à pas.
- **Mots** : le lexique du chapitre.
- **Exercices**, sur trois niveaux :
  1. *Je comprends l’énoncé* (129 exercices) : trouver les données, la question, remettre la démarche dans l’ordre.
  2. *Je calcule* : 80 générateurs, donc des calculs toujours nouveaux.
  3. *Comme au brevet* (49 problèmes en plusieurs questions) : une aide après la première erreur, la correction détaillée, puis « ✍️ Je rédige » pour écrire la phrase-réponse.

S’y ajoutent :

- un **brevet blanc** qui mélange les chapitres ;
- une **révision en spirale** sur les chapitres déjà ouverts, mots et calculs mélangés.

**Partie 2 : le lexique avancé.** Il compte 182 nouveaux mots. Chacun a un dessin, une définition simple, des phrases à réutiliser et sa lecture à voix haute. Les 166 mots du niveau 1 restent disponibles en rappel dans le glossaire.

**Comme au niveau 1 :**

- **La voix**, avec trois solutions de repli :
  - d’abord la voix du professeur, enregistrée dans le studio (plusieurs prises qui tournent) ;
  - sinon une voix naturelle de synthèse (Piper) ;
  - sinon la voix de l’appareil.

  Une phrase est toujours dite en entier, jamais assemblée à partir de morceaux.
- Commentaires façon match de foot.
- **Repères visuels** :
  - les verbes d’action en **gras souligné** ;
  - huit familles de couleurs avec icônes ;
  - les fractions écrites sur deux étages.
- Zoom, glossaire, carnet de progression (export / import / effacement) et fiche imprimable par chapitre.

## La voix du professeur et le partage avec le niveau 1

- Les enregistrements du niveau 2 vont dans les tables `fls2_clips` / `fls2_textes` et le stockage `fls2-voix` du même projet Supabase que le niveau 1.
- Le niveau 2 **lit aussi** (sans jamais les modifier) les enregistrements du niveau 1. Une phrase déjà enregistrée là-bas, comme un commentaire ou une définition de mot, est donc réutilisée telle quelle. Cela peut se couper dans *Paramètres*.
- Le studio (`#/studio`, connexion professeur) range les textes par groupes : mots, phrases, « on peut dire », cours, méthodes, énoncés, commentaires, consignes, prises à rattacher.
- Pour créer les tables, exécuter dans l’éditeur SQL de Supabase le fichier `supabase/schema.example.sql`, après y avoir remplacé `ton.adresse@exemple.fr` par l’adresse du compte professeur.

## Organisation du dépôt

```
index.html            l’application (un seul fichier, construit à partir de sources/)
vendor/               voix naturelle (ONNX Runtime Web, phonémiseur Piper) et encodeur MP3 du studio
supabase/             schéma des tables et du stockage (modèle, sans adresse personnelle)
sources/
  content/            le contenu pédagogique : base.json + un fichier JSON par chapitre
  src/                code (core, db, voice, illus, illus2, maths, exos, studio, views, main), style, gabarit
  build.py            construit et vérifie l’application
  test/               tests automatiques
```

## Modifier le contenu

1. Modifier le fichier du chapitre dans `sources/content/chap/`. Marques utiles :
   - `[[texte|id]]` : mot du lexique cliquable ;
   - `**verbe**` : verbe d’action ;
   - `{{3/4}}` : fraction.
2. Construire :
   ```
   cd sources
   python3 build.py --publier
   ```
   Le script vérifie les mots inconnus, les marques mal fermées et les exercices incomplets, puis recopie l’application dans `index.html` à la racine.
3. Tester (facultatif) :
   ```
   cd test && npm install
   node gens.js && node content.js && node run.js
   ```
   - `gens.js` : chaque générateur, tiré des centaines de fois ;
   - `content.js` : les problèmes et la lecture à voix haute ;
   - `run.js` : un parcours complet de l’appli.

   `test/e2e/` contient un test dans un vrai navigateur (Playwright) avec un faux Supabase local.

## Vie privée

- Aucune donnée d’élève n’est envoyée : la progression reste dans le navigateur.
- Pas de traceur, pas de police ni de script venant d’un autre site.
- Le seul envoi vers Supabase est la voix du professeur, et seulement depuis le studio, après connexion.
- Le modèle de voix Piper est téléchargé une fois par navigateur, à la demande. Il est partagé avec le niveau 1.

## Licence

© Tom Rougeaud — [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.fr). Les fichiers du dossier `vendor/` gardent leurs propres licences (voir `vendor/LICENCES.md`).
