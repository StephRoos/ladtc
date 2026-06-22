---
date: 2026-06-12
tags: [ladtc, comite, demo, utc4]
---

# Réunion comité — vendredi 12/06/2026

**Lieu** : Place de Lahamaide 22B, 7890 Lahamaide — RDV 19h, début 19h30.
**Point animé par Stéphane** : lancement du site auprès des membres / gestion du site / rubrique UTC 4 (règlement, lien inscriptions) / commande des futurs maillots.

## UTC 4 — ce qui est déjà connu (docs reçus 11-12/06)

- **Nom** : L'Urbanbayern Trail des Collines (L'UTC) — course folklorique thème Oberbayern
- **Date** : **samedi 24 octobre 2026, en nocturne** (source : tableau sponsoring UTC 4)
- **Lieu** : école communale d'Ellezelles (départ/arrivée) — 250 € la location en 2025
- **Formule UTC 3** : course **en binôme**, 2 boucles (9 km / 18 km), 12 €/binôme 1 tour, 20 €/binôme 2 tours, limite 150 équipes par distance (600 pers. max)
- **Segment montagne** : Grand Prix « Bellezellesbutte », classement individuel (depuis 2025), chrono sur tapis (Ultratiming)
- **Inscriptions** : via Ultratiming (Matthieu) · **Chrono** : Ultratiming · **Assurance** : DLG (Joachim)
- **Site existant** : www.urbanbayerntrail.be (6 €/mois, géré par Max)
- **Sponsoring** : paliers 1000/500/250/100/50 €, versement BE71 0019 4925 1069, communication « sponsor course DTC + nom de l'entreprise », contact ladtc2021@gmail.com. 2025 : ~6 000 € récoltés. Dons en nature acceptés.
- **Référence finances** : frais UTC 2 ≈ 5 800 € (dont ~3 000 € en liquide) ; bar Sabbat ≈ 3 500-4 000 € de bénéfice (sécurité financière du club)

## État du site (vérifié le 11/06 au soir)

- Prod : https://ladtc.be — en ligne, réponse < 200 ms.
- Repo : `~/Projects/ladtc` (`StephRoos/ladtc`), master propre, 311 tests verts, build OK.
- Le bug du formulaire de contact (audit avril) est **corrigé** : l'envoi d'email est branché.
- **Nouveau** : rubrique UTC 4 **déployée en prod le 11/06 au soir** → https://ladtc.be/utc

## Rubrique UTC 4 (en ligne sur https://ladtc.be/utc)

Page publique `/utc` + lien "UTC 4" dans le menu et le footer, avec le **contenu réel** des docs UTC 3/UTC 4 :
- **Infos clés** : samedi 24 octobre 2026 (nocturne) / école communale d'Ellezelles / inscriptions "Ouverture prochaine via Ultratiming"
- **Parcours et formules** : 1 boucle 9 km, 2 boucles 18 km (en binôme, tarifs UTC 3 affichés "à confirmer") + Grand Prix Bellezellesbutte
- **Règlement** : projet en 9 articles pré-rempli avec les acquis UTC 3 (binôme, nocturne/frontale, ravitos, podiums, maillots jaunes/à pois, assurance)
- **Devenir sponsor** : paliers, avantages, IBAN + communication, contact email
- Les sections provisoires portent un badge **"Projet — à valider par le comité"**
- Contenu centralisé dans `src/config/site.ts` (bloc `utc`) : lien d'inscription, tarifs, date → mise à jour en quelques minutes après les décisions

La page est **en production** : démontrable directement sur https://ladtc.be/utc, y compris depuis les téléphones du comité. Les badges "Projet — à valider" assument le statut provisoire jusqu'à validation.

## Protocole de démo (~20 min)

**Mise en place (2 onglets)** : onglet A en **navigation privée** = visiteur/nouveau membre ; onglet B = session connectée (étape 3 en COMMITTEE, suppression finale en ADMIN). Téléphone prêt pour Bancontact et pour relever l'email.

