---
date: 2026-05-15
type: data
tags: [ladtc, case-study, portfolio]
status: ready-for-writing
---

# Métriques pour le case study LADTC v2.0

> Collecte du 2026-05-15 à 14:50, prête pour rédaction. À régénérer avant publication (rebrancher la commande dans la session de rédaction).

## Âge et activité

| Métrique | Valeur |
|---|---|
| Premier commit | **2026-02-24** (« initial project setup with PRD, architecture, and specs ») |
| Mise en prod | **2026-04-21** (cutover Coolify) |
| Âge total | ~3 mois de dev |
| Durée en prod | ~25 jours |
| Commits totaux sur master | **103** |
| Distribution mensuelle | 35 (fév) · 14 (mar) · 40 (avr) · 14+ (mai) |
| Pic d'activité | **11 commits le 15 mai 2026** (sprint monumental Issue #16 + migration Stripe) |
| PRs mergées au total | **10** (toutes en mai — avant c'était push direct sur master) |
| Issues GitHub closes | **17** depuis février |
| Membres réels en prod | **3** (Julien, Liza, Camille) |

## Code

| Métrique | Valeur |
|---|---|
| Lignes TypeScript total | **24 324** |
| Lignes de tests Vitest | **2 661** (~11 % du code) |
| Tests passants | **280 / 280** |
| Composants React | **56** |
| Pages App Router | **48** |
| Routes API | **52** |
| Pages buildées (Next.js static + dynamic) | **71** |

## Data layer

| Métrique | Valeur |
|---|---|
| Modèles Prisma | **16** (User, Account, Session, Verification, ActivityLog, Product, ProductStock, Order, OrderItem, Membership, Event, EventRegistration, BlogPost, GalleryPhoto, Document, Setting) |
| Enums Prisma | **7** (UserRole, MembershipStatus, OrderStatus, DeliveryMethod, EventType, RegistrationStatus + autres) |
| Migrations appliquées | **17** (de `init_blog` le 24/02 à `add_granular_order_timestamps` le 15/05) |

## Infrastructure et déploiement

| Métrique | Valeur |
|---|---|
| Coût hosting mensuel | **0 €** (homelab personnel UM880, Coolify self-host) |
| Hostage avant migration | WordPress sur OVH, ~30-50 €/mois |
| Plugins WordPress à entretenir avant | ~15 |
| Plugins à entretenir maintenant | **0** |
| Reverse proxy | Cloudflare Tunnel (0 port exposé sur la box) |
| Provider DNS du domaine | Cloudflare |
| Hébergement mail transactionnel | Resend |
| Mailbox réception | OVH (`bureau@ladtc.be`, `admin@ladtc.be`) |
| Compte Stripe | Compte LADTC dédié depuis le 15/05/2026, mode Live activé |
| Méthodes de paiement | Carte + Bancontact |
| Monitoring | Sentry (client + serveur) + Uptime Kuma |
| DMARC | `p=quarantine` (production), rapports vers `dmarc@ladtc.be` |
| Auto-application des migrations Prisma | Oui depuis le 15/05 (fix #18 + #19) |
| Temps moyen build+deploy Coolify | ~80 secondes |
| Deploys réussis le 15/05 | **10** (entre 08:28 et 12:46) |

## Modules livrés (8)

1. **Authentification** — Email/password via BetterAuth, RBAC 3 rôles (MEMBER, COMMITTEE, ADMIN). COACH supprimé le 20/04.
2. **Membres** — Profils, statut cotisation, historique, gestion par le comité
3. **Cotisations** — Statut annuel, paiement Stripe direct, séasons en année calendaire 09 → 08
4. **Équipement** — Workflow grouped-orders complet (PENDING → BATCHED → ORDERED → RECEIVED → DELIVERED), stock par taille, mode de livraison HOME_DELIVERY/CLUB_PICKUP, frais admin-configurables, paiement différé pour commandes groupées, surplus reçu côté admin
5. **Événements** — Création, inscriptions, suivi participants
6. **Blog** — CRUD admin, rendu Markdown, vidéos embed (YouTube/Vimeo), publié directement dans Postgres
7. **Galerie photos** — Administration + affichage public
8. **Documents internes** — Upload, notes associées, accès restreint au comité

## Incidents notables (pour la section « Vie en prod »)

### Bug du pipeline migration Prisma silencieux (Issue #18, mai 2026)
- **Symptôme** : à chaque déploiement, le log container affichait `No migration found in prisma/migrations` puis démarrait quand même. Aucune nouvelle migration ne s'appliquait, mais le clé `|| echo "Warning..."` masquait l'échec.
- **Découverte** : 15/05 après le merge de PR #17 (sprint 1 Issue #16). La migration `add_batch_id_and_grouped_order_statuses` aurait dû s'appliquer ; à la place elle a été silencieusement ignorée. La migration a été appliquée manuellement en SQL pour récupérer la situation.
- **Root cause** : entrypoint Docker faisait `cd prisma-cli` avant d'appeler Prisma. Le `prisma.config.ts` copié dans `prisma-cli/` définit `migrations.path: "prisma/migrations"` en relatif → Prisma cherchait à `/app/prisma-cli/prisma/migrations/` (vide) au lieu de `/app/prisma/migrations/` (rempli).
- **Fix (PR #19)** : `set -eu` (fail-fast), pas de `cd`, `NODE_PATH=/app/prisma-cli/node_modules` pour résoudre l'import `prisma/config`, suppression du `|| echo "Warning..."`.
- **Leçon** : un script shell qui masque ses erreurs cache une bombe à retardement. Le pipeline « marchait » pendant 24 jours uniquement parce qu'il n'avait rien à faire (aucune migration nouvelle depuis le cutover).

### Régression silencieuse sur `/api/stripe/checkout` (PR #26, mai 2026)
- **Symptôme** : bouton « Payer maintenant » ne faisait rien quand le user cliquait, aucune erreur visible côté UI.
- **Découverte** : 15/05 pendant le test de bascule Stripe vers compte LADTC.
- **Root cause** : l'endpoint refusait toute commande dont le statut n'était pas `PENDING`. Or après le refactor d'Issue #16 sprint 1, les commandes direct-stock partent en `RECEIVED` à la création.
- **Fix** : remplacer le check strict par la même policy que l'UI (refuse CANCELLED + DELIVERED + paidAt set).
- **Leçon** : quand on refactor un workflow, lister tous les call sites qui guardent sur le statut avant de merger. Le typecheck ne catch pas les guards `if (order.status === "X")`.

### Incident StopApplication (mai 2026, non commité mais à mentionner)
- **Symptôme** : site en 404 pendant 5 minutes.
- **Cause** : appel à `App\Actions\Application\StopApplication::run($app)` au lieu de `queue_application_deployment()` pour déclencher un deploy.
- **Fix** : redémarrage immédiat via le bon helper.
- **Leçon** : utiliser les helpers publics, pas les actions internes.

## Pile technique complète

```
Frontend         Next.js 16 App Router · React 19 · TypeScript 5.7
UI               Tailwind CSS v4 · shadcn/ui
Client data      TanStack Query (staleTime + invalidation, pas de polling)
ORM              Prisma 7
DB               PostgreSQL 15 (Docker)
Auth             BetterAuth (email/password, RBAC 3 rôles)
Email            Resend (SPF + DKIM + DMARC p=quarantine)
Paiement         Stripe (carte + Bancontact), compte LADTC dédié
Monitoring       Sentry + Uptime Kuma
Tests            Vitest 3
Package mgr      pnpm 10.33 (pin)
Hébergement      Coolify self-hosted Docker
Reverse proxy    Cloudflare Tunnel → Traefik
DNS souverain    NextDNS sur le hub Mac
```

## Anecdotes WordPress à recueillir

(À compléter par Stéphane avant la rédaction.)

- [ ] Combien de plugins maintenait LADTC avant la migration ?
- [ ] Quels incidents WordPress justifiaient le passage à Next.js ? (formulaire cassé, performance, plugin obsolète, etc.)
- [ ] Combien le hosting WordPress coûtait par mois ?
- [ ] Combien de temps le comité passait sur la maintenance WordPress ?

## Posture commerciale à clarifier

(À compléter par Stéphane avant la rédaction.)

- [ ] Vraiment ouvrir cette plateforme à d'autres clubs (engagement commercial) ou juste laisser la possibilité ouverte ?
- [ ] Modèle économique envisagé : forfait setup + maintenance mensuelle, ou one-shot, ou autre ?
- [ ] Sports ciblés (trail, course, triathlon, autres) ?

## Évolutions futures à mentionner ou pas

(À compléter par Stéphane.)

- [ ] Intégration Strava (lien vers les sorties des membres) ?
- [ ] Module marathon / événement multi-jours (besoin spécifique) ?
- [ ] Multi-tenant (plusieurs clubs sur la même instance) vs déploiement séparé par club ?
