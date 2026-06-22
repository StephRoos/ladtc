---
title: LADTC — Nextcloud club & galerie médias
date: 2026-06-16
tags: [ladtc, nextcloud, homelab, galerie, workflow]
type: reference
---

# LADTC — Nextcloud club & galerie médias

Référence du dispositif **contribution → curation → diffusion** des photos et
vidéos du club, 100 % auto-hébergé (indépendant de Google/YouTube).

## Principe

```
Membre  →  bouton « Partager vos photos & vidéos »  →  dépôt Nextcloud (Contributions)
                                                                │
Comité  →  trie dans Contributions  →  « Ajouter un lien »  →  Galerie du site (public)
```

- **Une seule source de vérité** : Nextcloud (le NAS) stocke les médias. Le site
  ne stocke que des **liens**, pas les fichiers.
- **Contrôle éditorial** : un dépôt de membre n'apparaît PAS automatiquement sur
  le site. Le comité choisit ce qui devient public.
- **Pas de comptes membres** : décision actée — le file-drop suffit (cf. daily
  2026-06-15). Lecture = galerie du site ; dépôt = file-drop (écriture seule).

## Pour un membre — déposer ses médias

1. Aller sur **ladtc.be → Galerie**.
2. Cliquer **« Partager vos photos & vidéos »**.
3. L'uploader Nextcloud s'ouvre → glisser-déposer photos/vidéos.
4. **Rester sur la page jusqu'à la fin de l'upload** (ne pas fermer l'onglet —
   un upload interrompu est perdu).
- Sans compte, sans voir les fichiers des autres, **gros fichiers OK**.

## Pour le comité — publier un média sur le site

1. Dans Nextcloud (**cloud.ladtc.be**, compte `admin`) → dossier **`Contributions`**.
2. Repérer le média à publier → **partage** → **« Share link »** → copier le lien
   `https://cloud.ladtc.be/s/…`.
3. Sur **ladtc.be → Admin → Galerie → « Ajouter un lien Nextcloud / YouTube »**
   → coller le lien + titre + (optionnel) album → **Enregistrer**.
4. Le site détecte **automatiquement** photo ou vidéo et l'affiche dans la galerie.
   - Vidéo → lecteur intégré (streaming) ; photo → image.

> Les liens YouTube/Vimeo « non répertorié » marchent aussi dans le même champ.

## Réglages admin (ladtc.be → Admin → Paramètres)

- **Lien de contribution des membres** (`site.contributionUrl`) : le lien de
  file-drop Nextcloud. Quand il est rempli, le bouton public apparaît sur la
  galerie ; vide = bouton masqué.
- **Sous-titres du site** : les sens de « la dtc » affichés au hasard.

## Infrastructure (technique — Stéphane)

- **Instance club** : `cloud.ladtc.be` — Nextcloud 34 (AIO ? non : **docker-compose
  manuel**) sur le **NAS Ugreen**, séparée de l'instance perso `cloud.anthemion.dev`.
- **Stack** : `nextcloud:apache` + `postgres:16` + `redis` + `cron`, dans
  `/volume1/docker/nextcloud-ladtc/` (volumes Docker sur `/volume1`, 3,7 To).
  Port local **8181**, exposé via le **tunnel Cloudflare** existant (hostname
  public `cloud.ladtc.be` → `192.168.129.21:8181`).
- **Accès NAS** : rebond `ssh homelab` → `ssh Steph@192.168.129.21` (clé).
  occ : `docker exec -u www-data nextcloud-ladtc-app-1 php occ <...>`.
- **Secrets** : mot de passe BDD dans `/volume1/docker/nextcloud-ladtc/.env`
  (chmod 600, sur le NAS uniquement). Mot de passe admin Nextcloud = chez Stéphane.
- **Config appliquée** : `overwritehost`/`overwriteprotocol`/`overwritecliurl` =
  cloud.ladtc.be ; `trusted_proxies` 172.16/12 ; `default_phone_region` BE ;
  `maintenance_window_start` 1 ; `background:cron`.

### Réglage important — taille des chunks (gros uploads)

`files max_chunk_size = 52428800` (50 Mo). **Pourquoi** : par défaut les chunks
faisaient 100 Mio, soit pile au-dessus de la limite **100 Mo de Cloudflare** →
les uploads > ~300 Mo cassaient (un chunk rejeté). 50 Mo passe sous la limite.
```
docker exec -u www-data nextcloud-ladtc-app-1 php occ config:app:set files max_chunk_size --value=52428800
```

## Côté site (code, repo `Projects/ladtc`)

- Galerie : albums d'événement, mode « Lien média » (YouTube/Vimeo + Nextcloud/NAS).
- Résolution Nextcloud : `/s/TOKEN` → `/public.php/dav/files/TOKEN` (WebDAV, range
  206). Type photo/vidéo détecté par sonde content-type côté serveur.
- CSP `media-src 'self' blob: https:` (sinon vidéos cross-origin bloquées).
- Fichiers clés : `src/lib/video-embed.ts`, `src/app/api/admin/gallery/route.ts`,
  `src/components/gallery/`, `src/components/admin/settings/`.

## Dépannage

- **« Je ne vois pas le dépôt d'un membre sur le site »** : normal — il est dans
  `Contributions`, à publier via « Ajouter un lien ».
- **Upload de gros fichier qui casse** : vérifier `max_chunk_size` (doit être 50 Mo,
  pas 100 Mio). Chunks orphelins dans `data/admin/uploads/` → nettoyage auto, ou
  `rmdir` du dossier temp vide.
- **Vidéo qui ne se lit pas** : vérifier la CSP `media-src` et que le lien est bien
  un partage `/s/…` (pas un lien d'album Photos `/apps/photos/public/…`).

## À faire / maintenance

- [ ] **Backup** de l'instance club (volumes Docker `/volume1/@docker` +
      `/volume1/docker/nextcloud-ladtc`) — actif partagé du club.
- [ ] **Rotation** du token tunnel Cloudflare (apparu en clair pendant la recon).
- [ ] Nettoyer le dossier orphelin `/volume1/nextcloud` (résidu UGOS, non utilisé).
- [ ] Activer le bouton public : créer le file-drop + coller dans Paramètres.

## Liens

- [[reunion-comite-2026-06-12]]
- [[ladtc]] — vue d'ensemble du projet
- Plan souveraineté : `02-Areas/homelab/google-exit-plan.md`
