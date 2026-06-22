---
tags: [projet, ladtc, nextjs, prisma]
created: 2026-03-04
status: active
type: projet
project: ladtc
---

# LADTC

## Description

Site web pour le **LADTC**, club de trail running à Ellezelles, en Belgique. Gestion des membres, inscription aux événements, commande d'équipement et blog — avec tableau de bord administrateur pour le comité.

**URL** : https://ladtc.be
**Repo** : privé (GitHub)
**Statut** : MVP en développement (Phase 1)

---

## Stack technique

| Composant | Version | Rôle |
|-----------|---------|------|
| Next.js | 16 | App Router, SSR/ISR |
| React | 19 | UI framework |
| TypeScript | 5.7+ | Type safety |
| Tailwind CSS | v4 | CSS utilitaire |
| shadcn/ui | Latest | Composants UI |
| Prisma | 7.4+ | ORM avec migrations |
| PostgreSQL | 15+ | Base de données (Docker, self-hosted via Coolify) |
| Better-Auth | 1.4.19 | Auth email, rôles (MEMBER/COACH/COMMITTEE/ADMIN) |
| TanStack Query | 5.60 | Data fetching client |
| React Hook Form + Zod | 7.54 / 3.24 | Validation formulaires |
| Stripe | 20.4 | Paiements (cotisations + commandes) |
| Resend | 6.9 | Emails transactionnels |
| Sentry | 10.40 | Monitoring erreurs |
| pnpm | Latest | Package manager (obligatoire) |

---

## Architecture

```
ladtc/
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login, register, reset password
│   │   ├── (public)/      # Pages publiques (blog, events, team, contact)
│   │   ├── (member)/      # Espace membre (dashboard, profil, commandes, équipement)
│   │   ├── (admin)/       # Admin (membres, commandes, produits, events, blog, stats)
│   │   └── api/           # Routes API (auth, members, orders, products, events, blog)
│   ├── components/
│   │   ├── common/        # Header, Footer, partagés
│   │   ├── forms/         # Formulaires (Login, Register, Contact)
│   │   ├── cards/         # Cards (Blog, Product, Event)
│   │   ├── admin/         # Composants admin
│   │   ├── ui/            # shadcn/ui
│   │   └── layout/        # Layouts (Public, Admin, Member)
│   ├── lib/
│   │   ├── auth.ts / auth-client.ts  # Better-Auth config
│   │   ├── prisma.ts      # Singleton Prisma
│   │   ├── email.ts       # Service email (Resend)
│   │   ├── schemas.ts     # Validation Zod
│   │   └── api.ts         # Helpers fetch API
│   ├── hooks/             # useAuth, useUser, useSession
│   └── types/             # Types TS (blog, member, order)
├── prisma/
│   ├── schema.prisma      # Schéma DB complet
│   ├── migrations/        # Historique migrations
│   └── seed.ts            # Données de test
├── specs/01-mvp/          # 6 specs d'implémentation MVP
├── .github/workflows/ci.yml  # CI pipeline
├── Dockerfile             # Multi-stage Docker build
└── docker-compose.yml     # Dev local (PostgreSQL + app)
```

### Modèles de données principaux
- **User** : email, rôle (MEMBER/COACH/COMMITTEE/ADMIN)
- **Membership** : statut, cotisation, date renouvellement, Stripe
- **Product / Order / OrderItem** : Catalogue équipement + commandes Stripe
- **Event / EventRegistration** : Événements club + inscriptions
- **BlogPost** : Articles avec catégories, tags, images
- **GalleryPhoto** : Galerie photos
- **ActivityLog** : Journal d'activité admin

