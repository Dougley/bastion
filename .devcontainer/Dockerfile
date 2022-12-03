FROM mcr.microsoft.com/devcontainers/typescript-node:18 as base

# Install node.js v18.3
# We do this to prevent some weirdness with webcrypto and miniflare
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install 18.3 --default"

# Install ngrok
RUN wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz \
    && tar xvzf ./ngrok-v3-stable-linux-amd64.tgz -C /usr/local/bin \
    && rm ./ngrok-v3-stable-linux-amd64.tgz