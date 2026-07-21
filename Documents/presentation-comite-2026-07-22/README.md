---
tags: [ladtc, presentation, comite]
date: 2026-07-20
event: presentation-comite-2026-07-22
---

# Présentation au comité LADTC — mercredi 22 juillet 2026

Dossier préparatoire pour la réunion de comité du LADTC du **mercredi 22 juillet
2026**. Cette session fait suite à la présentation du 17 avril et intègre les
nouveautés déployées en juillet (vérification email, paiement des événements,
webhook Stripe étendu) ainsi que l'audit du site du 20 juillet.

## Livrables

Trois fichiers dans ce dossier.

| Fichier | Usage |
|---|---|
| `mode-emploi-comite.html` | Manuel d'utilisation à imprimer et distribuer aux membres du comité. Nouvelle version complète intégrant les nouveautés de juillet. |
| `presentation.html` | Diaporama à projeter pendant la réunion. Reveal.js, environ 35 diapositives pour 30 à 40 minutes. |
| `README.md` | Ce fichier. Instructions d'utilisation et checklist jour J. |

Document associé (hors dossier) :

| Document | Emplacement |
|---|---|
| Audit complet du site (20/07) | `~/Projects/ladtc/Documents/audit-site-2026-07-20.md` |
| Audit de parcours utilisateur (09/07) | `~/SecondBrain/01-Projects/ladtc/Audit Parcours Utilisateur 2026-07-09.md` |
| Script de démo détaillé | `~/Projects/ladtc/Documents/demo-comite-2026-07-23.md` |

---

## Imprimer le mode d'emploi (conversion HTML → PDF)

Aucun outil à installer. Depuis un navigateur.

1. Ouvrir `mode-emploi-comite.html` dans Chrome, Safari ou Firefox :
   ```
   open mode-emploi-comite.html
   ```
