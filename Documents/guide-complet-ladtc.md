---
tags: [projet, ladtc, documentation, guide]
created: 2026-03-30
status: active
type: documentation
project: ladtc
---

# LADTC — Guide complet du site

**Projet** : LADTC — site web du club
**URL** : https://ladtc.be
**Stack** : Next.js 16 / React 19 / TypeScript / Prisma / PostgreSQL / BetterAuth / Stripe
**Deploiement** : Coolify (UM790 Pro) + Cloudflare Tunnel

---

## 1. Presentation generale

LADTC est un site complet pour un club de trail running belge (~100 membres). Il couvre :

- **Vitrine publique** : homepage, blog, évenements, galerie, equipe, contact
- **Espace membre** : profil, cotisation, commande d'équipement, inscription aux evenements
- **Administration** : gestion des membres, commandes, produits, blog, évenements, statistiques

Le site est entièrement autonome — pas de CMS externe. Le contenu (blog, evenements, photos) est gere directement dans la base de donnees via l'interface admin.

---

## 2. Les 4 profils utilisateur

### MEMBER (par defaut)

Le profil attribue automatiquement a l'inscription. Acces a l'espace membre.

| Fonctionnalite | Detail |
|----------------|--------|
| Profil | Modifier nom, telephone, contact d'urgence, avatar |
| Cotisation | Voir statut (PENDING/ACTIVE/EXPIRED), payer via Stripe |
| Equipement | Parcourir le catalogue, ajouter au panier, passer commande |
| Commandes | Consulter l'historique, suivre le statut |
| Evenements | Voir le calendrier, s'inscrire / se desinscrire |
| Blog | Lire les articles publies |
| Galerie | Parcourir les photos |

### COACH

Memes droits qu'un MEMBER, plus la gestion des entrainements.

| Fonctionnalite | Detail |
|----------------|--------|
| Entrainements | Creer et modifier les evenements de type TRAINING |
| Inscriptions | Voir les inscrits a ses entrainements |

### COMMITTEE

Acces complet a l'administration du club (sauf gestion des roles).

| Fonctionnalite | Detail |
|----------------|--------|
| Dashboard | KPIs (membres, commandes, cotisations), activite recente |
| Membres | Liste, recherche, filtres, modification statut/cotisation, export CSV |
| Creer membre | Ajouter un membre manuellement (sans inscription en ligne) |
| Commandes | Voir toutes les commandes, marquer expediee/livree, export CSV |
| Produits | CRUD complet (catalogue equipement) |
| Blog | Creer, editer, publier/depublier des articles |
| Evenements | CRUD complet (entrainements, courses, stages, social) |
| Galerie | Upload photos, organiser par categorie, supprimer |
| Logs | Consulter le journal d'activite |
| Rappels | Envoyer un email de rappel de cotisation a un membre |

### ADMIN

Tous les droits COMMITTEE, plus :

| Fonctionnalite | Detail |
|----------------|--------|
| Gestion des roles | Changer le role de n'importe quel utilisateur |
| Statistiques avancees | Tendances membres, revenus, top produits (graphiques) |
| Fonctions comite | Attribuer un titre de comite (President, Tresorier, etc.) |

---

## 3. Parcours utilisateur detailles

### 3.1 Visiteur anonyme

```
Homepage (/)
  ├── Blog (/blog) → Article (/blog/[slug])
  ├── Evenements (/events) → Detail (/events/[id]) → "Connectez-vous pour vous inscrire"
  ├── Equipement (/equipment) → Detail (/equipment/[id]) → Ajouter au panier
  │   └── Panier (/equipment/cart) → "Connectez-vous pour commander"
  ├── Equipe (/team)
  ├── Galerie (/gallery)
  ├── Contact (/contact) → Formulaire envoi email
  └── Inscription (/auth/register) → Email de bienvenue → Login
```

Le panier est stocke en localStorage — il persiste entre les sessions mais pas entre les appareils.

### 3.2 Membre connecte

