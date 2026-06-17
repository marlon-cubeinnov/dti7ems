#!/usr/bin/env bash
# =============================================================================
# DTI Region 7 EMS — Production Deploy Script
# Usage: ./scripts/deploy.sh [--first-run]
#
# Prerequisites (local):
#   - SSH key access to the server (ssh-copy-id root@<host> if not yet done)
#   - rsync installed locally
#
# Prerequisites (server, first run only):
#   - Create /opt/dti-ems/services/identity-service/.env
#   - Create /opt/dti-ems/services/event-service/.env
#   - Create /opt/dti-ems/services/notification-service/.env
#   - Create /opt/dti-ems/.env.prod (POSTGRES_PASSWORD=... REDIS_PASSWORD=...)
#   See .env.example and services/*/.env.example for required variables.
# =============================================================================
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
REMOTE_HOST="109.123.236.9"
REMOTE_PORT="22"
REMOTE_USER="root"
REMOTE_DIR="/opt/dti-ems"
SSH_KEY="${HOME}/.ssh/dti-ems-deploy"
SSH="ssh -i ${SSH_KEY} -p ${REMOTE_PORT} -o StrictHostKeyChecking=accept-new ${REMOTE_USER}@${REMOTE_HOST}"
FIRST_RUN="${1:-}"

log()  { echo "[deploy] $*"; }
fail() { echo "[deploy] ERROR: $*" >&2; exit 1; }

# ── Preflight checks ─────────────────────────────────────────────────────────
log "Checking SSH connectivity..."
$SSH "echo 'SSH OK'" || fail "Cannot reach ${REMOTE_HOST}. Set up SSH key access first:
  ssh-keygen -t ed25519 -C 'ems-deploy'
  ssh-copy-id -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST}"

