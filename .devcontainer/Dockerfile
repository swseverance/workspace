FROM mcr.microsoft.com/devcontainers/typescript-node:24

# Pre-create the Claude config directory owned by the non-root user, so the
# named volume mounted there is writable without needing sudo at runtime.
RUN mkdir -p /home/node/.claude && chown -R node:node /home/node/.claude

# gitleaks, used by the pre-commit hook to block commits that contain secrets.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gitleaks \
    && rm -rf /var/lib/apt/lists/*

# rtk (Rust Token Killer), used by the Claude Code Bash hook. Pinned to the
# version on the Mac and verified against the release's published checksum.
# After the first build, run `rtk init -g` once in the container: the hook it
# writes lives in the claude-code-config volume and survives rebuilds.
ARG RTK_VERSION=1.2.0
RUN set -eu; \
    case "$(dpkg --print-architecture)" in \
      amd64) arch=x86_64;  sum=70fee7b4a548c43dde94c77e2335550981b0bc2fb013691d8c8109b5bd0eda37 ;; \
      arm64) arch=aarch64; sum=f91a06e94e5fad7dfa87946c811a4bcbc500e6da119fd47033f2a8940bf64f93 ;; \
      *) echo "unsupported architecture" >&2; exit 1 ;; \
    esac; \
    file="rtk-${arch}-unknown-linux-musl.tar.gz"; \
    curl -fsSL -o "/tmp/${file}" "https://github.com/rtk-ai/rtk/releases/download/v${RTK_VERSION}/${file}"; \
    echo "${sum}  /tmp/${file}" | sha256sum -c -; \
    tar -xzf "/tmp/${file}" -C /tmp; \
    install -m 0755 "$(find /tmp -maxdepth 2 -type f -name rtk | head -1)" /usr/local/bin/rtk; \
    rm -rf "/tmp/${file}" /tmp/rtk*; \
    rtk --version
