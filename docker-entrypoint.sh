#!/bin/sh

echo "Running Prisma migrations..."
if [ -f ./node_modules/prisma/build/index.js ]; then
  node ./node_modules/prisma/build/index.js migrate deploy || echo "Warning: migration failed, continuing startup"
else
  echo "Prisma CLI not found, skipping migrations"
fi

echo "Starting Next.js server..."
exec node server.js
