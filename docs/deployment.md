# Deployment

By default omp-deck is loopback-only with network access gated by something
else — Tailscale, an SSH tunnel, or a reverse proxy with its own auth. Since
0.7.0 it also ships an optional **access-token layer**
(`OMP_DECK_ACCESS_TOKEN`) that protects every `/api`, `/ws` and `/uploads`
request with a bearer token — use it for any public-ish binding, and
combine it with the network-level gates below for defense in depth.

Multi-machine deployments (a center deck on a VPS + omp agent hosts on your
other machines) are covered in [multi-machine.md](multi-machine.md).

## Patterns

- [Tailscale-gated (recommended)](#tailscale-gated-recommended)
- [SSH tunnel](#ssh-tunnel)
- [Access token](#access-token)
- [Docker](#docker)
- [Multi-machine](#multi-machine)
- [Hardening checklist](#hardening-checklist)

## Tailscale-gated (recommended)

Bind the deck to loopback. Tailscale Serve exposes it to your tailnet over
HTTPS with mTLS-style identity.

```sh
# Run the deck loopback-only — the default
OMP_DECK_HOST=127.0.0.1 OMP_DECK_PORT=8787 bun run start

# Then on the same host:
tailscale serve --bg --https=443 http://127.0.0.1:8787

# Open from any tailnet device — including your phone:
open https://<hostname>.<tailnet>.ts.net
```

Tailscale handles the TLS termination + identity check. Only devices on your
tailnet can reach the deck.

**Sharing externally** — use Tailscale Funnel:

```sh
tailscale funnel --bg --https=443 http://127.0.0.1:8787
```

Funnel exposes the URL to the public internet. Anyone with the link can
reach the deck. Set `OMP_DECK_ACCESS_TOKEN` (see
[Access token](#access-token)) before sharing a Funnel URL — without it the
deck is fully open to whoever has the link.

## SSH tunnel

If you don't run Tailscale on the host:

```sh
# On the deck host:
bun run start                                        # bound to 127.0.0.1:8787

# On your local box:
ssh -L 8787:127.0.0.1:8787 user@deck-host
# Then open http://localhost:8787 in your laptop browser
```

Stick it in `~/.ssh/config` for a persistent tunnel:

```
Host deck-host
  HostName <ip-or-hostname>
  User <user>
  LocalForward 8787 127.0.0.1:8787
```

## Access token

Since 0.7.0, setting `OMP_DECK_ACCESS_TOKEN` turns on bearer-token
authentication for every `/api`, `/ws` and `/uploads` request
(`/api/health` + `/api/version` stay open for liveness probes):

```sh
OMP_DECK_ACCESS_TOKEN="$(openssl rand -hex 32)" bun run start
```

The web client sends the token automatically once it is stored in
localStorage under `omp-deck:access-token` — set it from the browser console
(`localStorage.setItem('omp-deck:access-token', '<token>')`) or a tiny
bookmarklet. Until the token matches, the header indicator shows
"unauthorized" and API calls return `401 {"error":"unauthorized"}`. The
token is read on every request and every WebSocket connect, so a reload is
not required after setting it.

This layer is **not** a substitute for the network gates: it protects the
deck's own surface but adds no identity story (no login, no per-user
accounts). Put Tailscale/SSH in front for identity; use the token when the
deck must be reachable from more than one machine.

## Multi-machine

One center deck on a VPS + `omp-agent-host` extensions on each of your other
machines: session aggregation with machine labels, per-machine session
create/switch, remote env editing, and kanban task assignment to machines.
Full walkthrough (center systemd/Docker, host extension install, systemd
unit, security notes): **[multi-machine.md](multi-machine.md)**.

## Docker

A `Dockerfile` and `docker-compose.yml` ship in the repo root. The image
build does an end-to-end Bun build of the server + web bundle, then runs the
server in production mode (loopback by default).

```sh
docker build -t omp-deck .
docker run -d --name omp-deck \
  -p 127.0.0.1:8787:8787 \
  -v omp-deck-agent:/data/omp-agent \
  -v /srv/work:/workspace \
  -e OMP_AGENT_DIR=/data/omp-agent \
  -e OMP_DECK_DEFAULT_CWD=/workspace \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  omp-deck
```

Compose:

```sh
docker compose up -d
```

The compose file binds `127.0.0.1:8787` on the host and mounts a named volume
for omp's session+auth state. Sit Tailscale on top of the host port — same
recipe as above.

**Auth state**: the named volume `/data/omp-agent` is critical. Without it,
every container restart starts from a blank `~/.omp/agent` and you'll be asked
to re-authenticate.

## Production knobs worth setting

```sh
OMP_DECK_DB_PATH=/var/lib/omp-deck/deck.db    # outside the container fs
OMP_DECK_DATA_DIR=/var/lib/omp-deck           # managed .env + audit + bridge db
OMP_AGENT_DIR=/var/lib/omp/agent              # SDK session + auth
OMP_DECK_DEFAULT_CWD=/workspace               # mount your code here
OMP_DECK_ACCESS_TOKEN=<openssl rand -hex 32>  # bearer gate for /api + /ws
OMP_DECK_MACHINES_FILE=/var/lib/omp-deck/machines.json  # remote hosts (default)
LOG_LEVEL=warn                                # quieter in steady state
```

## Hardening checklist

Before exposing the deck on a network anyone else can reach:

- [ ] `OMP_DECK_HOST=127.0.0.1` (default). Confirm with `ss -tlnp` or `netstat`.
- [ ] Front it with Tailscale Serve, an SSH tunnel, or a reverse proxy that
      enforces auth. Never bind `0.0.0.0` without one.
- [ ] If the deck is reachable from more than one machine, set
      `OMP_DECK_ACCESS_TOKEN` (and set it in the browser's localStorage —
      the indicator shows "unauthorized" until it matches).
- [ ] Provider API keys live in env vars (via shell profile or the deck's
      managed `.env`) — never committed in the repo or shipped in an image.
- [ ] The data dir (`OMP_DECK_DATA_DIR`) is user-only readable. `chmod 700` on
      Unix; Windows `%LOCALAPPDATA%` is per-user by default.
- [ ] The audit log (`env-audit.log`) is rotated or archived if the deck runs
      for a long time. Today it grows unbounded.
- [ ] If Telegram bridge is in use, `TELEGRAM_ALLOWED_USERS` is set. The
      bridge refuses to start without it.
- [ ] If exposing via Funnel, you accept that anyone with the URL can drive
      the chat. Add a reverse-proxy auth layer for any shared deployment.

## Updating

The deck embeds the omp SDK as a workspace dep. To pull a newer SDK:

```sh
bun update @oh-my-pi/pi-coding-agent
bun run typecheck
bun run build
```

Then restart the deck (Settings → Env → Restart, or kill+respawn).