2. Menu **Fichier → Imprimer** (ou `Cmd+P` sur Mac, `Ctrl+P` sur Windows)
3. Dans la fenêtre d'impression :
   - **Destination** : « Enregistrer au format PDF » (au lieu d'une imprimante physique)
   - **Taille du papier** : A4
   - **Marges** : Par défaut
   - **Mise à l'échelle** : 100 %
   - **Options** : décocher « En-têtes et pieds de page » si proposé
   - Cocher **« Arrière-plans et graphiques »** pour conserver les couleurs
4. Cliquer sur **Enregistrer**, choisir le nom `ladtc-mode-emploi-comite-2026-07-22.pdf`

### Impression papier

Ensuite ouvrir le PDF et imprimer autant d'exemplaires que de membres du comité.
Recommandation : impression couleur recto-verso, agrafage coin haut-gauche.

---

## Lancer la présentation

### Prérequis le jour J

- Un ordinateur (Mac recommandé, le même qui a servi à préparer)
- Un projecteur ou un grand écran
- Câble HDMI ou adaptateur USB-C / Thunderbolt selon l'écran
- Une connexion internet (le diaporama utilise Reveal.js via CDN)

### Procédure

1. Ouvrir `presentation.html` dans Chrome ou Safari :
   ```
   open presentation.html
   ```
2. Appuyer sur **F** pour passer en plein écran
3. Navigation :
   - Flèche droite ou espace : diapositive suivante
   - Flèche gauche : diapositive précédente
   - **S** : vue présentateur (chronomètre, notes, prochaine diapositive)
   - **Esc** : quitter le plein écran
   - **O** : vue d'ensemble de toutes les diapositives
4. Sortir du plein écran avec **Esc** puis fermer l'onglet à la fin

### Sauvegarde : export PDF de la présentation

Si le projecteur ou internet flanchent le jour J, un PDF de secours est possible.

1. Ouvrir `presentation.html?print-pdf` dans Chrome (obligatoire, Safari ne
   supporte pas l'export PDF Reveal.js) :
   ```
   open -a "Google Chrome" "presentation.html?print-pdf"
   ```
2. Attendre le chargement complet
3. `Cmd+P` → Destination « Enregistrer au format PDF » → Mise en page **Paysage** → Arrière-plans et graphiques cochés
4. Enregistrer sous `ladtc-presentation-comite-2026-07-22.pdf`

Ce PDF pourra être projeté depuis n'importe quelle application si Reveal.js ne
fonctionne pas.

---

## Checklist jour J (mercredi 22 juillet 2026)

### La veille

- [ ] Vérifier que les deux HTML s'ouvrent correctement dans le navigateur
- [ ] Imprimer N exemplaires du mode d'emploi (N = nombre de membres du comité + 2 en réserve)
- [ ] Générer le PDF de secours de la présentation
- [ ] Charger complètement l'ordinateur
- [ ] Vérifier l'adaptateur HDMI / USB-C

### 30 minutes avant

- [ ] Arriver en avance sur place
- [ ] Brancher l'ordinateur au projecteur, tester l'affichage
- [ ] Régler le son à zéro (pas de bip intempestif)
- [ ] Fermer toutes les applications non nécessaires
- [ ] Mettre le Mac en mode « Ne pas déranger »
- [ ] Ouvrir la présentation et passer en plein écran
- [ ] Avoir sous la main : mode d'emploi imprimé, carnet pour les retours

### Préparation de la démo (onglets + téléphone)

- [ ] Onglet A : navigation privée = visiteur / nouveau membre
- [ ] Onglet B : session connectée en COMMITTEE / ADMIN (`stephaneroos@gmail.com`)
- [ ] Téléphone prêt : Bancontact + boîte mail (alias Gmail)
- [ ] Adresse démo : `stephaneroos+demo@gmail.com` (taper soigneusement)

### Pendant

- [ ] Tester la navigation avant que tout le monde arrive (flèches, plein écran)
- [ ] Vérifier que la présentation est bien lisible du fond de la salle
- [ ] Garder un rythme lent : une diapositive par minute environ
- [ ] Laisser du temps aux questions à la fin de chaque grande section

### Après

- [ ] Supprimer le compte démo (`stephaneroos+demo@gmail.com`) via Admin
- [ ] Supprimer l'événement de test
- [ ] Reporter les décisions dans `src/config/site.ts` → push master
- [ ] Mettre à jour le règlement `/utc/reglement` si validé
- [ ] Ajouter le lien Ultratiming dès réception
- [ ] Récupérer les suggestions et questions posées
- [ ] Mettre à jour la daily note du 2026-07-22 avec les retours clés

---

## Astuces de présentation

Quelques rappels pour une séance réussie, vu que l'audience a une aisance
numérique variable.

- **Pas de démo live au projecteur pour les points fragiles**. La démo de
  l'inscription / paiement peut se faire sur un écran individuel si un membre
  demande un détail. La présentation porte la promesse, la démo concrète se
  fait de près.
- **Prendre le temps d'expliquer chaque rôle avec des exemples**. « Si David est
  trésorier, il a le rôle COMITÉ avec la fonction Trésorerie. Il peut tout faire
  sur le site sauf changer les rôles des autres. »
- **Insister sur la réversibilité**. La plus grande crainte d'un public peu à
  l'aise est de « tout casser ». Rappeler que rien n'est définitif, tout est
  tracé, tout peut être corrigé.
- **Parler en avantages concrets**. Pas « la base de données stocke les
  cotisations », mais « on ne perdra plus le carnet des cotisations ».

---

## Après la présentation

Selon les retours, ajuster :

- le mode d'emploi (ajouter des captures, reformuler)
- la roadmap (prioriser les évolutions demandées)
- le planning de lancement public (alimentation du contenu, mentions légales)

Créer ensuite une note `retours-comite-2026-07-22.md` dans ce même dossier pour
garder trace des décisions et des retours.
