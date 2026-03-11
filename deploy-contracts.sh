#!/usr/bin/env bash
###############################################################################
# ProPilates — XION Testnet Contract Deployment Script
#
# Deploys CW721 (NFT) + cw721-marketplace-permissioned contracts on
# XION testnet-2 using pre-existing code IDs (no WASM upload needed).
#
# Prerequisites:
#   - xiond installed at ~/.local/bin/xiond  (already done)
#   - Deployer wallet "propilates-deployer" funded with uxion  (already done)
#
# Usage:
#   chmod +x deploy-contracts.sh
#   ./deploy-contracts.sh
#
# After running this script you still need to:
#   1. Add Treasury authorization grants at https://dev.testnet.burnt.com
#   2. Update Vercel environment variables
#   3. Redeploy
###############################################################################

set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────────────
XIOND="${HOME}/.local/bin/xiond"
NODE="https://rpc.xion-testnet-2.burnt.com:443"
CHAIN_ID="xion-testnet-2"
KEYRING="--keyring-backend test"
WALLET="propilates-deployer"
GAS_FLAGS="--gas auto --gas-adjustment 1.4 --gas-prices 0.001uxion"

# Pre-existing code IDs on XION testnet-2
CW721_CODE_ID=522           # cw721-base v0.19
MARKETPLACE_CODE_ID=1879    # XION marketplace contract

# Your existing Treasury contract
TREASURY="xion13ls6nwtr265rw3920auznvatw86g7ppjgvjww4zyhchdkrgp95mqlt8dzp"

# Payment denom — use uxion on testnet (IBC USDC may not be routed)
DENOM="uxion"

# Path to .env.local
ENV_FILE="$(dirname "$0")/apps/web/.env.local"

# ── Helpers ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

info()    { echo -e "${CYAN}ℹ ${NC}$*"; }
success() { echo -e "${GREEN}✓ ${NC}$*"; }
warn()    { echo -e "${YELLOW}⚠ ${NC}$*"; }
fail()    { echo -e "${RED}✗ ${NC}$*"; exit 1; }

# Extract contract address from tx result
extract_contract_addr() {
  local TX_HASH="$1"
  sleep 6  # wait for tx to be indexed
  local RESULT
  RESULT=$("$XIOND" query tx "$TX_HASH" --node "$NODE" -o json 2>&1) || {
    warn "Could not query tx $TX_HASH — retrying in 10s..."
    sleep 10
    RESULT=$("$XIOND" query tx "$TX_HASH" --node "$NODE" -o json 2>&1) || fail "Failed to query tx: $TX_HASH"
  }

  # Look for _contract_address in events
  echo "$RESULT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for log in data.get('logs', [data]):
    for event in log.get('events', []):
        if event['type'] == 'instantiate':
            for attr in event['attributes']:
                if attr['key'] == '_contract_address':
                    print(attr['value'])
                    sys.exit(0)
# Fallback: search in raw events
for event in data.get('events', []):
    if event['type'] == 'instantiate':
        for attr in event['attributes']:
            if attr['key'] == '_contract_address':
                print(attr['value'])
                sys.exit(0)
print('NOT_FOUND')
" 2>/dev/null || echo "NOT_FOUND"
}

# ── Preflight Checks ───────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ProPilates — XION Testnet Contract Deployment         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check xiond
[ -x "$XIOND" ] || fail "xiond not found at $XIOND"
info "xiond: $($XIOND version 2>&1 || echo 'installed')"

# Get deployer address
DEPLOYER=$("$XIOND" keys show "$WALLET" $KEYRING -a 2>/dev/null) || fail "Wallet '$WALLET' not found. Run: $XIOND keys add $WALLET $KEYRING"
info "Deployer: $DEPLOYER"

# Check balance
BALANCE=$("$XIOND" query bank balances "$DEPLOYER" --node "$NODE" -o json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
for coin in data.get('balances', []):
    if coin['denom'] == 'uxion':
        print(coin['amount'])
        sys.exit(0)
print('0')
" 2>/dev/null || echo "0")

info "Balance: ${BALANCE} uxion"
[ "$BALANCE" -gt 500000 ] || fail "Insufficient balance. Need > 0.5 XION. Fund at https://faucet.xion.burnt.com"

echo ""
info "Treasury: $TREASURY"
info "CW721 code ID: $CW721_CODE_ID"
info "Marketplace code ID: $MARKETPLACE_CODE_ID"
info "Payment denom: $DENOM"
echo ""

# ── Step 1: Instantiate CW721 Base (NFT Contract) ──────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Step 1/4: Instantiating CW721 NFT contract (code $CW721_CODE_ID)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CW721_INIT_MSG=$(cat <<'ENDJSON'
{
  "name": "ProPilates Class NFTs",
  "symbol": "PPCLASS",
  "minter": "DEPLOYER_PLACEHOLDER"
}
ENDJSON
)
CW721_INIT_MSG="${CW721_INIT_MSG//DEPLOYER_PLACEHOLDER/$DEPLOYER}"