```
Login (/auth/login)
  ├── Profil (/profile) → Modifier infos, voir cotisation
  ├── Cotisation (/membership/pay) → Stripe Checkout → Confirmation
  ├── Equipement (/equipment) → Panier → Checkout → Stripe → Confirmation
  ├── Commandes (/orders) → Detail (/orders/[id])
  ├── Evenements (/events/[id]) → S'inscrire / Se desinscrire
  └── Mot de passe oublie (/auth/reset-password) → Email → Nouveau mot de passe
```

### 3.3 Administrateur / Comite

```
Dashboard (/admin/dashboard)
  ├── Membres (/members) → Detail (/members/[id]) → Modifier statut / Envoyer rappel
  │   └── Nouveau membre (/members/new)
  ├── Commandes (/admin/orders) → Detail → Marquer expediee/livree
  ├── Produits (/admin/products) → Creer / Modifier / Supprimer
  ├── Blog (/admin/blog) → Creer / Editer / Publier
  ├── Evenements (/admin/events) → Creer / Modifier / Voir inscriptions
  ├── Galerie (/admin/gallery) → Upload / Organiser / Supprimer
  ├── Utilisateurs (/admin/users) → Changer roles [ADMIN only]
  ├── Statistiques (/admin/statistics) [ADMIN only]
  └── Logs (/admin/activity-logs)
```

---

## 4. Systeme d'authentification

### Inscription
1. L'utilisateur remplit le formulaire `/auth/register` (nom, email, mot de passe)
2. BetterAuth cree le compte avec le role `MEMBER`
3. Verification email **non requise** (desactivee dans la config)
4. Email de bienvenue envoye via Resend
5. L'utilisateur doit se connecter manuellement apres l'inscription
6. La cotisation est en statut `PENDING` jusqu'a validation par le comite

### Connexion
1. Email + mot de passe → session creee en base de donnees
2. Cookie `better-auth.session_token` (ou `__Secure-better-auth.session_token` en HTTPS)
3. Si l'utilisateur tente d'acceder a une route protegee sans session → redirection vers `/auth/login?callbackUrl=/route-originale`

### Reinitialisation de mot de passe
1. `/auth/reset-password` → saisie email
2. Email envoye avec lien de reinitialisation
3. L'utilisateur clique et definit un nouveau mot de passe

### Protection des routes

| Route | Acces requis |
|-------|-------------|
| `/profile`, `/orders`, `/membership` | Utilisateur connecte (tout role) |
| `/equipment/cart`, `/equipment/checkout` | Utilisateur connecte (tout role) |
| `/admin/*` | Role COMMITTEE ou ADMIN |
| `/admin/users`, `/admin/statistics` | Role ADMIN uniquement |
| Tout le reste | Public |

---

## 5. Paiements Stripe

### Equipement
1. Le membre remplit le formulaire de livraison et valide
2. La commande est creee en base (statut `PENDING`)
3. Session Stripe Checkout generee (mode `payment`, devise EUR)
4. Moyens de paiement : carte bancaire, Bancontact
5. Apres paiement → webhook Stripe met le statut a `CONFIRMED`
6. Email de confirmation de paiement envoye automatiquement

### Cotisation annuelle
1. Le membre clique "Payer" sur `/membership/pay`
2. Conditions : cotisation non active OU renouvellement dans moins de 30 jours
3. Session Stripe Checkout avec montant = cotisation (50 EUR par defaut)
4. Apres paiement → webhook met le statut a `ACTIVE`, calcule la nouvelle date de renouvellement (+1 an)
5. Email de confirmation envoye

### Webhook Stripe
- URL : `https://ladtc.be/api/stripe/webhook`
- Evenement traite : `checkout.session.completed`
- La metadata (`type` + `orderId` ou `membershipId`) determine le traitement
- Idempotent : un paiement deja traite est ignore

---

## 6. Emails automatiques