**Adresse démo du jour : `stephaneroos+demo@gmail.com`** (alias Gmail — l'email de vérification arrive dans la boîte normale ; base vérifiée le 11/06 : aucune trace, les comptes du test ont été supprimés). **Taper l'adresse soigneusement** : la répétition du 11/06 a montré qu'une faute de frappe = email de vérification perdu, sans erreur visible. Après la réunion : supprimer le compte via Admin → Utilisateurs (rôle ADMIN requis).

**Comptes réels en prod** (vérifié le 11/06) : ADMIN = `stephaneroos@gmail.com` (création de fiche + suppression) ; **les 8 membres du comité ont déjà leur compte COMMITTEE** (Max, David, François, Andy, Matthieu, Jo, Bruno, Benoît) — argument tout fait pour le point « gestion du site ». Les anciens comptes de test (`comite@test.com`, `admin@ladtc.be`) n'existent pas en prod.

**Répétition générale du 11/06 : parcours complet validé** — inscription → fiche (statut « En attente », 1 €) → paiement Bancontact réel → activation automatique → suppression des comptes de test.

1. **(3 min) Tour du site public** — onglet A : accueil, blog, événements, galerie (photos + vidéos), équipe, page contact.
2. **(3 min) Inscription d'un nouveau membre en direct** — onglet A : « Devenir membre », formulaire, email de vérification reçu et cliqué. Montrer son espace membre : *« Aucune cotisation trouvée »* → **enchaîner sur l'arbitrage cotisations** (voir encadré ci-dessous) : "voilà la décision à prendre ce soir".
3. **(3 min) Côté comité** — onglet B : dashboard, KPIs, gestion des membres → **créer la fiche cotisation du nouvel inscrit** (mettre 1 € pour le test de paiement réel), montrer les logs d'activité. Rappeler le mode d'emploi distribué en avril.
4. **(3 min) Paiement réel** — onglet A : le nouveau membre paie sa cotisation (1 €) en **Bancontact avec un vrai compte** → retour succès → recharger le profil : **carte de membre ACTIVE**, activée automatiquement par le webhook. Montrer dans le dashboard Stripe (téléphone ou onglet) que l'argent arrive sur le compte du club. *(C'était le test final prévu à la clôture de l'issue #4.)*
5. **(4 min) Rubrique UTC 4** — https://ladtc.be/utc : dérouler les sections, expliquer les badges "Projet — à valider" → remplir `docs/utc4-decisions-2026-06-12.md` au fil des validations (date, tarifs, règlement, sponsoring).
6. **(2 min) Maillots** — onglet B : boutique équipement, création d'un produit, principe des commandes groupées (paiement différé jusqu'à réception du lot), export.
7. **(2 min) Décisions restantes** : urbanbayerntrail.be, titulaire Stripe, lancement membres, dates réunion d'août → compléter le document.
8. **Pendant le point suivant de l'ordre du jour** : « applique les décisions de docs/utc4-decisions-2026-06-12.md » à Claude Code → ~4 min plus tard, **montrer https://ladtc.be/utc mis à jour en direct** avant de clôturer.

### Arbitrage à soumettre au comité : cotisation des nouveaux membres

La question : *que se passe-t-il juste après qu'un nouveau venu s'inscrit sur le site ?*

| | **Option A — validation comité (actuel)** | **Option B — paiement direct** |
|---|---|---|
| Parcours | Inscription → un membre du comité crée la fiche cotisation → le membre paie en ligne | Inscription → fiche créée automatiquement → paiement immédiat carte/Bancontact |
| Contrôle | Le comité filtre qui devient membre, montant au cas par cas (famille, demi-saison…) | Quiconque paie devient membre ; montant unique par défaut (ajustable ensuite) |
| Friction | Le nouveau membre attend la validation (heures/jours) | Aucune — idéal pour le lancement |
| Charge comité | Une action manuelle par adhésion | Zéro (surveillance des inscriptions seulement) |
| Dev | Rien à faire | Petit chantier (~1 session) : fiche auto à l'inscription |

Recommandation possible : option B avec montant par défaut 50 € si le club veut maximiser les adhésions au lancement ; option A si le comité tient à valider chaque adhésion. La décision se note dans le document, section 7.

### Frais Stripe — à avoir en tête si la question vient

Stripe prélève sa commission avant versement (Bancontact : ~1,4 % + 0,25 € par transaction) ; le dashboard affiche le **net** :

| Montant payé | Commission ≈ | Net pour le club |
|---|---|---|
| 1 € (test du 11/06) | 0,27 € | 0,73 € |
| 50 € (cotisation) | ~0,95 € | ~49,05 € |

Soit **~1 € par cotisation de 50 € (~2 %)**, en échange de : zéro manipulation de liquide, traçabilité complète, activation automatique de la carte de membre. Même ordre de grandeur pour les maillots vendus via la boutique.

