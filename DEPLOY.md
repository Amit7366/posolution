# Deploy — Client (`posulation.com`)
Repo: https://github.com/Amit7366/posolution

## VPS layout
- App: `/opt/posulation/client` (git clone of this repo)
- Container: `posulation-client` → `127.0.0.1:3000`
- Nginx: `posulation.com` / `www` → `:3000`

## GitHub secrets
| Secret | Example |
|--------|---------|
| `VPS_HOST` | `37.44.244.251` |
| `VPS_USERNAME` | `root` |
| `VPS_KEY` | private SSH key (full PEM) |

CI builds **on the VPS** (`docker compose up -d --build`) after `git pull`.