| Declencheur | Template | Destinataire |
|------------|----------|-------------|
| Inscription | Bienvenue | Nouveau membre |
| Reset mot de passe | Lien reinitialisation | Utilisateur |
| Commande payee (webhook) | Confirmation paiement | Email de livraison |
| Changement statut commande (admin) | Statut mis a jour | Email de livraison |
| Cotisation payee (webhook) | Cotisation confirmee | Membre |
| Rappel cotisation (admin, manuel) | Rappel renouvellement | Membre |

Tous les emails utilisent un template HTML sombre (fond #0f172a) avec le branding LADTC (orange #FF8C00).

---

## 7. Guide de test complet

### 7.1 Mise en place de l'environnement

```bash
# Cloner et installer
git clone <repo> && cd ladtc
pnpm install
cp .env.example .env.local
```

Remplir `.env.local` :
```bash
DATABASE_URL=postgresql://ladtc:changeme@localhost:5433/ladtc
BETTER_AUTH_SECRET=<openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_xxx          # optionnel en dev (emails logges en console)
STRIPE_SECRET_KEY=sk_test_xxx  # cle test Stripe
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
POSTGRES_USER=ladtc
POSTGRES_PASSWORD=changeme
```

### 7.2 Lancer la base de donnees et le seed

```bash
# Demarrer PostgreSQL
docker compose up -d db

# Appliquer les migrations
pnpm exec prisma migrate deploy

# Seeder les donnees initiales (admin + 5 produits)
pnpm exec prisma db seed

# Lancer le serveur
pnpm dev
```

Le seed cree :
- **1 compte admin** : `admin@ladtc.be` (mot de passe placeholder — utiliser le reset)
- **5 produits** : Maillot (25 EUR), Short (22 EUR), Veste (65 EUR), Bonnet (12 EUR), Chaussettes (8 EUR)

### 7.3 Creer les comptes de test

#### Compte ADMIN (deja seede)

```bash
# 1. Aller sur http://localhost:3000/auth/reset-password
# 2. Entrer admin@ladtc.be
# 3. Verifier les logs console (si pas de RESEND_API_KEY) pour le lien de reset
# 4. Definir un mot de passe

# Ou directement en base :
docker exec -it ladtc-db-1 psql -U ladtc -c \
  "SELECT id, email, role FROM \"User\" WHERE email='admin@ladtc.be';"
```

#### Comptes MEMBER (inscription classique)

1. Aller sur `http://localhost:3000/auth/register`
2. Creer 2-3 comptes avec des emails differents :
   - `membre1@test.com` — membre actif
   - `membre2@test.com` — membre en attente
   - `coach@test.com` — futur coach

#### Promouvoir des comptes via la base

```bash
# Connecter au container PostgreSQL
docker exec -it ladtc-db-1 psql -U ladtc

# Voir tous les utilisateurs
SELECT id, email, name, role FROM "User";

# Promouvoir en COMMITTEE
UPDATE "User" SET role='COMMITTEE' WHERE email='membre1@test.com';

# Promouvoir en COACH
UPDATE "User" SET role='COACH' WHERE email='coach@test.com';

# Promouvoir en ADMIN
UPDATE "User" SET role='ADMIN' WHERE email='membre2@test.com';

# Ou via l'interface admin : /admin/users (connecte en tant qu'admin)
```

#### Creer une cotisation pour un membre

```bash
docker exec -it ladtc-db-1 psql -U ladtc

# Trouver l'ID du membre
SELECT id FROM "User" WHERE email='membre1@test.com';

# Creer sa cotisation (statut ACTIVE)
INSERT INTO "Membership" (id, "userId", status, "joinedAt", "renewalDate", amount, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  '<user_id>',
  'ACTIVE',
  NOW(),
  NOW() + INTERVAL '1 year',
  50.0,
  NOW(),
  NOW()
);
```

Ou via l'admin : `/members` → selectionner le membre → modifier statut et date.

### 7.4 Scenarios de test

#### Scenario 1 — Parcours visiteur → inscription → membre

| Etape | Action | Resultat attendu |
|-------|--------|-----------------|
| 1 | Ouvrir `http://localhost:3000` | Homepage avec hero, blog, evenements |
| 2 | Naviguer vers `/equipment` | Catalogue avec 5 produits |
| 3 | Cliquer sur un produit → Ajouter au panier | Badge panier dans le header |
| 4 | Aller au panier `/equipment/cart` | Articles affiches avec total |
| 5 | Cliquer "Passer la commande" | Redirige vers `/auth/login` |
| 6 | Cliquer "Creer un compte" | Formulaire d'inscription |
| 7 | Remplir et soumettre | Email de bienvenue (console si pas de Resend) |
| 8 | Se connecter | Redirige vers le checkout |
| 9 | Remplir adresse de livraison | Formulaire de checkout |
| 10 | Soumettre | Commande creee, redirection Stripe |

#### Scenario 2 — Paiement cotisation

| Etape | Action | Resultat attendu |
|-------|--------|-----------------|
| 1 | Se connecter en tant que membre | Header affiche le nom |
| 2 | Aller sur `/membership/pay` | Statut cotisation + bouton "Payer" |
| 3 | Cliquer "Payer par carte ou Bancontact" | Redirection vers Stripe Checkout |
| 4 | Utiliser carte test `4242 4242 4242 4242` | Paiement accepte |
| 5 | Retour sur `/membership/pay/success` | Confirmation affichee |
| 6 | Verifier `/profile` | Statut passe a ACTIVE |

#### Scenario 3 — Inscription evenement

| Etape | Action | Resultat attendu |
|-------|--------|-----------------|
| 1 | Connecte en admin, creer un evenement via `/admin/events/new` | Evenement visible dans la liste |
| 2 | Se deconnecter, se connecter en tant que membre | — |
| 3 | Aller sur `/events` | L'evenement apparait |
| 4 | Cliquer sur l'evenement → "S'inscrire" | Inscription confirmee, compteur +1 |
| 5 | Cliquer "Se desinscrire" | Inscription annulee |

#### Scenario 4 — Gestion admin complete

| Etape | Action | Resultat attendu |
|-------|--------|-----------------|
| 1 | Se connecter en ADMIN | Dashboard avec KPIs |
| 2 | `/members` → Voir la liste | Tous les membres affiches |
| 3 | Cliquer sur un membre → modifier statut | Statut mis a jour |
| 4 | `/admin/blog/new` → Creer un article | Article en brouillon |
| 5 | Publier l'article | Visible sur `/blog` |
| 6 | `/admin/products/new` → Creer un produit | Produit visible sur `/equipment` |
| 7 | `/admin/orders` → Voir commandes | Liste des commandes |
| 8 | Marquer une commande "Expediee" | Email envoye, statut mis a jour |
| 9 | `/admin/users` → Changer un role | Role modifie immediatement |
| 10 | `/admin/statistics` | Graphiques et tendances |

#### Scenario 5 — Commande equipement complete

| Etape | Action | Resultat attendu |
|-------|--------|-----------------|
| 1 | Connecte en membre, `/equipment` | Catalogue |
| 2 | Ajouter Maillot taille M + Short taille L | 2 articles dans le panier |
| 3 | `/equipment/cart` → verifier | Sous-total : 47 EUR |
| 4 | "Passer la commande" → remplir adresse | Formulaire checkout |
| 5 | Soumettre | Commande creee (PENDING) |
| 6 | Stripe Checkout → `4242 4242 4242 4242` | Paiement OK |
| 7 | Webhook → commande passe a CONFIRMED | Email de confirmation |
| 8 | Admin : `/admin/orders` → marquer "Expediee" | Email statut envoye |
| 9 | Membre : `/orders` → voir le suivi | Statut SHIPPED visible |

### 7.5 Tester les paiements Stripe en local

```bash
# Installer le CLI Stripe
brew install stripe/stripe-cli/stripe

# Ecouter les webhooks et les rediriger
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Le CLI affiche un webhook signing secret (whsec_xxx)
# → Mettre a jour STRIPE_WEBHOOK_SECRET dans .env.local

# Cartes de test :
# Paiement reussi   : 4242 4242 4242 4242
# Paiement refuse   : 4000 0000 0000 0002
# 3D Secure         : 4000 0025 0000 3155
# Bancontact        : utiliser le mode test Stripe
```

### 7.6 Verifier les emails en dev

Sans `RESEND_API_KEY`, les emails sont affiches dans la console du serveur Next.js (`pnpm dev`). Chercher les lignes contenant le sujet de l'email pour retrouver le contenu HTML.

Avec Resend, configurer un domaine de test ou utiliser l'adresse `onboarding@resend.dev` pour recevoir les emails en mode sandbox.

### 7.7 Commandes utiles pendant les tests

```bash
# Lancer les tests unitaires
pnpm test

# Lancer en mode watch
pnpm test:watch

# Verifier les types
pnpm exec tsc --noEmit

# Verifier le lint
pnpm exec eslint src/

# Ouvrir Prisma Studio (interface visuelle de la BDD)
pnpm exec prisma studio
# → http://localhost:5555

# Reset complet de la base
pnpm exec prisma migrate reset
# Attention : supprime toutes les donnees et relance le seed
```

---

## 8. Architecture des donnees

```
User (1) ──── (1) Membership     Cotisation annuelle
  │
  ├── (N) Order ──── (N) OrderItem ──── Product
  │                                      Catalogue equipement
  ├── (N) EventRegistration ──── Event
  │                               Calendrier du club
  ├── (N) BlogPost                Articles et actualites
  │
  ├── (N) GalleryPhoto            Photos du club
  │
  └── (N) ActivityLog             Journal des actions admin
```

### Statuts cles

**Membership** : `PENDING` → `ACTIVE` (apres paiement) → `EXPIRED` (apres date) / `INACTIVE` (pause volontaire)

**Order** : `PENDING` → `CONFIRMED` (webhook Stripe) → `SHIPPED` (admin) → `DELIVERED` (admin) / `CANCELLED`

**EventRegistration** : `REGISTERED` → `ATTENDED` (admin, apres l'evenement) / `CANCELLED` (desinscription)

---

## 9. Checklist de validation avant mise en production

### Fonctionnel
- [ ] Inscription d'un nouveau membre
- [ ] Connexion / deconnexion
- [ ] Reset de mot de passe (email recu)
- [ ] Modification du profil
- [ ] Paiement cotisation via Stripe
- [ ] Ajout au panier + commande complete
- [ ] Paiement commande via Stripe
- [ ] Inscription / desinscription evenement
- [ ] Creation et publication d'un article blog
- [ ] Upload photo galerie
- [ ] Dashboard admin avec donnees reelles
- [ ] Export CSV membres et commandes
- [ ] Changement de role utilisateur

### Technique
- [ ] Tests unitaires passent (`pnpm test` → 272/272)
- [ ] Build reussi (`pnpm build`)
- [ ] TypeScript sans erreur (`pnpm exec tsc --noEmit`)
- [ ] ESLint sans erreur
- [ ] Variables d'environnement configurees dans Coolify
- [ ] Migrations Prisma appliquees
- [ ] Seed execute (admin + produits)
- [ ] Webhook Stripe configure et fonctionnel
- [ ] Cloudflare Tunnel route vers le bon port
- [ ] HTTPS actif (Cloudflare SSL Full Strict)
- [ ] Monitoring Uptime Kuma configure

### Securite
- [ ] `BETTER_AUTH_SECRET` genere avec `openssl rand -hex 32`
- [ ] Pas de credentials dans le code
- [ ] CSP headers actifs
- [ ] Rate limiting sur `/api/auth/*` et `/api/contact`
- [ ] Webhook Stripe verifie par signature

---

*Document cree le 2026-03-30 — a mettre a jour apres le premier deploiement production.*
