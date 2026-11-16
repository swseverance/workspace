FROM mcr.microsoft.com/devcontainers/typescript-node:24

# Pre-create the Claude config directory owned by the non-root user, so the
# named volume mounted there is writable without needing sudo at runtime.
RUN mkdir -p /home/node/.claude && chown -R node:node /home/node/.claude

# gitleaks, used by the pre-commit hook to block commits that contain secrets.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gitleaks \
    && rm -rf /var/lib/apt/lists/*
