---
date: 2026-07-20
tags: [ladtc, audit, site, comite, priorite]
type: audit
project: ladtc
---

# Audit du site ladtc.be — 20 juillet 2026

> Réalisé en vue de la réunion de comité du **mercredi 22 juillet 2026**.
> Méthode : parcours complet du site en production (https://ladtc.be), lecture des
> en-têtes HTTP, du sitemap, du robots.txt, des meta-tags, et du code source
> (`src/config/site.ts`, `src/app/(public)/page.tsx`).
> Complémentaire à l'audit de parcours utilisateur du 09/07 (qui portait sur le
> code, les tests et la sécurité des paiements).

---

## Résumé exécutif

Le site est **techniquement sain et rapide** (57 ms, headers de sécurité solides,
CDN Cloudflare, prerender Next.js actif). La course UTC 4 est correctement
présentée. En revanche, **le site donne une impression d'inachevé** : quatre pages
structurantes sont vides (blog, galerie, événements, équipement), le règlement
UTC est un placeholder, et une **contradiction d'horaires d'entraînement** est
visible sur la page d'accueil elle-même. Les données du comité (page Équipe)
sont mal formatées. Aucune page mentions légales / confidentialité n'est
présente, alors que le site collecte des données membres.

| Catégorie | Verdict |
|---|---|
| Performance & sécurité technique | ✅ Bon |
| Cohérence du contenu | ⚠️ 1 contradiction bloquante, plusieurs données mal formatées |
| Pages vides / non livrées | ⚠️ 4 pages publiques + règlement UTC + sponsors |
| SEO & structured data | ⚠️ Bonne base, sitemap incomplet, pas de JSON-LD |
| Conformité (RGPD, mentions) | ⚠️ Aucune page légale visible |
| Navigation | ⚠️ /events orpheline dans le menu |

**Verdict en une ligne** : prêt pour la démonstration des fonctionnalités, mais
pas encore présentable comme « site officiel du club » tant que le contenu et
les incohérences ne sont pas traités.

---

## 1. Périmètre audité

Pages publiques parcourues en production le 20/07/2026 :

| URL | Statut |
|---|---|
| `/` (accueil) | OK structure, contenu partiel |
| `/blog` | ⚠️ Liste vide (aucun article) |
| `/gallery` | ⚠️ Galerie vide (aucune photo) |
| `/events` | ⚠️ Liste vide (aucun événement) |
| `/equipment` | ⚠️ Boutique vide (aucun produit) |
| `/equipment/cart` | OK (panier, demande connexion) |
| `/utc` | ✅ Page la plus complète du site |
| `/utc/reglement` | ⚠️ Placeholder « sera publié ici prochainement » |
| `/team` | ⚠️ Données mal formatées (voir §3.2) |
| `/contact` | ✅ Formulaire + infos pratiques |
| `/auth/register` | ✅ Inscription membre |
| `/auth/login` | (lien) |

Côté technique : `robots.txt`, `sitemap.xml`, en-têtes HTTP, meta-tags,
`src/config/site.ts`, `src/app/(public)/page.tsx`.

---

## 2. Problèmes par priorité

### Priorité 1 — à corriger avant la réunion du 22/07

#### 2.1 Contradiction des horaires d'entraînement sur l'accueil
**Où** : `src/app/(public)/page.tsx:246` (section « Nos entraînements »).

**Problème** : la page d'accueil affiche **« Mercredi à 18:45 »** alors que, sur
la **même page**, le footer indique **« Mercredi à 19:00 »**. La page Contact et
`src/config/site.ts` disent aussi **19:00**. La valeur 18:45 est **codée en dur**
dans le composant, indépendante de la config.

**Impact** : un nouveau visiteur lit deux horaires différents sur la même page.
C'est exactement le genre d'erreur qui fait douter de la fiabilité du site — et
donc du club — à l'arrivée.

