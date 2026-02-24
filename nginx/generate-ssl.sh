#!/bin/bash
# Generate self-signed SSL certificate for development/internal use
# For production, replace with a real certificate from your CA or Let's Encrypt

mkdir -p ssl

openssl req -x509 -nodes -days 3650 -newkey rsa:4096 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=IL/ST=Tel Aviv/L=Tel Aviv/O=Giron Real Estate/OU=IT/CN=security.giron.co.il" \
  -addext "subjectAltName=DNS:security.giron.co.il,DNS:localhost,IP:127.0.0.1"

echo "SSL certificate generated in ./ssl/"
echo "key.pem and cert.pem are ready."
echo ""
echo "For production, replace these with certificates from:"
echo "  - Your corporate CA"
echo "  - Let's Encrypt (certbot)"
echo "  - A commercial SSL provider"
