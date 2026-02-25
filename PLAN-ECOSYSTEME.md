# Plan Général — Écosystème Stéphane (Février 2026)

## Vue d'ensemble

Trois projets interconnectés autour du trail running et du bien-être :

| Projet | Description | État | URL |
|--------|-------------|------|-----|
| **HillsRun** | Dashboard Garmin pour athlètes et coaches | Production | hillsrun.com (Vercel) + api.hillsrun.com (NAS) |
| **LADTC** | Site du club trail Les Amis Du Trail des Collines | Production (auth cassée) | ladtc.be (Vercel) |
| **RecettesApp** | Gestion de recettes, nutrition sportive | Non commencé | — |

**Infrastructure commune** :
- Neon PostgreSQL (2 projets : LADTC + HillsRun)
- Vercel (frontend)
- NAS Ugreen (Docker backend HillsRun + backup cron)
- Cloudflare Tunnel (accès distant NAS)
- Stack partagé : Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + BetterAuth + Prisma + TanStack Query

---

## 1. LADTC — État actuel et plan

### 1.1 Ce qui est fait (MVP + améliorations)

- **Auth** : BetterAuth (email/password), 4 rôles (MEMBER, COACH, COMMITTEE, ADMIN), emails via Resend
- **Blog** : Intégré Prisma (remplace WordPress), CRUD admin, Markdown, recherche, SEO
- **Événements** : Calendrier complet, articles blog-events hybrides, inscription membres, CRUD admin
- **Galerie photos** : Upload Vercel Blob (drag & drop multi), CRUD admin, grille publique, filtres catégories, lightbox
- **Équipement** : Catalogue, panier localStorage, checkout, gestion stocks/commandes
- **Membres** : Profils, adhésions, renouvellements, annuaire
- **Admin** : Dashboard stats, logs d'activité, gestion rôles, Recharts, upload images
- **Email** : Templates Resend (welcome, commandes, rappels, auth)
- **SEO** : Métadonnées Open Graph sur les pages publiques (blog, événements, galerie)
- **Tests** : 8 fichiers, 164 tests (Vitest)
- **CI/CD** : GitHub Actions (lint, typecheck, build, test)
- **Déploiement** : Vercel + Neon PostgreSQL, domaine ladtc.be configuré

### 1.2 Problème bloquant — Auth en production

**Cause racine** : Les variables Vercel `BETTER_AUTH_URL` et `BETTER_AUTH_SECRET` avaient un `\n` en fin de valeur. Corrigé, mais toutes les sessions existantes sont invalides car chiffrées avec l'ancien secret (avec `\n`).

**À faire au retour** :
1. Sessions DB purgées (fait)
2. Supprimer cookies navigateur (`__Secure-ladtc.*`) ou ouvrir onglet privé
3. Se connecter sur https://ladtc.be/auth/login
4. Vérifier https://ladtc.be/api/debug-auth → doit afficher `session` non-null avec `role: "ADMIN"`
5. Accéder à /admin/dashboard
6. Supprimer l'endpoint debug (`src/app/api/debug-auth/route.ts`)

### 1.3 Améliorations suggérées

#### Fait (terminé)

| # | Amélioration | Statut |
|---|-------------|--------|
| ~~1~~ | ~~Connecter les emails auth à Resend~~ | ✅ Fait |
| ~~2~~ | ~~Calendrier d'événements~~ | ✅ Fait (événements + blog-events hybrides) |
| ~~3~~ | ~~Galerie photos~~ | ✅ Fait (Vercel Blob, lightbox, admin CRUD) |
| ~~4~~ | ~~Recherche blog~~ | ✅ Fait |
| ~~5~~ | ~~SEO & métadonnées~~ | ✅ Fait (blog, événements, galerie) |
| ~~9~~ | ~~Image upload~~ | ✅ Fait (Vercel Blob pour blog + galerie) |

#### Priorité haute (prochaines sessions)

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 6 | **Paiement en ligne** — Stripe pour les cotisations et les commandes d'équipement (actuellement hors-ligne). | 4-6h | Revenue |
| 7 | **Notifications email automatiques** — Rappels de renouvellement, confirmations de commande automatiques (cron ou webhook). | 2-3h | Rétention |
| 8 | **Export CSV** — Admin : export membres, commandes, stats en CSV. | 1-2h | Gestion club |

