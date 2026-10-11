/* Mon formulaire : les formules de 3ᵉ, relues une par une. */
module.exports = (fmt) => {
  const box = (col, t, rows, cls = '') => `<div class="blk fb c-${col} ${cls}"><h3>${t}</h3><table>${rows.map(r => `<tr><td>${fmt(r[0])}</td><td>${fmt(r[1])}</td></tr>`).join('')}</table></div>`;
  const note = (col, t, ps, cls = '') => `<div class="blk fb c-${col} ${cls}"><h3>${t}</h3>${ps.map(p => `<p>${fmt(p)}</p>`).join('')}</div>`;
  const head = `<div class="blk chead kwn c-brand span"><div class="ch-txt"><div class="ch-k">Pour le brevet</div><h2>📏 Mon formulaire</h2><p>Les formules et les règles à connaître. Je les relis avant un contrôle.</p></div></div>`;
  const p1 = `
  ${box('nombre', '🔢 Les nombres relatifs', [['(+) × (+) et (−) × (−)', 'résultat positif'], ['(+) × (−) et (−) × (+)', 'résultat négatif'], ['a − b', 'a + (l’opposé de b)'], ['Priorités', '( ) puis × ÷ puis + −']])}
  ${box('nombre', '🍕 Les fractions', [['{{a/b}} + {{c/b}}', '{{a + c/b}}'], ['{{a/b}} × {{c/d}}', '{{a × c/b × d}}'], ['{{a/b}} ÷ {{c/d}}', '{{a/b}} × {{d/c}}'], ['{{a/b}} de N', 'N ÷ b × a']])}
  ${box('nombre', '⚡ Puissances et racines', [['aⁿ', 'a × a × … × a (n fois)'], ['10ⁿ', '1 suivi de n zéros'], ['10⁻ⁿ', '0,0…01 (n chiffres après la virgule)'], ['Notation scientifique', 'a × 10ⁿ avec 1 ≤ a < 10'], ['√a', 'le nombre positif dont le carré est a']])}
  ${box('algebre', '🧮 Calcul littéral', [['k(a + b)', 'ka + kb'], ['(a + b)(c + d)', 'ac + ad + bc + bd'], ['(a + b)²', 'a² + 2ab + b²'], ['(a − b)²', 'a² − 2ab + b²'], ['(a + b)(a − b)', 'a² − b²']])}
  ${note('algebre', '⚖️ Les équations', ['J’ajoute ou j’enlève le même nombre aux deux membres.', 'Je multiplie ou je divise les deux membres par le même nombre (pas 0).', 'Produit nul : si A × B = 0, alors A = 0 ou B = 0.'])}
  ${box('mesure', '🛒 Proportionnalité', [['Si a donne b, alors c donne x', 'x = b × c ÷ a'], ['t % de N', 'N × t ÷ 100'], ['Hausse de t %', '× (1 + t ÷ 100)'], ['Baisse de t %', '× (1 − t ÷ 100)'], ['Vitesse', 'v = d ÷ t'], ['Distance · durée', 'd = v × t · t = d ÷ v']])}
  ${box('donnees', '📊 Statistiques', [['Moyenne', 'somme des valeurs ÷ effectif total'], ['Médiane', 'valeur du milieu de la série rangée'], ['Étendue', 'plus grande valeur − plus petite valeur'], ['Fréquence', 'effectif ÷ effectif total']])}
  ${box('donnees', '🎲 Probabilités', [['P(A)', 'nombre de cas favorables ÷ nombre de cas possibles'], ['Toujours', '0 ≤ P(A) ≤ 1'], ['Événement contraire', 'P(non A) = 1 − P(A)']])}
  ${box('fonction', '📈 Les fonctions', [['f(x) = ax + b', 'fonction affine : une droite'], ['f(x) = ax', 'fonction linéaire : une droite qui passe par l’origine'], ['f(2) = 7', 'l’image de 2 est 7 ; 2 est un antécédent de 7'], ['Coefficient a', '{{f(x₂) − f(x₁)/x₂ − x₁}}']])}
  `;
  const p2 = `
  ${box('mesure', '⬛ Périmètres et aires', [['Carré de côté c', 'P = 4 × c · A = c × c'], ['Rectangle L × ℓ', 'P = 2 × (L + ℓ) · A = L × ℓ'], ['Triangle', 'A = b × h ÷ 2'], ['Parallélogramme', 'A = b × h'], ['Disque de rayon r', 'A = π × r²'], ['Cercle de rayon r', 'P = 2 × π × r']])}
  ${box('mesure', '📦 Les volumes', [['Cube de côté c', 'V = c × c × c'], ['Pavé droit', 'V = L × ℓ × h'], ['Prisme, cylindre', 'V = aire de la base × h'], ['Cylindre', 'V = π × r² × h'], ['Pyramide, cône', 'V = aire de la base × h ÷ 3'], ['Boule de rayon r', 'V = {{4/3}} × π × r³']])}
  ${box('mesure', '🔁 Conversions', [['1 m = 10 dm = 100 cm', '1 km = 1 000 m'], ['1 m² = 100 dm²', '1 dm² = 100 cm²'], ['1 m³ = 1 000 dm³', '1 dm³ = 1 L = 1 000 cm³'], ['1 h = 60 min', '1 min = 60 s'], ['30 min = 0,5 h', '15 min = 0,25 h']])}
  ${note('geometrie', '📐 Les angles et les triangles', ['Dans un triangle, la somme des angles est 180°.', 'Triangle isocèle : deux côtés égaux et deux angles égaux.', 'Triangle équilatéral : trois côtés égaux, trois angles de 60°.', 'Deux droites parallèles coupées par une sécante : les angles alternes-internes sont égaux. Et inversement.'])}
  ${note('geometrie', '📏 Pythagore', ['ABC rectangle en A : BC² = AB² + AC². [BC] est l’hypoténuse.', 'Réciproque : si BC² = AB² + AC², alors ABC est rectangle en A.', 'Sinon, ABC n’est pas rectangle.'])}
  ${note('geometrie', '🔺 Thalès', ['Si (MN) // (BC), avec M sur [AB] et N sur [AC] :', '{{AM/AB}} = {{AN/AC}} = {{MN/BC}}', 'Réciproque : si {{AM/AB}} = {{AN/AC}} (même ordre des points), alors (MN) // (BC).'])}
  ${box('geometrie', '📐 Trigonométrie (triangle rectangle)', [['cos(angle)', '{{côté adjacent/hypoténuse}}'], ['sin(angle)', '{{côté opposé/hypoténuse}}'], ['tan(angle)', '{{côté opposé/côté adjacent}}'], ['Pour retenir', 'SOH · CAH · TOA']])}
  ${note('geometrie', '🔄 Les transformations', ['Symétrie, translation, rotation : les longueurs, les angles et les aires ne changent pas.', 'Homothétie de rapport k : les longueurs sont multipliées par k, les aires par k².', 'Agrandissement-réduction de rapport k : les volumes sont multipliés par k³.'], '')}
  `;
  return { html: head + p1 + p2 };
};
