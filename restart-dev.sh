#!/bin/bash
echo "Stopping any running processes..."
pkill -f "next dev" || true
echo "Cleaning build artifacts..."
rm -rf .next
echo "Reinstalling dependencies..."
npm install
echo "Starting dev server..."
npm run dev
