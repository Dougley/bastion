FROM cloudflare/cloudflared as cloudflared
FROM mcr.microsoft.com/devcontainers/typescript-node:18 as base

COPY --from=cloudflared --chown=nonroot /usr/local/bin/cloudflared /usr/local/bin/