echo "  Init message: $CW721_INIT_MSG"
echo ""

CW721_TX=$("$XIOND" tx wasm instantiate "$CW721_CODE_ID" "$CW721_INIT_MSG" \
  --label "propilates-nft" \
  --admin "$DEPLOYER" \
  --from "$WALLET" $KEYRING \
  --chain-id "$CHAIN_ID" \
  --node "$NODE" \
  $GAS_FLAGS \
  -o json -y 2>&1)

CW721_TX_HASH=$(echo "$CW721_TX" | grep -o '"txhash":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$CW721_TX_HASH" ] || fail "CW721 instantiate failed:\n$CW721_TX"

info "TX Hash: $CW721_TX_HASH"
info "Waiting for confirmation..."

NFT_CONTRACT=$(extract_contract_addr "$CW721_TX_HASH")
[ "$NFT_CONTRACT" != "NOT_FOUND" ] || fail "Could not extract CW721 contract address from tx $CW721_TX_HASH"

success "CW721 NFT Contract: $NFT_CONTRACT"
echo ""

# ── Step 2: Instantiate Marketplace ─────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Step 2/4: Instantiating Marketplace contract (code $MARKETPLACE_CODE_ID)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# The xion_nft_marketplace contract init expects a `config` object:
#   manager: admin address for marketplace management
#   fee_recipient: address that receives marketplace fees
#   sale_approvals: whether sales need approval (false = permissionless)
#   fee_bps: marketplace fee in basis points (200 = 2%)
#   listing_denom: payment denom for trades
MARKETPLACE_INIT_MSG=$(cat <<ENDJSON
{
  "config": {
    "manager": "$DEPLOYER",
    "fee_recipient": "$DEPLOYER",
    "sale_approvals": false,
    "fee_bps": 200,
    "listing_denom": "$DENOM"
  }
}
ENDJSON
)

echo "  Init message: $MARKETPLACE_INIT_MSG"
echo ""

MARKET_TX=$("$XIOND" tx wasm instantiate "$MARKETPLACE_CODE_ID" "$MARKETPLACE_INIT_MSG" \
  --label "propilates-marketplace" \
  --admin "$DEPLOYER" \
  --from "$WALLET" $KEYRING \
  --chain-id "$CHAIN_ID" \
  --node "$NODE" \
  $GAS_FLAGS \
  -o json -y 2>&1)

MARKET_TX_HASH=$(echo "$MARKET_TX" | grep -o '"txhash":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$MARKET_TX_HASH" ] || fail "Marketplace instantiate failed:\n$MARKET_TX"

info "TX Hash: $MARKET_TX_HASH"
info "Waiting for confirmation..."

MARKETPLACE_CONTRACT=$(extract_contract_addr "$MARKET_TX_HASH")
[ "$MARKETPLACE_CONTRACT" != "NOT_FOUND" ] || fail "Could not extract Marketplace contract address from tx $MARKET_TX_HASH"

success "Marketplace Contract: $MARKETPLACE_CONTRACT"
echo ""

# ── Step 3: Verify contracts ────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Step 3/4: Verifying deployed contracts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verify CW721
CW721_INFO=$("$XIOND" query wasm contract "$NFT_CONTRACT" --node "$NODE" -o json 2>&1) && {
  CW721_CODE=$(echo "$CW721_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['contract_info']['code_id'])" 2>/dev/null || echo "?")
  success "CW721 verified — code_id: $CW721_CODE"
} || warn "Could not verify CW721 contract"

# Verify Marketplace
MARKET_INFO=$("$XIOND" query wasm contract "$MARKETPLACE_CONTRACT" --node "$NODE" -o json 2>&1) && {
  MARKET_CODE=$(echo "$MARKET_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['contract_info']['code_id'])" 2>/dev/null || echo "?")
  success "Marketplace verified — code_id: $MARKET_CODE"
} || warn "Could not verify Marketplace contract"

# Query marketplace config
info "Querying marketplace config..."
"$XIOND" query wasm contract-state smart "$MARKETPLACE_CONTRACT" '{"config":{}}' --node "$NODE" -o json 2>&1 | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    config = data.get('data', {})
    print(f\"  Manager:       {config.get('manager', '?')}\")
    print(f\"  Fee Recipient: {config.get('fee_recipient', '?')}\")
    print(f\"  Fee BPS:       {config.get('fee_bps', '?')} (basis points)\")
    print(f\"  Listing Denom: {config.get('listing_denom', '?')}\")
    print(f\"  Sale Approvals: {config.get('sale_approvals', '?')}\")
except:
    print('  (could not parse config)')
" 2>/dev/null || warn "Could not query marketplace config"

echo ""

# ── Step 4: Update .env.local ───────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Step 4/4: Updating .env.local with contract addresses..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$ENV_FILE" ]; then
  # Update NEXT_PUBLIC_NFT_CONTRACT
  if grep -q "^NEXT_PUBLIC_NFT_CONTRACT=" "$ENV_FILE"; then
    sed -i '' "s|^NEXT_PUBLIC_NFT_CONTRACT=.*|NEXT_PUBLIC_NFT_CONTRACT=$NFT_CONTRACT|" "$ENV_FILE"
    success "Updated NEXT_PUBLIC_NFT_CONTRACT in .env.local"
  else
    echo "NEXT_PUBLIC_NFT_CONTRACT=$NFT_CONTRACT" >> "$ENV_FILE"
    success "Added NEXT_PUBLIC_NFT_CONTRACT to .env.local"
  fi

  # Update NEXT_PUBLIC_MARKETPLACE_CONTRACT
  if grep -q "^NEXT_PUBLIC_MARKETPLACE_CONTRACT=" "$ENV_FILE"; then
    sed -i '' "s|^NEXT_PUBLIC_MARKETPLACE_CONTRACT=.*|NEXT_PUBLIC_MARKETPLACE_CONTRACT=$MARKETPLACE_CONTRACT|" "$ENV_FILE"
    success "Updated NEXT_PUBLIC_MARKETPLACE_CONTRACT in .env.local"
  else
    echo "NEXT_PUBLIC_MARKETPLACE_CONTRACT=$MARKETPLACE_CONTRACT" >> "$ENV_FILE"
    success "Added NEXT_PUBLIC_MARKETPLACE_CONTRACT to .env.local"
  fi

  # Update USDC denom to uxion for testnet
  if grep -q "^NEXT_PUBLIC_USDC_DENOM=" "$ENV_FILE"; then
    sed -i '' "s|^NEXT_PUBLIC_USDC_DENOM=.*|NEXT_PUBLIC_USDC_DENOM=$DENOM|" "$ENV_FILE"
    success "Updated NEXT_PUBLIC_USDC_DENOM to $DENOM (testnet native)"
  fi
else
  warn ".env.local not found at $ENV_FILE — update manually"
fi

echo ""

# ── Summary ─────────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  DEPLOYMENT COMPLETE                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}NFT Contract:${NC}         $NFT_CONTRACT"
echo -e "${GREEN}Marketplace Contract:${NC} $MARKETPLACE_CONTRACT"
echo -e "${GREEN}Deployer (minter):${NC}    $DEPLOYER"
echo -e "${GREEN}Treasury:${NC}             $TREASURY"
echo -e "${GREEN}Payment Denom:${NC}        $DENOM"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}REMAINING MANUAL STEPS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ADD TREASURY AUTHORIZATION GRANTS"
echo "   Open: https://dev.testnet.burnt.com/treasury/$TREASURY"
echo "   Add ContractExecutionAuthorization grants for:"
echo ""
echo "   Grant A — NFT Contract (mint, approve, transfer):"
echo "     Type:     MsgExecuteContract"
echo "     Contract: $NFT_CONTRACT"
echo ""
echo "   Grant B — Marketplace Contract (list_item, buy_item, cancel_listing):"
echo "     Type:     MsgExecuteContract"
echo "     Contract: $MARKETPLACE_CONTRACT"
echo ""
echo "2. ADD VERCEL ENVIRONMENT VARIABLES"
echo "   Go to: https://vercel.com → ProPilates → Settings → Environment Variables"
echo "   Add:"
echo "     NEXT_PUBLIC_NFT_CONTRACT=$NFT_CONTRACT"
echo "     NEXT_PUBLIC_MARKETPLACE_CONTRACT=$MARKETPLACE_CONTRACT"
echo "     NEXT_PUBLIC_USDC_DENOM=$DENOM"
echo ""
echo "3. REDEPLOY"
echo "   cd $(dirname "$0") && git add -A && git commit -m 'chore: set deployed contract addresses' && git push"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}NOTE ON MINTING:${NC}"
echo "  The CW721 minter is set to the deployer wallet."
echo "  For the marketplace listing flow (mint → approve → swap),"
echo "  users need minting permission. Options:"
echo "  a) Create a /api/marketplace/mint server endpoint that mints"
echo "     via the deployer key (recommended for testnet)"
echo "  b) Transfer minter to a permissive proxy contract"
echo "  c) Use XION's Asset Contract (code ID 1878) instead"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
