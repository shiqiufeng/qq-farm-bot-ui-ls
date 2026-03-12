#!/bin/sh
set -e

cd /app
pnpm build:web
cd core
node client.js
