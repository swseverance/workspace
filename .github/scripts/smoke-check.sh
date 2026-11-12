#!/usr/bin/env bash
# Fails unless the URL (after redirects) answers 2xx. App Hosting's startup
# probe only checks the port is open, so a revision that answers every
# request with an error still rolls out as healthy; this catches that.
# Retries cover the moment between rollout and the new revision serving.
set -euo pipefail

url="$1"
body="$(mktemp)"

if curl --silent --show-error --location --fail-with-body \
  --retry 5 --retry-delay 10 --retry-all-errors \
  --output "$body" --write-out '%{http_code} %{url_effective}\n' "$url"; then
  exit 0
fi

echo "Smoke check failed for $url. Start of the response:"
head -c 500 "$body"
echo
exit 1
