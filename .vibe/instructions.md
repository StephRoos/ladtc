# Instructions LADTC - Mistral Vibe

## Contexte
Tu travailles sur **LADTC Website** (https://ladtc.be), un site Next.js 16 full-stack pour un club de trail running.
**Projet critique** : utilise en production par ~70 membres. **Ne jamais casser le build ou l'auth.**

---

## Règles NON négociables (Critical Instructions)

- **Package Manager** : **pnpm UNIQUEMENT**. Jamais `npm` ou `yarn`.
- **TypeScript** : Types explicites OBLIGATOIRES. Pas de `any`.
- **Git** : Commits conventionnels (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- **Tests** : Toujours executer `pnpm test` apres un changement de logique metier.
- **Build** : Toujours executer `pnpm build` avant de commiter.
- **Auth** : NE JAMAIS modifier les tables BetterAuth (`User`, `Session`, `Account`, `Verification`) sans comprendre l'impact.
- **Database** : Toujours tester les migrations Prisma en local avant de pusher.
- **Deploiement** : **Jamais pusher directement sur `master`**. Toujours creer une branch.
- **Docker** : Ne pas modifier `docker-entrypoint.sh` sans backup et test local.

---

## Conventions (de CLAUDE.md)

### Langue
- **Français** pour docs/communications
- **Anglais** pour le code

### Code Style
- Composants fonctionnels UNIQUEMENT
- Noms de fichiers: kebab-case pour composants (`my-component.tsx`), PascalCase pour types
- Imports: relatifs (`../components/...`)

### Architecture
- **Frontend** : `src/app/` (App Router), `src/components/`
- **Backend** : `src/app/api/`, `src/lib/`
- **Database** : Prisma (`prisma/schema.prisma`)
- **Tests** : `src/__tests__/` (Vitest)

---

## Workflow

### Nouvelle feature
1. Lire spec dans `specs/01-mvp/` si existe
2. Creer branch: `git checkout -b feat/ma-fonctionnalite`
3. Utiliser `todo write` pour tracker etapes
4. Implemeter en suivant patterns existants
5. Tester: `pnpm test` + `pnpm build` + `pnpm lint`
6. Commiter avec message conventionnel

### Bug
1. Reproduire en local
2. Creer branch: `fix/description-du-bug`
3. Ecrire test qui reproduit le bug
4. Corriger et verifier que le test passe

### Modification DB
1. Modifier `prisma/schema.prisma`
2. Creer migration: `pnpm exec prisma migrate dev --name description`
3. Tester avec `pnpm exec prisma studio`
4. Verifier avec `pnpm dev`

---

## Outils

### Commandes pnpm
```bash
pnpm dev          # Demarrer serveur dev (port 3000)
pnpm build        # Build pour production
pnpm start        # Demarrer serveur production
pnpm lint         # ESLint
pnpm test         # Vitest
pnpm test:watch   # Vitest watch mode
pnpm db:seed      # Seeder DB
```

### Prisma
```bash
pnpm exec prisma studio    # UI DB
pnpm exec prisma migrate dev  # Creer migration
pnpm exec prisma migrate deploy  # Appliquer migrations (prod)
```

### Docker
```bash
docker-compose up -d   # Demarrer PostgreSQL
docker-compose down     # Arreter PostgreSQL
```

---

## Structure fichiers clés

### Auth (BetterAuth)
- Server config: `src/lib/auth.ts`
- Client config: `src/lib/auth-client.ts`
- Guard: `src/lib/auth-guard.ts`

### Prisma
- Client singleton: `src/lib/prisma.ts` (TOUJOURS utiliser celui-ci)
- Schema: `prisma/schema.prisma`

### API Routes
- Standard: `src/app/api/[resource]/route.ts`
- Avec ID: `src/app/api/[resource]/[id]/route.ts`
- Admin: `src/app/api/admin/[resource]/route.ts`

### Composants
- Communs: `src/components/common/`
- Cartes: `src/components/cards/`
- Formulaires: `src/components/forms/`
- Admin: `src/components/admin/`
- UI: `src/components/ui/`

---

## Patterns a respecter

### API Route standard
```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth.api.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await prisma.example.findMany();
  return NextResponse.json(data);
}
```

### Composant React
```typescript
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: Props) {
  return <Button onClick={onClick}>{title}</Button>;
}
```

---

## En cas de probleme

### Build echoue
1. Lire erreurs de `pnpm build`
2. Verifier types: `pnpm exec tsc --noEmit`

### Auth ne fonctionne plus
1. Verifier tables BetterAuth dans `pnpm exec prisma studio`
2. Ne pas modifier tables auth sans comprendre

### DB corrompue (local)
1. `docker-compose down`
2. `docker volume rm ladtc_pgdata`
3. `docker-compose up -d`
4. `pnpm db:seed`
