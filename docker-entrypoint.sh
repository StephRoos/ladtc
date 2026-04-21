#!/bin/sh

echo "Running Prisma migrations..."
if [ -f ./prisma-cli/node_modules/.bin/prisma ]; then
  cd prisma-cli
  ./node_modules/.bin/prisma migrate deploy --schema ../prisma/schema.prisma 2>&1 || echo "Warning: migration failed, continuing startup"
  cd ..
else
  echo "Prisma CLI not found, skipping migrations"
fi

echo "Starting Next.js server..."
exec node server.js