#### Priorité moyenne (mois prochain)

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 11 | **Newsletter** — Collecte d'emails, envoi via Resend. | 3h | Communication |
| 15 | **Sentry** — Monitoring d'erreurs (prévu dans .env.example mais pas configuré). | 30 min | Stabilité |
| 16 | **SEO équipement & team** — Ajouter métadonnées Open Graph sur les pages équipement et team. | 1h | Visibilité |

#### Priorité basse (futur)

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 12 | **PWA** — Service worker pour consultation offline du calendrier et du blog. | 2-3h | Mobile UX |
| 13 | **Intégration HillsRun** — Leaderboard club, stats collectives des membres connectés à Garmin. | 4-6h | Écosystème |
| 14 | **Multi-langue** — Le site est en français uniquement. Si le club s'internationalise (néerlandais/anglais). | 4-6h | Accessibilité |

### 1.4 Dette technique

- Le PRD mentionne Newsletter comme non implémentée — à planifier
- `src/config/team.ts` contient des données en dur — à migrer en DB si le comité change souvent
- Le fix datetime-local (regex au lieu de `.datetime()`) est appliqué dans `eventSchema` et `blogPostSchema.eventDate`

---

## 2. HillsRun — État actuel et plan

### 2.1 Ce qui est fait (Feature-complete)

