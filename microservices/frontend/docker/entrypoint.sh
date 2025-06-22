#!/bin/sh

if [ "$NODE_ENV" = "development" ]; then
  npm run build
  npm run dev
else
  # npm run build --watch
  npm run build
  echo "✅ Build complete. Exiting normally."
  exit 0
fi
