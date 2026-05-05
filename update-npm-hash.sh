#!/usr/bin/env bash
hash=$(nix-shell -p prefetch-npm-deps --run "prefetch-npm-deps package-lock.json" 2>/dev/null)
echo "New hash: $hash"
sed -i "s|hash = \"[^\"]*\"|hash = \"$hash\"|" package.nix