---

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/app/layout.tsx` | Layout racine + providers |
| `src/app/providers.tsx` | Auth, Query, Theme providers |
| `src/lib/auth.ts` | Config Better-Auth serveur |
| `src/lib/prisma.ts` | Singleton Prisma |
| `src/lib/schemas.ts` | Schémas Zod |
| `prisma/schema.prisma` | Modèle de données complet |
| `specs/01-mvp/` | 6 specs MVP détaillées |
| `ARCHITECTURE.md` | Architecture technique détaillée |
| `PRD.md` | Product Requirements Document |
| `PLAN-ECOSYSTEME.md` | Roadmap écosystème (LADTC + HillsRun + Recettes) |

---

## Commandes utiles

### Développement
```bash
pnpm dev                    # Dev server (localhost:3000)
pnpm build                  # Build production
pnpm lint                   # ESLint
pnpm tsc --noEmit           # Type-check
pnpm test                   # Vitest
pnpm test:watch             # Tests en watch mode
```

### Base de données
```bash
pnpm exec prisma generate            # Générer client Prisma
pnpm exec prisma migrate dev         # Créer migration
pnpm exec prisma migrate deploy      # Appliquer migrations (prod)
pnpm exec prisma studio              # Prisma Studio GUI
pnpm db:seed                         # Seeder données test
```

### Docker
```bash
docker-compose up            # PostgreSQL (5433) + app (3000)
docker-compose down          # Stop services
docker build -t ladtc .      # Build image Docker
```

### Deploy (Coolify sur UM880 Pro)
- **Production** : `git push origin master` → Coolify auto-deploy via GitHub webhook
- **Compose** : `docker-compose.coolify.yml` pour la config Coolify
- **Accès** : Cloudflare Tunnel (zero port ouvert, SSL automatique)
- **Monitoring** : Uptime Kuma (déployé sur Coolify)
- **CI** : GitHub Actions (lint, typecheck, build, tests)

---

## Variables d'environnement

```bash
DATABASE_URL=postgresql://ladtc:xxx@db:5432/ladtc   # Docker internal
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=https://ladtc.be
NEXT_PUBLIC_APP_URL=https://ladtc.be
RESEND_API_KEY=re_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
ADMIN_EMAIL=admin@ladtc.be
NEXT_PUBLIC_SENTRY_DSN=<optional>
# Docker Compose
POSTGRES_USER=ladtc
POSTGRES_PASSWORD=<secret>
POSTGRES_DB=ladtc
```

## Infrastructure

- **Serveur** : UM880 Pro (homelab)
- **Plateforme** : Coolify (PaaS self-hosted, Docker)
- **Stockage fichiers** : Volume Docker local (`public/uploads/`)
- **Base de données** : PostgreSQL 15 en container Docker
- **DNS / SSL** : Cloudflare + Cloudflare Tunnel
- **Monitoring** : Uptime Kuma via Coolify

---

## Guide de premier déploiement Coolify

### Pré-requis
- UM790 opérationnel avec Coolify installé (phase 06 du guide homelab)
- Cloudflare Tunnel configuré et HEALTHY (phase 08)
- GitHub connecté à Coolify (Sources → GitHub App)

### Etape 1 — Créer le projet dans Coolify
1. Coolify → Projects → **New Project** → nom : `ladtc`
2. Add Resource → **Application** → GitHub → sélectionner le repo `ladtc` → branche `master`
3. Build Pack : **Dockerfile** (auto-détecté)

### Etape 2 — Base de données
1. Dans le même projet → Add Resource → **PostgreSQL** (ou utiliser le `docker-compose.coolify.yml`)
2. Noter le `DATABASE_URL` interne généré par Coolify (format : `postgresql://user:pass@postgres-xxx:5432/ladtc`)
3. Alternative : Add Resource → Docker Compose → coller le contenu de `docker-compose.coolify.yml`

### Etape 3 — Variables d'environnement
Dans Coolify → Application → Environment Variables, ajouter :
```
DATABASE_URL=postgresql://ladtc:<mot_de_passe>@<hostname_pg>:5432/ladtc
BETTER_AUTH_SECRET=<générer avec openssl rand -hex 32>
BETTER_AUTH_URL=https://ladtc.be
NEXT_PUBLIC_APP_URL=https://ladtc.be
RESEND_API_KEY=re_xxx
ADMIN_EMAIL=admin@ladtc.be
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Etape 4 — Volume pour les uploads
Coolify → Application → Storages → Add :
- Source : volume nommé `ladtc-uploads`
- Destination : `/app/public/uploads`

### Etape 5 — Domaine et SSL
1. Coolify → Application → Domain : `https://ladtc.be`
2. Cloudflare Zero Trust → Tunnels → homelab → Public Hostname :
   - Subdomain : (vide ou `@`) · Domain : `ladtc.be`
   - Service : `http://localhost:3000`
3. Ajouter aussi `www.ladtc.be` → même service

### Etape 6 — Premier déploiement
1. Coolify → Deploy → suivre les logs en temps réel
2. Premier build : ~3-5 min (Docker multi-stage)
3. Une fois le container UP, exécuter les migrations :
   ```bash
   # Depuis Coolify → Terminal du container app, ou en SSH sur le UM790 :
   docker exec -it <container_id> npx prisma migrate deploy
   ```
4. Vérifier : `https://ladtc.be` doit afficher la homepage
5. Créer le premier compte admin : `/auth/register` puis changer le rôle en DB :
   ```bash
   docker exec -it <container_pg> psql -U ladtc -c "UPDATE \"User\" SET role='ADMIN' WHERE email='ton@email.com';"
   ```

### Etape 7 — Webhook Stripe (si paiements activés)
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL : `https://ladtc.be/api/stripe/webhook`
3. Events : `checkout.session.completed`
4. Copier le signing secret → mettre à jour `STRIPE_WEBHOOK_SECRET` dans Coolify

### Etape 8 — Monitoring
- Uptime Kuma : ajouter un monitor HTTP sur `https://ladtc.be/api/health`
- Intervalle : 60s · Alerte si down > 2 min

### Après le déploiement
- Chaque `git push origin master` déclenche un redéploiement automatique
- Les migrations Prisma doivent être appliquées manuellement après un changement de schema
- Les uploads sont persistés dans le volume Docker `ladtc-uploads`

---

## Specs MVP (dans `/specs/01-mvp/`)

1. **01-wordpress-integration** : Import blog/events depuis WordPress REST API
2. **02-static-pages** : Homepage, team, contact
3. **03-auth-setup** : Better-Auth, vérification email
4. **04-member-management** : CRUD membres, profils, cotisations
5. **05-equipment-orders** : Catalogue, panier, checkout Stripe
6. **06-admin-dashboard** : Outils comité (membres, commandes, contenu)

---

## État v1 (21 avril 2026)

Issues fermées : #13 (docs infra), #9 (Sentry), #1 (video embeds blog)
Issue ouverte : **#4 (Stripe)** — migration vers compte dédié, aucun code à modifier
→ Plan détaillé : [[stripe-migration-plan]]

## Liens
- [[01-Projects/hills-run/hillsrun]] — Écosystème commun, intégration future (leaderboards)
- [[RecettesApp]] — Thème partagé, conventions communes
- [[stripe-migration-plan]] — Plan migration Stripe LADTC
