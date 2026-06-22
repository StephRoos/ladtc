---
tags: [projet, ladtc, etat-des-lieux]
created: 2026-02-28
status: active
type: projet
project: ladtc
---

# LADTC - Etat des lieux du developpement

**Date** : 28 fevrier 2026
**Projet** : LADTC (ladtc.be)
**Statut** : MVP complet, deploye en production

---

## Résumé exécutif

Le site LADTC est une application **Next.js 16 fullstack** déployée sur Vercel avec base de données Neon PostgreSQL. Le développement intensif s'est déroulé du 24 au 27 février 2026 (34 commits en 4 jours). Toutes les spécifications MVP (specs 01 à 06) sont implémentées.

**Chiffres clés** :
- 49 composants React
- 32 endpoints API
- 13 hooks custom (TanStack Query)
- 13 modèles de base de données
- 164 tests (9 suites Vitest)
- 0 TODO/FIXME dans le code

---

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Runtime | Node.js | 20+ |
| Package Manager | pnpm | Dernière |
| Framework | Next.js (App Router) | 16.0.0 |
| Langage | TypeScript | 5.7+ |
| CSS | Tailwind CSS | 4.0 |
| UI | shadcn/ui + Radix | Dernière |
| Data Fetching | TanStack Query | 5.60 |
| Formulaires | React Hook Form + Zod | 7.54 / 3.24 |
| Base de données | PostgreSQL (Neon) | 15+ |
| ORM | Prisma | 7.4.1 |
| Auth | BetterAuth (email/password) | 1.4.19 |
| Email | Resend | 6.9.2 |
| Stockage fichiers | Vercel Blob | 2.3.0 |
| Graphiques | Recharts | 3.7 |
| Monitoring | Sentry | 10.40 |
| Tests | Vitest | 3.0 |
| Déploiement | Vercel (région CDG1 Paris) | — |

---

## Fonctionnalites implementees

### Authentification & Roles
- Inscription/connexion par email + mot de passe (BetterAuth)
- 4 roles : `MEMBER`, `COACH`, `COMMITTEE`, `ADMIN`
- Attribution de role comite avec fonction libre (President, Tresorier, etc.)
- Protection des routes via `proxy.ts` (Next.js 16)
- Sessions stockees en PostgreSQL
- Cookies securises en production (HTTPS)

### Blog integre
- CRUD complet (creation, edition, suppression)
- Contenu Markdown rendu avec `marked`
- Slug unique auto-genere
- Image a la une (Vercel Blob)
- Tags et categories
- Recherche de posts
- Pages publiques : `/blog` et `/blog/[slug]`
- Admin : `/admin/blog`

### Evenements
- CRUD complet avec plage de dates (debut/fin)
- 4 types : `TRAINING`, `RACE`, `CAMP`, `SOCIAL`
- Inscription en ligne avec suivi de statut
- Image par evenement
- Affichage calendrier
- Integration blog-evenements hybride
- Pages publiques : `/events` et `/events/[id]`

### Galerie photo
- Upload via Vercel Blob (drag & drop)
- Categories de photos
- Lightbox de visualisation
- CRUD admin complet
- Page publique : `/gallery`

### Boutique equipement
- Catalogue produits avec tailles et stock
- Panier cote client (localStorage)
- Processus de commande (checkout)
- Cycle de vie des commandes : `PENDING → CONFIRMED → SHIPPED → DELIVERED`
- Gestion admin des commandes
- Pages : `/equipment`, `/equipment/[id]`, `/equipment/cart`, `/equipment/checkout`

### Gestion des membres
- Profils avec adhesion (statut, renouvellement, cotisation)
- Creation de membres depuis le panel admin
- Avatar utilisateur (upload et affichage)
- Contact d'urgence
- Rappels de renouvellement par email
- Statistiques des membres

### Dashboard admin
- Statistiques globales (membres, commandes, posts, evenements)
- Graphiques avec Recharts
- Logs d'activite
- Gestion des utilisateurs et roles
- Actions rapides

### Emails transactionnels (Resend)
- 6 templates HTML : bienvenue, verification, reset password, rappel renouvellement, confirmation commande, mise a jour statut

### Pages statiques
- Accueil (`/`)
- Equipe (`/team`) avec roles du comite
- Contact (`/contact`) avec formulaire

---

## Architecture de la base de donnees