log "Checking required .env files on server..."
$SSH "
  missing=()
  [[ -f ${REMOTE_DIR}/services/identity-service/.env     ]] || missing+=(\"services/identity-service/.env\")
  [[ -f ${REMOTE_DIR}/services/event-service/.env        ]] || missing+=(\"services/event-service/.env\")
  [[ -f ${REMOTE_DIR}/services/notification-service/.env ]] || missing+=(\"services/notification-service/.env\")
  [[ -f ${REMOTE_DIR}/.env.prod                          ]] || missing+=(\"${REMOTE_DIR}/.env.prod\")
  if [[ \${#missing[@]} -gt 0 ]]; then
    echo ''
    echo '  Missing .env files on server:'
    for f in \"\${missing[@]}\"; do echo \"    ${REMOTE_DIR}/\$f\"; done
    echo ''
    echo '  Create them from .env.example before deploying.'
    echo '  .env.prod needs: POSTGRES_PASSWORD=<secret> POSTGRES_USER=dti_ems POSTGRES_DB=dti_ems'
    exit 1
  fi
"

# ── Sync source ───────────────────────────────────────────────────────────────
log "Syncing source to ${REMOTE_HOST}:${REMOTE_DIR} ..."
rsync -az --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='**/dist' \
  --exclude='.env.prod' \
  --exclude='**/.env' \
  --exclude='**/.env.local' \
  --exclude='**/tsconfig.tsbuildinfo' \
  --exclude='backups' \
  --exclude='docs' \
  --exclude='tests' \
  -e "ssh -i ${SSH_KEY} -p ${REMOTE_PORT}" \
  "$(dirname "$0")/../" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

# ── Remote setup ─────────────────────────────────────────────────────────────
log "Running remote setup on ${REMOTE_HOST} ..."
$SSH "bash -s" << 'REMOTE'
set -euo pipefail
DEPLOY_DIR="/opt/dti-ems"
LOG_DIR="/var/log/dti-ems"
NODE_MAJOR=22

log()  { echo "[remote] $*"; }

# ── Tools ────────────────────────────────────────────────────────────────────
install_node_if_needed() {
  if ! command -v node &>/dev/null || [[ "$(node -e 'process.stdout.write(process.version.split(\".\")[0].slice(1))')" -lt "$NODE_MAJOR" ]]; then
    log "Installing Node.js ${NODE_MAJOR}..."
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    apt-get install -y nodejs
  else
    log "Node.js $(node --version) already installed."
  fi
}

install_pnpm_if_needed() {
  if ! command -v pnpm &>/dev/null; then
    log "Installing pnpm..."
    npm install -g pnpm@latest
  else
    log "pnpm $(pnpm --version) already installed."
  fi
}

install_pm2_if_needed() {
  if ! command -v pm2 &>/dev/null; then
    log "Installing PM2..."
    npm install -g pm2
    pm2 startup systemd -u root --hp /root | tail -1 | bash || true
  else
    log "PM2 $(pm2 --version) already installed."
  fi
}

install_docker_if_needed() {
  if ! command -v docker &>/dev/null; then
    log "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
  else
    log "Docker $(docker --version) already installed."
  fi
}

install_nginx_if_needed() {
  if ! command -v nginx &>/dev/null; then
    log "Installing nginx..."
    apt-get update -qq && apt-get install -y nginx
  else
    log "nginx $(nginx -v 2>&1) already installed."
  fi
}

install_node_if_needed
install_pnpm_if_needed
install_pm2_if_needed
install_docker_if_needed
install_nginx_if_needed

# ── Log directory ─────────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR"

# ── Install dependencies ──────────────────────────────────────────────────────
log "Installing npm dependencies..."
cd "$DEPLOY_DIR"
pnpm install --no-frozen-lockfile

# ── Build shared packages ─────────────────────────────────────────────────────
log "Building shared packages..."
pnpm --filter @dti-ems/shared-errors build 2>/dev/null || true
pnpm --filter @dti-ems/shared-types build 2>/dev/null || true

# ── Generate Prisma clients ───────────────────────────────────────────────────
log "Generating Prisma clients..."
cd "$DEPLOY_DIR/services/identity-service"
npx prisma generate

cd "$DEPLOY_DIR/services/event-service"
npx prisma generate

# ── Build services ────────────────────────────────────────────────────────────
log "Building identity-service..."
cd "$DEPLOY_DIR/services/identity-service"
pnpm run build

log "Building event-service..."
cd "$DEPLOY_DIR/services/event-service"
pnpm run build

log "Building notification-service..."
cd "$DEPLOY_DIR/services/notification-service"
pnpm run build

# ── Build frontends ───────────────────────────────────────────────────────────
log "Building web-public..."
cd "$DEPLOY_DIR/apps/web-public"
pnpm run build

log "Building web-admin..."
cd "$DEPLOY_DIR/apps/web-admin"
pnpm run build

# ── Infrastructure (Docker Compose) ──────────────────────────────────────────
log "Starting infrastructure containers..."
cd "$DEPLOY_DIR"
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Wait for postgres to be healthy before running migrations
log "Waiting for postgres to be healthy..."
for i in $(seq 1 30); do
  if docker exec dti_ems_postgres pg_isready -U dti_ems -d dti_ems 2>/dev/null; then
    break
  fi
  echo "  ... waiting ($i/30)"
  sleep 3
done

# ── Database migrations ───────────────────────────────────────────────────────
log "Running identity-service migrations..."
cd "$DEPLOY_DIR/services/identity-service"
npx prisma migrate deploy

log "Running event-service migrations..."
cd "$DEPLOY_DIR/services/event-service"
npx prisma migrate deploy

# ── Nginx ─────────────────────────────────────────────────────────────────────
log "Updating nginx config..."
cp "$DEPLOY_DIR/infra/nginx/production.conf" /etc/nginx/sites-available/dti-ems
ln -sf /etc/nginx/sites-available/dti-ems /etc/nginx/sites-enabled/dti-ems
# Remove the default site to avoid port 80 conflicts
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ── PM2 ───────────────────────────────────────────────────────────────────────
log "Starting/reloading PM2 processes..."
cd "$DEPLOY_DIR"
if pm2 list | grep -q "identity-service"; then
  pm2 reload ecosystem.config.cjs --env production
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save

log "Deployment complete."
log ""
log "  web-public  →  http://109.123.236.9/"
log "  web-admin   →  http://109.123.236.9:8086/"
log ""
log "  pm2 status:      pm2 list"
log "  service logs:    pm2 logs <service-name>"
log "  infra status:    docker compose -f /opt/dti-ems/docker-compose.prod.yml ps"
REMOTE

log ""
log "Deploy finished successfully."
