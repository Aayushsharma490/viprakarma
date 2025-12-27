#!/bin/bash
# Render build script for astro-engine
# This script downloads Swiss Ephemeris data during deployment

echo "Installing dependencies..."
npm install

echo "Downloading Swiss Ephemeris library..."
if [ ! -d "swisseph-master" ]; then
  # Clone the Swiss Ephemeris repository
  git clone https://github.com/aloistr/swisseph.git swisseph-master
  echo "Swiss Ephemeris downloaded successfully"
else
  echo "Swiss Ephemeris already exists"
fi

echo "Build complete!"