```
13 modeles Prisma :
├── User (roles, committeeRole, image)
├── Membership (status, renewalDate, cotisation)
├── Session (BetterAuth)
├── Account (BetterAuth)
├── Verification (BetterAuth)
├── Product (nom, prix, tailles, stock)
├── Order (shipping, statut, suivi)
├── OrderItem (produit, quantite, taille, prix)
├── Event (type, date, inscription, difficulte)
├── EventRegistration (statut inscription)
├── BlogPost (slug, markdown, tags, auteur)
├── GalleryPhoto (url, categorie, uploadedBy)
└── ActivityLog (action, cible, changements JSON)
```

---

## Structure des routes

### Routes publiques
| Route | Description |
|-------|------------|
| `/` | Page d'accueil |
| `/blog` | Liste des articles |
| `/blog/[slug]` | Detail article |
| `/events` | Calendrier evenements |
| `/events/[id]` | Detail evenement |
| `/equipment` | Catalogue equipement |
| `/equipment/[id]` | Detail produit |
| `/gallery` | Galerie photos |
| `/team` | Page equipe |
| `/contact` | Formulaire de contact |

### Routes membres (protegees)
| Route | Description |
|-------|------------|
| `/profile` | Profil utilisateur |
| `/orders` | Mes commandes |
| `/orders/[id]` | Detail commande |
| `/equipment/cart` | Panier |
| `/equipment/checkout` | Paiement |

### Routes admin (protegees)
| Route | Description |
|-------|------------|
| `/admin/dashboard` | Tableau de bord |
| `/admin/blog` | Gestion blog |
| `/admin/events` | Gestion evenements |
| `/admin/products` | Gestion produits |
| `/admin/orders` | Gestion commandes |
| `/admin/gallery` | Gestion galerie |
| `/admin/users` | Gestion utilisateurs |
| `/admin/members` | Gestion membres |
| `/admin/activity-logs` | Logs d'activite |
| `/admin/statistics` | Statistiques |

---

## Tests

| Suite | Couverture |
|-------|-----------|
| auth.test.ts | Flux d'authentification |
| admin-dashboard.test.ts | Stats du dashboard |
| blog.test.ts | CRUD blog, recherche, slugs |
| cart.test.ts | Logique panier |
| committee-role.test.ts | Attribution roles comite |
| email.test.ts | Rendu templates email |
| events.test.ts | CRUD evenements, inscription |
| gallery.test.ts | CRUD galerie photos |
| member.test.ts | Gestion membres, creation |

**Total : 164 tests, framework Vitest 3.0**

---

## Déploiement

- **Hébergement** : Vercel (région CDG1 Paris)
- **Base de données** : Neon PostgreSQL (cloud)
- **Domaine** : ladtc.be
- **Build** : `prisma migrate deploy && prisma generate && next build`
- **Stockage fichiers** : Vercel Blob
- **Email** : Resend

---

## Historique des commits (chronologique)

| Date | Commits | Points cles |
|------|---------|-------------|
| 24 fev | 11 | Setup initial, PRD, architecture, specs 01-06, MVP auth + blog + membres |
| 25 fev | 13 | Galerie photos, evenements, blog integre, images, emails, SEO, Sentry |
| 27 fev | 7 | Avatars, role comite, creation membres admin, gestion erreurs |

**Total : 34 commits en 4 jours**

---

## Problemes connus

### Resolu
- **Auth cassee en prod** : Variables d'environnement `BETTER_AUTH_URL` et `BETTER_AUTH_SECRET` avaient un `\n` en fin de ligne. Corrige. Vider les cookies et se reconnecter.

### En cours
- Aucun TODO/FIXME dans le code
- Code propre et bien structure

---

## Prochaines étapes (roadmap)

### Haute priorité
1. **Paiements en ligne** (Stripe) — cotisations + commandes équipement
2. **Rappels automatiques** (Cron) — renouvellement adhésion
3. **Export CSV** — reporting admin

### Moyenne priorité
4. Newsletter / collecte emails
5. Monitoring Sentry (finaliser configuration)
6. SEO équipement & page équipe
7. Optimisation images et performances

### Basse priorité (futur)
8. PWA (accès hors-ligne)
9. Intégration HillsRun (écosystème partagé)
10. Support multi-langue
11. Fonctionnalités sociales (commentaires, partage)

---

## Liens utiles

- **Repo** : `/Users/stephane/Projects/ladtc`
- **Production** : https://ladtc.be
- **PRD** : `PRD.md` dans le repo
- **Architecture** : `ARCHITECTURE.md` dans le repo
- **Specs** : `specs/01-mvp/` (6 documents)
- **Ecosysteme** : `PLAN-ECOSYSTEME.md` (LADTC + HillsRun + RecettesApp)

---

*Document généré le 28 février 2026*
