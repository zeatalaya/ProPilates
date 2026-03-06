/**
 * XION Treasury contract message builders.
 * The treasury enables gasless transactions for users
 * via Abstraxion's account abstraction.
 */

const TREASURY_CONTRACT = process.env.NEXT_PUBLIC_TREASURY_CONTRACT ?? "";

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
    // Abstraxion treasury configuration for gasless txs
    treasuryConfig: {
      treasury_address: TREASURY_CONTRACT,
    },
  };
}

/**
 * Build a subscribe message to upgrade to premium tier
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
        denom: "uxion",
        amount: String(months * 5_000_000), // 5 XION per month
      },
    ],
  };
}
