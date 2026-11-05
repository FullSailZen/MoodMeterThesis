#!/bin/bash
set -e

mkdir -p /etc/pki/tls/certs
mkdir -p /etc/pki/tls/private

aws secretsmanager get-secret-value \
    --secret-id moodmeter/cloudflare-origin \
    --region us-east-2 \
    --query SecretString \
    --output text \
    > /tmp/moodmeter-cloudflare-secret.json

python3 - <<'PY'
import base64
import json

with open(
    "/tmp/moodmeter-cloudflare-secret.json",
    "r",
    encoding="utf-8"
) as f:
    secret = json.load(f)

cert = base64.b64decode(secret["origin_cert_b64"])
key = base64.b64decode(secret["origin_key_b64"])

with open(
    "/etc/pki/tls/certs/moodmeter-origin.pem",
    "wb"
) as f:
    f.write(cert)

with open(
    "/etc/pki/tls/private/moodmeter-origin-key.pem",
    "wb"
) as f:
    f.write(key)
PY

rm -f /tmp/moodmeter-cloudflare-secret.json

chmod 644 /etc/pki/tls/certs/moodmeter-origin.pem
chmod 600 /etc/pki/tls/private/moodmeter-origin-key.pem