---
tags: [projet, ladtc, stripe, paiement]
created: 2026-04-21
status: pending
type: plan
project: ladtc
---

# Stripe — Migration vers compte dédié LADTC

## Contexte

Le site utilise actuellement le compte Stripe personnel (anthemion.dev). Pour la mise en production, il faut un compte Stripe au nom du club. L'intégration côté code est **terminée** — aucune modification de code nécessaire.

## Prérequis comité

Avant toute action technique, le comité doit fournir :

- [ ] **Titulaire du compte** : président ou trésorier (personne physique pour le KYC Stripe)
- [ ] **IBAN + BIC** du compte bancaire du club
- [ ] **Pièce d'identité** du titulaire (vérification Stripe)
- [ ] **Email** pour le compte Stripe (`admin@ladtc.be` ou `tresorier@ladtc.be`)

## Étapes techniques

### 1. Créer le compte Stripe

- dashboard.stripe.com → nouveau compte
- Type : association / particulier (Belgique)
- Vérification identité (KYC) — peut prendre 24-48h
- Associer l'IBAN du club
- Infos publiques :
  - Nom : "LADTC — Les Amis du Trail Club"
  - URL : `https://ladtc.be`
  - Email support : `admin@ladtc.be`

### 2. Produits — Rien à faire

Le code crée les produits dynamiquement via `price_data` dans chaque Checkout Session. Les noms et prix viennent de la base Prisma, pas du catalogue Stripe. Aucun produit à recréer dans le Dashboard.

Fichiers de référence :
- `src/app/api/stripe/checkout/route.ts` (lignes 64-73) — produits équipement
- `src/app/api/stripe/membership/route.ts` (lignes 51-60) — cotisation annuelle

### 3. Configurer le webhook

- Dashboard Stripe → Developers → Webhooks → Add endpoint
- URL : `https://ladtc.be/api/stripe/webhook`
- Événement : `checkout.session.completed`
- Copier le Webhook Signing Secret (`whsec_...`)

Le handler (`src/app/api/stripe/webhook/route.ts`) gère deux types :
- `equipment_order` → confirme la commande, envoie email
- `membership_dues` → active la cotisation pour la saison en cours, envoie email

### 4. Variables d'environnement (Coolify)

Coolify UI → Projet LADTC → Environment Variables — remplacer :

| Variable | Valeur |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` (API Keys) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (Webhooks) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (API Keys) |

**Important** : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` doit aussi être en **Build Argument** dans Coolify (Next.js l'inline dans le bundle client au build).

### 5. Redéployer et tester

1. Redéployer via Coolify (rebuild obligatoire pour la publishable key)
2. Test webhook : Dashboard Stripe → Send test webhook
3. Test cotisation : se connecter → `/membership/pay` → payer 50 EUR → vérifier DB + email
4. Test équipement : ajouter au panier → checkout → payer → vérifier DB + email
5. Vérifier que Bancontact fonctionne comme méthode de paiement

### 6. Dev local (optionnel)

```bash
# .env.local — clés TEST du nouveau compte
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Stripe CLI pour les webhooks locaux :
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Checklist finale

- [ ] Paiement cotisation réussi → webhook reçu → DB mise à jour → email envoyé
- [ ] Paiement équipement réussi → idem
- [ ] Bancontact fonctionne
- [ ] Ancien compte anthemion.dev déconnecté
- [ ] `gh issue close 4`

## Estimation

- **Effort technique** : ~1h (config + tests)
- **Délai KYC Stripe** : 24-48h potentiellement
- **Bloquant** : décision comité (titulaire + IBAN)
- **Code à modifier** : aucun
