FROM cloudflare/cloudflared as cloudflared
FROM mcr.microsoft.com/devcontainers/typescript-node:18 as base

# Install node.js v18.3
# We do this to prevent some weirdness with webcrypto and miniflare
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install 18.3 --default"

COPY --from=cloudflared --chown=nonroot /usr/local/bin/cloudflared /usr/local/bin/