- **Backend** : FastAPI async, 11 routers, 100+ endpoints, asyncpg
- **Sync Garmin** : 5 fetchers (daily, activities, body, metrics, wellness), cron quotidien 06:00
- **Frontend** : Dashboard, calendrier TrainingPeaks-style, 8 graphiques Plotly, détail activités
- **Auth** : BetterAuth multi-utilisateur + connexion Garmin (OAuth tokens chiffrés Fernet)
- **Coaching** : Système complet (codes d'invitation, vue coach multi-athlètes)
- **PWA** : Service worker Serwist, mode offline
- **Tests** : 119 backend + 144 frontend, tous verts
- **CI/CD** : GitHub Actions complet
- **Infra** : Vercel (frontend) + Docker ARM64 sur NAS + Cloudflare Tunnel + Neon PostgreSQL

### 2.2 Améliorations suggérées

#### Priorité haute

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 1 | **Intégration RecettesApp** — L'endpoint `/api/v1/nutrition/daily-goal` existe déjà. Connecter les recommandations caloriques basées sur la charge d'entraînement. | 2-3h | Écosystème |
| 2 | **Dashboard personnalisable** — Permettre de réorganiser/masquer les cards du dashboard (drag & drop, localStorage). | 3-4h | UX |
| 3 | **Export rapports PDF** — Résumé hebdo/mensuel exportable pour les coaches. | 3-4h | Coaching |
| 4 | **Alertes santé** — Notifications si HRV chute brutalement, fréquence cardiaque au repos anormale, etc. | 2-3h | Santé |

#### Priorité moyenne

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 5 | **Graphiques interactifs** — Zooms, sélection de périodes, overlays de métriques. | 3-4h | Data viz |
| 6 | **Strava import** — En complément de Garmin, importer depuis Strava (fichiers FIT/TCX ou API). | 4-6h | Compatibilité |
| 7 | **Comparaison de courses** — Overlay de 2+ activités similaires (même parcours, même distance). | 3h | Analyse |
| 8 | **Objectifs et plans** — Définir des objectifs (distance hebdo, dénivelé mensuel) avec suivi de progression. | 4h | Motivation |
| 9 | **Formulaire de feedback** — Les coaches peuvent laisser des commentaires sur les séances. | 2h | Coaching |

#### Priorité basse

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 10 | **Segments / PBs** — Détecter les records personnels sur des segments récurrents. | 4-6h | Motivation |
| 11 | **Widgets embarquables** — Mini-composants à intégrer sur le site LADTC (stats club). | 3h | Écosystème |
| 12 | **App mobile native** — React Native ou Expo, réutilisant les hooks TanStack. | 20+h | Mobile |
| 13 | **Prédiction de performance** — ML basique pour estimer temps de course basé sur historique. | 6-10h | Avancé |

### 2.3 Dette technique

- Le fichier `database.py` fait 1635 lignes — envisager de le découper par domaine (daily, activities, coaching...)
- Legacy `garmin_user_id: 67` sans lien BetterAuth — nettoyer ou migrer
- `score_feedback`, `hrv_status`, `chronic_load` sont null depuis l'API Garmin — documenter ou masquer dans l'UI
- Les hot-patches Docker via `docker cp` sont fragiles — automatiser avec un script de déploiement

---

## 3. RecettesApp — Plan de création

### 3.1 Concept

Application de gestion de recettes orientée nutrition sportive. Intégrée à l'écosystème HillsRun pour adapter les repas à la charge d'entraînement.

### 3.2 Features planifiées (du CLAUDE.md global)

- CRUD recettes (titre, ingrédients, étapes, photo)
- Authentification utilisateur (BetterAuth, partage DB possible avec HillsRun)
- Favoris et partage de recettes
- Filtres (temps, difficulté, régime alimentaire)
- Planning de repas hebdomadaire
- Liste de courses auto-générée
- Import de recettes depuis URL
- **Intégration HillsRun** : recommandations nutritionnelles basées sur les données d'entraînement

### 3.3 Stack prévu

Identique aux autres projets :
- Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui
- Prisma + PostgreSQL (Neon, 3ème projet)
- BetterAuth
- TanStack Query
- Vitest
- Vercel

### 3.4 Étapes de création

| Phase | Tâches | Effort |
|-------|--------|--------|
| 1. Setup | `pnpm create next-app`, Prisma, BetterAuth, shadcn/ui, thème partagé | 2h |
| 2. PRD | `/prompts/saas-create-prd` avec le contexte nutrition sportive | 1h |
| 3. Architecture | `/prompts/saas-create-architecture` | 1h |
| 4. Tasks | `/prompts/saas-create-tasks` pour générer les specs | 1h |
| 5. Auth + DB | Schema Prisma, auth pages, seed data | 2h |
| 6. CRUD recettes | Formulaire, liste, détail, recherche, filtres | 4h |
| 7. Planning | Calendrier hebdomadaire drag & drop | 3h |
| 8. Liste courses | Génération automatique depuis le planning | 2h |
| 9. Import URL | Parser de recettes (schema.org, heuristics) | 3h |
| 10. Intégration | Connexion API HillsRun pour les recommandations caloriques | 2h |
| **Total estimé** | | **~20h** |

---

## 4. Écosystème — Vision d'ensemble

### 4.1 Architecture cible

```
┌─────────────────────────────────────────────────────────┐
│                    Utilisateur                           │
└──────────┬──────────────┬──────────────┬────────────────┘
           │              │              │
    ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
    │   LADTC     │ │ HillsRun  │ │ RecettesApp│
    │  ladtc.be   │ │hillsrun   │ │ recettes   │
    │             │ │  .com     │ │  .app      │
    │  Club mgmt  │ │ Training  │ │ Nutrition  │
    │  Blog       │ │ Dashboard │ │ Meal plan  │
    │  Equipment  │ │ Coaching  │ │ Shopping   │
    └──────┬──────┘ └─────┬─────┘ └─────┬──────┘
           │              │              │
    ┌──────▼──────────────▼──────────────▼──────┐
    │         Neon PostgreSQL (cloud)            │
    │  LADTC DB │ HillsRun DB │ Recettes DB     │
    └───────────────────────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │      NAS Ugreen (Docker)        │
    │  garmin-api + cloudflared       │
    │  Backup cron (neon-backup.sh)   │
    └─────────────────────────────────┘
```

### 4.2 Intégrations inter-projets

| De → Vers | Intégration | Mécanisme |
|-----------|------------|-----------|
| HillsRun → RecettesApp | Calories recommandées basées sur la charge | API `/nutrition/daily-goal` |
| HillsRun → LADTC | Stats club, leaderboard membres | API endpoint dédié ou DB partagée |
| LADTC → HillsRun | Lien "Mon dashboard" pour les membres connectés | Simple lien + SSO futur |
| RecettesApp → HillsRun | Suivi nutritionnel dans le dashboard | Widget ou données agrégées |

### 4.3 Partage de code potentiel

Des éléments sont dupliqués entre les projets :
- **Thème** (couleurs, dark mode, tailwind config) → Extraire un package `@steph/ui-theme`
- **Composants shadcn/ui** → Déjà identiques, pas besoin de package
- **Auth config BetterAuth** → Pattern identique, pas besoin de package
- **TanStack Query config** → Conventions identiques

**Recommandation** : Ne pas créer de monorepo maintenant. Le coût de maintenance d'un monorepo dépasse le bénéfice pour 3 projets indépendants. Garder les projets séparés et copier les patterns.

---

## 5. Infrastructure — Améliorations transversales

### 5.1 Backup

| Quoi | État | Amélioration |
|------|------|-------------|
| Neon PostgreSQL (LADTC + HillsRun) | ✅ Cron quotidien 03:00 sur NAS | Ajouter RecettesApp quand créé |
| Garmin tokens | ✅ Chiffrés en DB (Fernet) | — |
| Code source | ✅ GitHub | Activer les GitHub backups si besoin |

### 5.2 Monitoring

| Projet | État | Recommandation |
|--------|------|----------------|
| LADTC | ❌ Pas de monitoring | Ajouter Sentry (gratuit) + Vercel Analytics |
| HillsRun | ❌ Logs Docker seulement | Ajouter Sentry + Uptime monitoring (Betterstack gratuit) |
| RecettesApp | N/A | Intégrer Sentry dès le setup |

### 5.3 Sécurité

| Point | État | Action |
|-------|------|--------|
| Secrets en env vars | ✅ | — |
| HTTPS everywhere | ✅ | — |
| Rate limiting | ✅ BetterAuth + FastAPI | — |
| CSP headers | ❌ | Ajouter Content-Security-Policy dans `next.config.ts` |
| Dependency audit | ❌ | Ajouter `pnpm audit` dans CI |
| CORS | ⚠️ Implicite | Vérifier que les API ne sont pas ouvertes |

### 5.4 Performance

| Projet | LCP actuel | Objectif | Actions |
|--------|-----------|----------|---------|
| LADTC | ~2-3s | < 2s | Optimiser images (WebP), précharger fonts, ISR pour le blog |
| HillsRun | ~2s | < 1.5s | Déjà bien, optimiser Plotly lazy loading |

---

## 6. Priorités globales — Roadmap

### Fait
- [x] Résoudre l'auth LADTC en production (cookies + relogin)
- [x] Supprimer l'endpoint debug
- [x] LADTC : Connecter emails auth à Resend
- [x] LADTC : Mettre à jour CLAUDE.md et ARCHITECTURE.md (plus de WordPress)
- [x] LADTC : SEO métadonnées sur les pages publiques (blog, événements, galerie)
- [x] LADTC : Calendrier d'événements (+ blog-events hybrides)
- [x] LADTC : Galerie photos (Vercel Blob, lightbox, admin CRUD)
- [x] LADTC : Upload images blog + galerie (Vercel Blob)
- [x] LADTC : Recherche blog

### Court terme (prochaines sessions)
- [ ] LADTC : Déployer en production (Vercel) et tester galerie + événements
- [ ] LADTC : Paiement en ligne (Stripe cotisations + équipement)
- [ ] LADTC : Notifications email automatiques (rappels renouvellement)
- [ ] LADTC : Export CSV (membres, commandes)
- [ ] HillsRun : Vérifier le cron sync quotidien fonctionne

### Moyen terme (1-2 mois)
- [ ] RecettesApp : Créer le projet (PRD → Architecture → Tasks → Implémentation)
- [ ] LADTC : Newsletter (collecte emails + envoi Resend)
- [ ] LADTC : Sentry monitoring
- [ ] HillsRun : Intégration RecettesApp (nutrition)
- [ ] Monitoring : Sentry + Uptime sur tous les projets

### Long terme (3-6 mois)
- [ ] LADTC : Paiement en ligne (Stripe)
- [ ] HillsRun : Export rapports PDF
- [ ] HillsRun : Dashboard personnalisable
- [ ] RecettesApp : Import recettes depuis URL
- [ ] Écosystème : Intégrations inter-projets (leaderboard LADTC ↔ HillsRun)

---

## 7. Notes de reprise

Quand tu reviens :
1. **Déployer en prod** : `npx vercel --prod` ou push sur master (auto-deploy)
2. Tester la galerie sur https://ladtc.be/gallery
3. Tester la création d'événement sur https://ladtc.be/admin/events/new
4. Vérifier que l'upload de photos fonctionne sur https://ladtc.be/admin/gallery/upload
5. Prochaine feature à attaquer : **Paiement Stripe** ou **Export CSV**
