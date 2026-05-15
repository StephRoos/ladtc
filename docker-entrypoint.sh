#!/bin/sh
set -eu

echo "Running Prisma migrations..."
PRISMA_BIN="./prisma-cli/node_modules/.bin/prisma"

if [ ! -x "$PRISMA_BIN" ]; then
  echo "ERROR: Prisma CLI not found at $PRISMA_BIN" >&2
  exit 1
fi

# Expose prisma-cli's node_modules so /app/prisma.config.ts can import "prisma/config".
# The standalone Next.js node_modules at /app/node_modules does not include prisma.
export NODE_PATH="/app/prisma-cli/node_modules"
"$PRISMA_BIN" migrate deploy --schema ./prisma/schema.prisma

echo "Starting Next.js server..."
exec node server.js
