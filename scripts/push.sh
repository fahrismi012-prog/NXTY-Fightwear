#!/bin/bash
# Push script — prompts for token interactively, never stores to disk
set -e
cd "$(dirname "$0")/.."

# Ambil token dari env GH_TOKEN dulu, fallback ke prompt interaktif
if [ -n "$GH_TOKEN" ]; then
  echo "Menggunakan token dari env GH_TOKEN."
  TOKEN="$GH_TOKEN"
else
  echo -n "GitHub token: "
  read -s TOKEN
  echo
fi

if [ -z "$TOKEN" ]; then
  echo "Token kosong, batal." >&2
  exit 1
fi

# Use inline GIT_ASKPASS that echoes the token from current shell
export GIT_ASKPASS="$(mktemp)"
cat > "$GIT_ASKPASS" <<EOF
#!/bin/bash
if [ "\$1" = "Username for 'https://github.com':" ]; then
  echo "oauth2"
else
  echo "$TOKEN"
fi
EOF
chmod +x "$GIT_ASKPASS"
trap "rm -f '$GIT_ASKPASS'; unset TOKEN GH_TOKEN" EXIT

GIT_EDITOR=true git push origin feature/client-branding-v2
