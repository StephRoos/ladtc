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

### 1.1 Ce qui est fait (MVP complet)

- **Auth** : BetterAuth (email/password), 4 rôles (MEMBER, COACH, COMMITTEE, ADMIN)
- **Blog** : Intégré Prisma (remplace WordPress), CRUD admin, Markdown
- **Équipement** : Catalogue, panier localStorage, checkout, gestion stocks/commandes
- **Membres** : Profils, adhésions, renouvellements, annuaire
- **Admin** : Dashboard stats, logs d'activité, gestion rôles, Recharts
- **Email** : Templates Resend (welcome, commandes, rappels)
- **Tests** : 6 fichiers, ~70 tests (Vitest)
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

#### Priorité haute (prochaines sessions)

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 1 | **Connecter les emails auth à Resend** — Les emails de vérification et reset password sont en `console.log`. Resend est déjà intégré pour les templates. | 30 min | Auth complète |
| 2 | **Calendrier d'événements** — Le modèle Event existe dans le PRD mais aucune page. Ajouter : liste événements, détail, inscription membres. | 3-4h | Feature PRD manquante |
| 3 | **Galerie photos** — Prévue dans le PRD, pas implémentée. Upload vers un bucket S3/Cloudflare R2, affichage en grille. | 3-4h | Feature PRD manquante |
| 4 | **Recherche blog** — La fonctionnalité de recherche est dans le PRD mais pas implémentée. | 1h | UX blog |
| 5 | **SEO & métadonnées** — Ajouter `generateMetadata()` sur les pages publiques (blog, équipement, team). Open Graph pour le partage social. | 1-2h | Visibilité |

#### Priorité moyenne (mois prochain)

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 6 | **Paiement en ligne** — Stripe pour les cotisations et les commandes d'équipement (actuellement hors-ligne). | 4-6h | Revenue |
| 7 | **Notifications email automatiques** — Rappels de renouvellement, confirmations de commande automatiques (cron ou webhook). | 2-3h | Rétention |
| 8 | **Export CSV** — Admin : export membres, commandes, stats en CSV. | 1-2h | Gestion club |
| 9 | **Image upload** — Pour les articles blog et les produits. Actuellement URL manuelle. Utiliser Cloudflare R2 ou Vercel Blob. | 2-3h | UX admin |
| 10 | **Middleware auth** — Remplacer le check client-side (useEffect + redirect) par un middleware Next.js server-side pour les routes protégées. Plus rapide, pas de flash. | 2h | Performance/UX |

#### Priorité basse (futur)

| # | Amélioration | Effort | Impact |
|---|-------------|--------|--------|
| 11 | **Newsletter** — Collecte d'emails, envoi via Resend. | 3h | Communication |
| 12 | **PWA** — Service worker pour consultation offline du calendrier et du blog. | 2-3h | Mobile UX |
| 13 | **Intégration HillsRun** — Leaderboard club, stats collectives des membres connectés à Garmin. | 4-6h | Écosystème |
| 14 | **Multi-langue** — Le site est en français uniquement. Si le club s'internationalise (néerlandais/anglais). | 4-6h | Accessibilité |
| 15 | **Sentry** — Monitoring d'erreurs (prévu dans .env.example mais pas configuré). | 30 min | Stabilité |

### 1.4 Dette technique

- `CLAUDE.md` et `ARCHITECTURE.md` mentionnent encore WordPress comme CMS (à mettre à jour)
- Le PRD mentionne des features non implémentées (Events, Gallery, Newsletter) — à marquer comme post-MVP
- Le fichier `src/lib/wordpress.ts` a été supprimé mais des références peuvent subsister dans la doc
- `src/config/team.ts` contient des données en dur — à migrer en DB si le comité change souvent

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

### Immédiat (cette session)
- [ ] Résoudre l'auth LADTC en production (cookies + relogin)
- [ ] Supprimer l'endpoint debug
- [ ] Vérifier le blog admin (créer 1er article)

### Court terme (1-2 semaines)
- [ ] LADTC : Connecter emails auth à Resend
- [ ] LADTC : Mettre à jour CLAUDE.md et ARCHITECTURE.md (plus de WordPress)
- [ ] LADTC : SEO métadonnées sur les pages publiques
- [ ] LADTC : Ajouter Sentry
- [ ] HillsRun : Vérifier le cron sync quotidien fonctionne

### Moyen terme (1-2 mois)
- [ ] RecettesApp : Créer le projet (PRD → Architecture → Tasks → Implémentation)
- [ ] LADTC : Calendrier d'événements
- [ ] LADTC : Galerie photos
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
1. **Ouvre un onglet privé** sur https://ladtc.be/auth/login
2. Connecte-toi avec `stephaneroos@gmail.com`
3. Va sur https://ladtc.be/api/debug-auth et colle le résultat
4. Si `session` est non-null → l'auth est réparée, on supprime le debug endpoint
5. Si `session` est null → on investigue les cookies/config plus en profondeur
