---
date: 2026-07-23
tags: [ladtc, comite, demo, utc4]
---

# Réunion comité — jeudi 23/07/2026

> Script de démo préparé le 10/07/2026. Adapté du protocole du 12/06 avec les
> nouveautés déployées en juillet (vérification email, paiement événements,
> email de bienvenue, webhook Stripe étendu).

## Mise en place

- **Onglet A** : navigation privée = visiteur / nouveau membre.
- **Onglet B** : session connectée en COMMITTEE / ADMIN (`stephaneroos@gmail.com`).
- **Téléphone** : prêt pour Bancontact + boîte mail (alias Gmail).
- **Adresse démo** : `stephaneroos+demo@gmail.com` (alias Gmail — l'email de
  vérification arrive dans la boîte normale). **Taper l'adresse soigneusement** :
  une faute de frappe = email de vérification perdu, sans erreur visible.
- **Après la réunion** : supprimer le compte démo via Admin → Utilisateurs.

## Nouveautés depuis le 12/06 (à montrer)

1. **Vérification email obligatoire** : à l'inscription, le membre reçoit un
   email avec un lien de confirmation. Il ne peut pas se connecter avant d'avoir
   cliqué. → anti-spam, sécurité.
2. **Auto-login après vérification** : après clic sur le lien de confirmation,
   le membre est automatiquement connecté et **redirigé vers `/membership/pay`**
   (page de cotisation). Plus besoin de chercher comment payer.
3. **Email de bienvenue** : une fois l'email vérifié, un email de bienvenue est
   envoyé automatiquement.
4. **Paiement des inscriptions aux événements** : les événements peuvent
   désormais être payants. Le membre paie via Stripe à l'inscription. Si la
   session Stripe expire (abandon), l'inscription est libérée pour réessayer.
5. **Webhook Stripe étendu** : les échecs de paiement et sessions expirées sont
   maintenant gérés (log + libération des inscriptions en attente).

## Protocole de démo (~25 min)

### 1. (3 min) Tour du site public — onglet A
Accueil, blog, événements, galerie, équipe, page UTC 4, contact.

### 2. (5 min) Inscription d'un nouveau membre en direct — onglet A
« Devenir membre » → formulaire → **email de vérification reçu** (montrer
le téléphone) → cliquer le lien → **auto-login + redirection vers
`/membership/pay`** → montrer l'espace membre : « Aucune cotisation trouvée ».

**Points clés à souligner** :
- L'email de vérification protège contre les inscriptions frauduleuses.
- L'auto-redirect vers `/membership/pay` supprime la friction : le nouveau
  membre sait immédiatement quoi faire.
- L'email de bienvenue part automatiquement (montrer la boîte mail).

### 3. (3 min) Côté comité — onglet B
Dashboard, KPIs, gestion des membres → **créer la fiche cotisation du nouvel
inscrit** (mettre 1 € pour le test de paiement réel), montrer les logs
d'activité. Rappeler le mode d'emploi distribué en avril.

### 4. (3 min) Paiement réel — onglet A
Le nouveau membre paie sa cotisation (1 €) en **Bancontact avec un vrai
compte** → retour succès → recharger le profil : **carte de membre ACTIVE**,
activée automatiquement par le webhook. Montrer dans le dashboard Stripe que
l'argent arrive.

### 5. (5 min) Inscription à un événement payant — onglet A + B
**Préparation** : onglet B (COMMITTEE) → créer un événement de test avec un
prix (ex : « Réunion comité août », 5 €). Publier.

**Démo** : onglet A → page Événements → fiche → « S'inscrire et payer 5 € » →
Stripe Checkout → paiement Bancontact → retour → inscription confirmée +
email de confirmation reçu.

**Si on abandonne** : montrer que la session expirée libère l'inscription
(webhook `checkout.session.expired` — pas visible côté user, mais à mentionner
pour la robustesse).

**Nettoyage** : onglet B → supprimer l'événement de test.

### 6. (3 min) Rubrique UTC 4 — https://ladtc.be/utc
Dérouler les sections. Statut actuel :
- ✅ Date : 24/10/2026 (nocturne), Salle CACS
- ✅ Deux parcours : 9 km / 18 km (en binôme)
- ✅ Prix : 15 € / 25 € par binôme
- ⏳ Lien Ultratiming : à ajouter dès réception
- ⏳ Règlement : page placeholder `/utc/reglement` à compléter
- ⏳ Ouverture inscriptions : ~début septembre

**Décisions à prendre** :
- [ ] Confirmer prix 15/25 €
- [ ] Valider le règlement (qui rédige ? deadline ?)
- [ ] Confirmer date d'ouverture des inscriptions
- [ ] Sponsoring : statut des démarches (rétroplanning : bouclé fin août sinon
  absent du flyer)

### 7. (3 min) Boutique équipement — onglet B
Boutique, création d'un produit (maillot), principe des commandes groupées
(paiement différé jusqu'à réception du lot), export CSV.

## Frais Stripe (si la question vient)

| Montant payé | Commission ≈ | Net pour le club |
|---|---|---|
| 1 € (test) | 0,27 € | 0,73 € |
| 50 € (cotisation) | ~0,95 € | ~49,05 € |
| 25 € (inscription binôme) | ~0,60 € | ~24,40 € |

Soit **~2 % par transaction**, en échange de : zéro manipulation de liquide,
traçabilité complète, activation automatique.

## Checklist avant la réunion

- [ ] Vérifier https://ladtc.be sur téléphone (affichage mobile)
- [ ] Vérifier la connexion ADMIN avec `stephaneroos@gmail.com`
- [ ] Passer la prod en revue : pas de contenu de test visible
- [ ] Préparer l'événement de test (ou le créer en direct pendant la démo)
- [ ] Ouvrir avant 19h30 : site en prod + ce document + téléphone (Bancontact + mail)

## Après la réunion

- [ ] Supprimer le compte démo (`stephaneroos+demo@gmail.com`) via Admin
- [ ] Supprimer l'événement de test
- [ ] Reporter les décisions UTC 4 dans `src/config/site.ts` → push master
- [ ] Mettre à jour le règlement `/utc/reglement` si validé
- [ ] Ajouter le lien Ultratiming dès réception