**Correction** : remplacer les deux blocs hardcoded (Mercredi et Dimanche) par
une lecture de `siteConfig.schedule.training`, ou au minimum aligner 18:45 →
19:00 si 19:00 est l'horaire officiel. Décision à trancher au comité :
l'entraînement commence à 18:45 (accueil/échauffement) ou 19:00 (départ) ?

#### 2.2 Page Équipe — données du comité mal formatées
**Où** : `/team`, données issues de la table `User` (rôle `COMMITTEE`).

**Problèmes relevés** :

| Affichage actuel | Anomalie | Correction attendue |
|---|---|---|
| Andy Buidin | OK | — |
| Benoit Carton-Delcourt | OK | — |
| Carton-Delcourt Bruno | Ordre inversé (Nom Prénom) | Bruno Carton-Delcourt |
| David LUX | OK (casse mixte) | — |
| François Van Rechem | OK | — |
| Legas Maxime | Ordre inversé | Maxime Legas |
| Stéphane Roos | OK | — |
| Vanopppens | Typo (triple « p »), prénom absent | Vanoppens + prénom |
| deramée matthieu | Tout en minuscules, ordre inversé | Matthieu Deramée |

**Impact** : la page Équipe est la carte de visite du comité. Des noms mal
écrits et une fonction uniforme « Comité » (pas de président, trésorier,
secrétaire…) donnent une image négligée.

**Correction** : revoir les champs `name` des utilisateurs concernés (côté admin
→ Utilisateurs, ou directement en base) et renseigner les fonctions réelles
via le champ prévu (cf. guide-complet §2.1 : « fonction au sein du comité »).

#### 2.3 Pages publiques vides
Quatre pages structurantes n'affichent **aucun contenu** :

- `/blog` — « Actualités, comptes-rendus de courses et vie du club » → 0 article.
- `/gallery` — « Les moments forts du club » → 0 photo.
- `/events` — « Découvrez nos prochains événements » → 0 événement.
- `/equipment` — « Commandez l'équipement officiel LADTC » → 0 produit.

L'accueil pousse vers ces pages (« Voir tous les événements → », « Voir tous
les articles → ») qui tombent sur du vide. Effet « site en construction ».