Versements : le solde « à venir » part vers l'IBAN du club selon le calendrier de payout Stripe — jusqu'à 7 jours pour les premiers versements d'un nouveau compte, puis 2-3 jours ouvrés en rythme de croisière. Normal de ne rien voir sur le compte bancaire le soir même.

## Décisions / validations à obtenir

### UTC 4
- [ ] **Confirmer la date** affichée : samedi 24/10/2026 en nocturne
- [ ] **Tarifs 2026** : reconduire 12 € / 20 € par binôme ?
- [ ] **Formats** : reconduire 9/18 km en binôme ? Nouveau tracé (à envoyer à la commune début septembre)
- [ ] **Lien d'inscription Ultratiming** : date d'ouverture (réf. UTC 3 : 1re semaine de septembre) → dès reçu, renseigner `registrationUrl`
- [ ] **Règlement** : valider les 9 articles ou désigner le rédacteur (Max gérait ce poste à l'UTC 3) + deadline
- [ ] **Tableau sponsoring** : validation (point officiel de l'ordre du jour) → lancement de la recherche sponsors. Rappel rétroplanning : démarches sponsors bouclées **fin août** sinon absents du flyer (tirage 500 ex. pour début septembre)

### Club / site
- [ ] **Stripe — FAIT depuis le 15/05** (issue #4 fermée) : compte dédié LADTC, IBAN du club associé, Bancontact actif, clés live en prod. Deux points pour demain :
  - **Test paiement réel devant le comité** (prévu à la clôture de l'issue) : une vraie carte/Bancontact sur une commande — moment fort de la démo
  - Titulaire du compte = Stéphane à titre personnel "pour l'instant" → décider si on transfère la titularité (et à qui) à terme
- [ ] **Maillots** : clarifier le périmètre - modèle, prix, fenêtre de commande via la boutique
- [ ] **Lancement membres** : date d'annonce (groupe Facebook membres), formation éventuelle

## Checklist avant la réunion (vendredi — réunion à domicile, sur ce Mac)

- [ ] Vérifier https://ladtc.be/utc sur téléphone (affichage mobile — les membres regarderont sur leur écran)
- [ ] Vérifier la connexion ADMIN avec `stephaneroos@gmail.com` sur https://ladtc.be
- [ ] Passer la prod en revue : pas de contenu de test visible (articles brouillons, produits factices, événements bidon)
- [ ] Ouvrir avant 19h30 : le site en prod + `docs/utc4-decisions-2026-06-12.md` (repo `~/Projects/ladtc`) + une session Claude Code prête
- [ ] Si projection : brancher l'écran/TV et tester l'affichage

## Workflow de fin de réunion (mise à jour en direct)

1. Compléter `~/Projects/ladtc/docs/utc4-decisions-2026-06-12.md` au fil des décisions (cases + blancs)
2. Dire à Claude Code : « **applique les décisions de docs/utc4-decisions-2026-06-12.md** »
3. Claude met à jour `siteConfig.utc` + la page, lance lint/tests/build, push master
4. ~4 minutes plus tard : https://ladtc.be/utc à jour → montrer le résultat au comité avant de clôturer

## Rétroplanning UTC 4 (calqué sur l'UTC 3)

| Échéance | Action | Responsable UTC 3 |
|---|---|---|
| Fin août | Démarches sponsors terminées (sinon absents du flyer) | Tous (Max coordonne) |
| Début septembre | Circuit envoyé à la commune pour validation | — |
| Début septembre | Bâche (mention « 4e samedi d'octobre » réutilisable ?) | Max |
| ~7 septembre | Flyers imprimés (500 ex.) | Max |
| 1re semaine de septembre | Ouverture des inscriptions Ultratiming + Betrail | Matthieu / François |
| 1 semaine avant course | Infos pratiques aux inscrits (parking, frontale…) | Benoit |
| 24 octobre | Course | Tous |

## Après la réunion

- Reporter les décisions dans `siteConfig.utc` (tarifs, lien inscription) + règlement final → retirer les badges "Projet — à valider" → push master (déploiement Coolify automatique)
- Stripe : si test réel concluant, reste le cleanup (rotation ancienne clé anthemion.dev, suppression webhook test)
- Créer le produit maillot + commande groupée selon les choix du comité
- Ajouter l'UTC 4 dans les événements du site (module events) une fois la date confirmée
