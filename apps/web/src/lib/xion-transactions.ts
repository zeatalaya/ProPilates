/**
 * XION Transaction Helper
 *
 * Submits transactions to the XION blockchain via the Abstraxion OAuth2 API.
 * Uses the OAuth access token to authenticate and submit messages.
 *
 * Docs: https://docs.burnt.com/xion/developers/getting-started-advanced/your-first-dapp/build-oauth2-app-with-xion-auth
 */

const OAUTH3_SERVER =
  process.env.NEXT_PUBLIC_OAUTH3_SERVER ?? "https://oauth2.testnet.burnt.com";

interface CosmosMsg {
  typeUrl: string;
  value: Record<string, unknown>;
}

interface TransactionResult {
  transactionHash: string;
  code: number;
  gasUsed: string;
  gasWanted: string;
}

/**
 * Submit a transaction to the XION blockchain via Abstraxion OAuth2 API.
 *
 * @param accessToken - OAuth2 access token with xion:transactions:submit scope
 * @param messages - Array of Cosmos SDK messages to execute
 * @param memo - Optional transaction memo
 */
export async function submitTransaction(
  accessToken: string,
  messages: CosmosMsg[],
  memo?: string,
): Promise<TransactionResult> {
  const res = await fetch(`${OAUTH3_SERVER}/api/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      memo: memo ?? "",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Transaction submission failed: ${error}`);
  }

  return res.json();
}

/**
 * Build a MsgSend transaction for USDC transfer.
 */
export function buildSendMsg(
  fromAddress: string,
  toAddress: string,
  amount: string,
  denom: string = process.env.NEXT_PUBLIC_USDC_DENOM ?? "ibc/usdc",
): CosmosMsg {
  return {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress,
      toAddress,
      amount: [{ denom, amount }],
    },
  };
}

/**
 * Build a CosmWasm contract execute message.
 */
export function buildExecuteMsg(
  sender: string,
  contract: string,
  msg: Record<string, unknown>,
  funds: Array<{ denom: string; amount: string }> = [],
): CosmosMsg {
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: {
      sender,
      contract,
      msg: Buffer.from(JSON.stringify(msg)).toString("base64"),
      funds,
    },
  };
}