**Impact** : un visiteur qui clique depuis l'accueil arrive sur une page vide.
Mieux vaut soit **alimenter un minimum** (1 article de bienvenue, 1 galerie
avec les photos UTC 3, 1 événement = l'UTC 4, les maillots à commander), soit
**masquer temporairement** les entrées de menu tant que le contenu n'existe pas.

**Recommandation pour le 22/07** : au strict minimum, créer l'événement **UTC 4**
dans le module events (la page `/utc` existe déjà, mais l'événement n'apparaît
pas dans `/events`) et publier **un article de blog** de bienvenue/rentrée.

#### 2.4 Sponsors UTC — section « Chargement… »
**Où** : `/utc`, bloc « Nos sponsors ».

**Problème** : le bloc affiche « Chargement… » permanent, signe d'une requête
qui ne retourne rien ou échoue. Aucun sponsor n'apparaît.

**Correction** : vérifier l'API sponsors et la base. Soit alimenter le carousel
sponsors, soit masquer la section tant qu'il n'y a aucun sponsor à afficher
(afficher « Chargement… » indéfiniment est pire que de cacher la section).

---

### Priorité 2 — à traiter dans les 2 semaines

#### 2.5 Règlement UTC 4 non publié
`/utc/reglement` reste un placeholder (« Le règlement officiel sera publié ici
prochainement »). La réunion du 12/06 prévoyait validation des 9 articles ou
désignation d'un rédacteur. Point toujours en suspens — à trancher au comité.

#### 2.6 Page `/events` orpheline dans la navigation
Le menu principal et le footer listent : Accueil, Blog, Galerie, UTC 4,
Équipement, Équipe, Contact. **`/events` n'y figure pas**, alors que l'accueil
lien vers elle. La page existe, est dans le sitemap, mais n'est pas joignable
depuis la navigation persistante.

**Correction** : ajouter « Événements » au menu et au footer (entre Galerie et
UTC 4), ou fusionner avec la page UTC si on veut un seul calendrier.

#### 2.7 Aucune page mentions légales / confidentialité
Aucun lien vers une page légale dans le footer. Le site collecte :
nom, email, mot de passe, téléphone, contact d'urgence, adresse de
livraison, historique de paiements, photos des membres.

**En Belgique**, un site qui collecte des données personnelles doit mentionner
l'éditeur, l'hébergeur, une voie de contact et renvoyer à une politique de
confidentialité. Le RGPD s'applique (pas seulement pour les cookies).

**Correction** : créer une page `/legal` (mentions légales + responsable
traitement + finalités des données + droits des personnes concernées) et un
lien dans le footer. À valider au comité : qui rédige le texte de base ?

#### 2.8 Sitemap incomplet
`sitemap.xml` référence : `/`, `/blog`, `/events`, `/equipment`, `/team`,
`/gallery`, `/contact`. Manquent : `/utc` et `/utc/reglement` — les pages les
plus importantes pour le référencement de la course.

**Correction** : ajouter les routes `/utc` au sitemap (ou générer le sitemap
depuis les routes dynamiques). Priorité haute pour le SEO local de la course.

#### 2.9 Pas de données structurées (JSON-LD)
Aucun script `application/ld+json` détecté. Pour une course chronométrée, un
schéma `SportsEvent` (date, lieu, prix, organisateur) améliorerait
sensiblement la visibilité dans Google (rich results) et l'indexation locale
« trail Ellezelles ».

**Correction** : injecter un JSON-LD `SportsEvent` sur `/utc` (date, location,
organizer `SportsOrganization`, offers) et un `Organization` sur l'accueil.

---

### Priorité 3 — améliorations

#### 2.10 Meta description unique par page
La meta description est définie sur l'accueil. Sur les sous-pages (`/blog`,
`/utc`, `/team`…), aucune meta description spécifique n'a été détectée lors du
parcours. Vérifier que chaque page porte une description propre (déjà le cas
pour `/utc` d'après le code, à confirmer sur les autres).

#### 2.11 Pas de balise canonical visible
Aucune `<link rel="canonical">` détectée dans le head de l'accueil. À ajouter
pour éviter le duplicate content (www/non-www, trailing slash).

#### 2.12 HSTS absent des en-têtes
Pas de `Strict-Transport-Security` dans la réponse HTTP. À activer côté
Cloudflare (SSL/TLS → Edge → HSTS) une fois la stabilité confirmée.

#### 2.13 CSP permissive
`script-src 'self' 'unsafe-inline' 'unsafe-eval'` : nécessaire au runtime
Next.js, mais `unsafe-eval` pourrait être durci à terme (mode strict CSP +
nonces). Non bloquant.

#### 2.14 robots.txt bloque tous les crawlers IA
`ClaudeBot`, `GPTBot`, `Google-Extended`, `CCBot`, `Bytespider`, etc. sont
bloqués. Choix défendable pour protéger le contenu éditorial. À noter : cela
empêche aussi l'apparition du site dans les réponses génératives de recherche.

#### 2.15 Logo / image OG
`og.png` référencé à la racine. Vérifier qu'il est bien présent et à jour
(1200×630 requis). Non vérifié dans cet audit.

---

## 3. Ce qui fonctionne bien (à conserver)

- **Performance** : 57 ms de réponse, cache `s-maxage=31536000`, prerender
  Next.js actif, HTTP/2 + HTTP/3. Le site est rapide.
- **Sécurité technique** : CSP, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin`,
  `Permissions-Policy` (caméra/micro/géolocation désactivés). Solide.
- **Page `/utc`** : la mieux structurée du site (parcours, prix, Grand Prix
  Bellezellesbutte, IBAN sponsoring, paliers de dons). C'est le modèle à
  reproduire pour les autres pages.
- **Parcours d'inscription membre** : formulaire clair, mention « Pour devenir
  membre du club, ce n'est pas ici » sur le contact pour distinguer question
  et adhésion — bon design.
- **SEO de base** : meta description, Open Graph, Twitter Card présents sur
  l'accueil.
- **Stack** : Next.js 16, Prisma, BetterAuth, Stripe — conforme aux conventions
  du projet et de l'écosystème (HillsRun, RecettesApp).

---

## 4. Matrice de priorité

| # | Problème | Priorité | Effort | Décision comité ? |
|---|---|---|---|---|
| 2.1 | Horaires 18:45 vs 19:00 | P1 | 10 min | Oui (horaire officiel) |
| 2.2 | Noms comité mal formatés | P1 | 20 min | Non (correction data) |
| 2.3 | Pages blog/gallery/events/equipment vides | P1 | 1–2 h | Oui (stratégie contenu) |
| 2.4 | Sponsors UTC « Chargement… » | P1 | 30 min | Non (fix technique) |
| 2.5 | Règlement UTC 4 | P2 | — | Oui (rédacteur + délai) |
| 2.6 | /events orpheline dans le menu | P2 | 10 min | Non |
| 2.7 | Page mentions légales / RGPD | P2 | 1 h | Oui (qui rédige) |
| 2.8 | Sitemap incomplet (/utc) | P2 | 15 min | Non |
| 2.9 | JSON-LD SportsEvent /utc | P2 | 30 min | Non |
| 2.10 | Meta description par page | P3 | 30 min | Non |
| 2.11 | Balise canonical | P3 | 10 min | Non |
| 2.12 | HSTS | P3 | 5 min | Non |
| 2.13 | CSP unsafe-eval | P3 | — | Non (à terme) |
| 2.14 | robots.txt crawlers IA | P3 | — | Oui (choix éditorial) |
| 2.15 | og.png à vérifier | P3 | 5 min | Non |

---

## 5. Décisions à soumettre au comité (22/07)

1. **Horaire officiel de l'entraînement du mercredi** : 18:45 ou 19:00 ?
   Une fois tranché, la correction prend 10 minutes (aligner config + homepage).
2. **Stratégie de contenu** : alimente-t-on les pages vides avant lancement
   public (article de rentrée, galerie UTC 3, événement UTC 4 dans le
   calendrier, maillots dans la boutique) ou masque-t-on les entrées de menu ?
3. **Règlement UTC 4** : qui rédige et pour quand ? Lien avec le rétroplanning
   flyers (début septembre).
4. **Fonctions du comité sur la page Équipe** : président / trésorier /
   secrétaire / responsable course… à afficher ou pas ?
5. **Page mentions légales / confidentialité** : qui rédige le texte de base
   (modèle type ASBL sportive) ?
6. **Sponsoring UTC 4** : statut des démarches, validation des paliers
   (1000/500/250/100/50 €) déjà affichés.

---

## 6. Plan d'action avant le 22/07 (en autonomie)

- [ ] Aligner l'horaire du mercredi (homepage → config) une fois la décision
      prise, push master.
- [ ] Corriger les noms du comité en base (ou admin → Utilisateurs).
- [ ] Masquer la section sponsors `/utc` si aucun sponsor, ou corriger l'API.
- [ ] Créer l'événement **UTC 4** dans le module events (date 24/10, prix 15/25 €).
- [ ] Ajouter `/utc` au sitemap.
- [ ] Préparer un article de blog de bienvenue (brouillon, à publier après le
      comité).

---

## 7. Suite logique après le 22/07

- Rédiger et publier le règlement UTC 4 (selon échéance fixée).
- Créer la page mentions légales / confidentialité.
- Injecter le JSON-LD `SportsEvent` sur `/utc`.
- Activer HSTS côté Cloudflare.
- Ajouter « Événements » au menu + footer.
- Ouvrir les inscriptions UTC via Ultratiming → renseigner `registrationUrl`.

---

*Audit réalisé le 20 juillet 2026 par Stéphane. Cross-référence : audit de
parcours utilisateur du 09/07 (code, tests, paiements) — les deux sont
complémentaires.*
