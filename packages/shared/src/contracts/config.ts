let config = {
  treasuryContract: "xion1fprvv0mmwz59u7ex6megtsku0h0ty3n3tyak55wc2u4e68zn78tq22wyf6",
  marketplaceContract: "",
  nftContract: "",
  reclaimContract:
    "xion1qf8jtznwf0tykpg7e65gwafwp47rwxl4x2g2kldvv357s6frcjlsh2m24e",
  usdcDenom: "ibc/usdc",
  listingDenom: "uxion",
  xionRpc: "https://rpc.xion-testnet-2.burnt.com:443",
  xionRest: "https://api.xion-testnet-2.burnt.com",
};

export function setContractConfig(c: Partial<typeof config>) {
  Object.assign(config, c);
}

export function getContractConfig() {
  return config;
}
