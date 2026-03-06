import { getContractConfig } from "./config";

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
  const { treasuryContract } = getContractConfig();
  return {
    treasury: treasuryContract,
    treasuryConfig: {
      treasury_address: treasuryContract,
    },
  };
}

export function buildSubscribeMsg(subscriber: string, months: number = 1) {
  const { treasuryContract, usdcDenom } = getContractConfig();
  return {
    contractAddress: treasuryContract,
    msg: {
      subscribe: {
        subscriber,
        months,
      },
    },
    funds: [
      {
        denom: usdcDenom,
        amount: String(months * 4_990_000),
      },
    ],
  };
}
