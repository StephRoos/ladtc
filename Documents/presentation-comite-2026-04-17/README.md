---
tags: [ladtc, presentation, comite]
date: 2026-04-14
event: presentation-comite-2026-04-17
---

# Présentation au comité LADTC — 17 avril 2026

Dossier préparatoire pour la présentation du nouveau site `ladtc.be` au comité du LADTC.

## Livrables

Trois fichiers dans ce dossier.

| Fichier | Usage |
|---|---|
| `mode-emploi-comite.html` | Manuel d'utilisation à imprimer et distribuer aux membres du comité. ~20 pages A4 couvrant toutes les tâches administratives, étape par étape. |
| `presentation.html` | Diaporama à projeter pendant la réunion. Reveal.js, ~40 diapositives pour une durée d'environ 30 minutes. |
| `README.md` | Ce fichier. Instructions d'utilisation et checklist jour J. |

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
4. Cliquer sur **Enregistrer**, choisir le nom `ladtc-mode-emploi-comite-2026-04-17.pdf`

### Impression papier

Ensuite ouvrir le PDF et imprimer autant d'exemplaires que de membres du comité. Recommandation : impression couleur recto-verso, agrafage coin haut-gauche.

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

1. Ouvrir `presentation.html?print-pdf` dans Chrome (obligatoire, Safari ne supporte pas l'export PDF Reveal.js) :
   ```
   open -a "Google Chrome" "presentation.html?print-pdf"
   ```
2. Attendre le chargement complet
3. `Cmd+P` → Destination « Enregistrer au format PDF » → Mise en page **Paysage** → Arrière-plans et graphiques cochés
4. Enregistrer sous `ladtc-presentation-comite-2026-04-17.pdf`

Ce PDF pourra être projeté depuis n'importe quelle application si Reveal.js ne fonctionne pas.

---

## Checklist jour J (vendredi 17 avril 2026)

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

### Pendant

- [ ] Tester la navigation avant que tout le monde arrive (flèches, plein écran)
- [ ] Vérifier que la présentation est bien lisible du fond de la salle
- [ ] Garder un rythme lent : une diapositive par minute environ
- [ ] Laisser du temps aux questions à la fin de chaque grande section

### Après

- [ ] Récupérer les suggestions et questions posées
- [ ] Noter les demandes d'évolution pour la roadmap
- [ ] Envoyer un email de remerciement avec le PDF du mode d'emploi en pièce jointe
- [ ] Mettre à jour la daily note du 2026-04-17 avec les retours clés

---

## Astuces de présentation

Quelques rappels pour une séance réussie, vu que l'audience a une aisance numérique nulle.

- **Pas de démo live au projecteur**. La promesse de la démo figure dans le diaporama, mais la démo elle-même peut se faire au fur et à mesure sur un écran individuel si un membre demande à voir un détail. Éviter la démo en direct en grand format qui peut planter.
- **Prendre le temps d'expliquer chaque rôle avec des exemples**. « Si Jean est trésorier, il a le rôle COMITÉ avec la fonction Trésorerie. Il peut tout faire sur le site sauf changer les rôles des autres. »
- **Insister sur la réversibilité**. La plus grande crainte d'un public peu à l'aise est de « tout casser ». Rappeler que rien n'est définitif, tout est tracé, tout peut être corrigé.
- **Parler en avantages concrets**. Pas « la base de données stocke les cotisations », mais « on ne perdra plus le carnet des cotisations ».

---

## Après la présentation

Selon les retours, ajuster :
- le mode d'emploi (ajouter des captures, reformuler)
- la roadmap (prioriser les évolutions demandées)
- le planning de déploiement (migration membres, comm officielle)

Créer ensuite une note `retours-comite-2026-04-17.md` dans ce même dossier pour garder trace.
