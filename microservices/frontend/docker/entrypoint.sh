#!/bin/sh

if [ "$NODE_ENV" = "development" ]; then
  ls | echo
  echo "Running in development mode: npm run dev"
  npm run dev
else
  echo "Running in production mode: npm run build"
  npm run build
  # Optionally keep the container alive or serve files with a simple server
  # For example, use `serve` package or run nginx here
  # tail -f /dev/null
fi
