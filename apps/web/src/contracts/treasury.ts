/**
 * XION Treasury contract message builders.
 * The treasury enables gasless transactions for users.
 * Payments are handled in USDC via Crossmint.
 */

const TREASURY_CONTRACT = process.env.NEXT_PUBLIC_TREASURY_CONTRACT ?? "";

// USDC contract on XION (ibc denom or cw20 address)
const USDC_DENOM = process.env.NEXT_PUBLIC_USDC_DENOM ?? "ibc/usdc";

export interface TreasuryGrantMsg {
  grant: {
    grantee: string;
    authorization: {
      type_url: string;
      value: string;
    };
    expiration?: string;
  };
}

export function buildTreasuryGrant(grantee: string): TreasuryGrantMsg {
  return {
    grant: {
      grantee,
      authorization: {
        type_url: "/cosmos.authz.v1beta1.GenericAuthorization",
        value: btoa(
          JSON.stringify({
            msg: "/cosmwasm.wasm.v1.MsgExecuteContract",
          }),
        ),
      },
    },
  };
}

export function getTreasuryConfig() {
  return {
    treasury: TREASURY_CONTRACT,
    treasuryConfig: {
      treasury_address: TREASURY_CONTRACT,
    },
  };
}

/**
 * Build a subscribe message to upgrade to premium tier.
 * Price: 4.99 USDC/month
 */
export function buildSubscribeMsg(
  subscriber: string,
  months: number = 1,
) {
  return {
    contractAddress: TREASURY_CONTRACT,
    msg: {
      subscribe: {
        subscriber,
        months,
      },
    },
    funds: [
      {
        denom: USDC_DENOM,
        amount: String(months * 4_990_000), // 4.99 USDC per month (6 decimals)
      },
    ],
  };
}

export { TREASURY_CONTRACT, USDC_DENOM };
