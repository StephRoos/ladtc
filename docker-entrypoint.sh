#!/bin/sh

echo "Running Prisma migrations..."
if [ -f ./prisma-cli/node_modules/.bin/prisma ]; then
  ./prisma-cli/node_modules/.bin/prisma migrate deploy --schema ./prisma/schema.prisma || echo "Warning: migration failed, continuing startup"
else
  echo "Prisma CLI not found, skipping migrations"
fi

echo "Starting Next.js server..."
exec node server.js
