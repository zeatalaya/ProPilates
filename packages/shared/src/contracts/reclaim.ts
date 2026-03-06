import { getContractConfig } from "./config";

export function buildSubmitProofMsg(
  instructor: string,
  provider: string,
  proofData: {
    claimInfo: {
      provider: string;
      parameters: string;
      context: string;
    };
    signedClaim: {
      claim: {
        identifier: string;
        owner: string;
        timestampS: number;
        epoch: number;
      };
      signatures: string[];
    };
  },
) {
  const { reclaimContract } = getContractConfig();
  return {
    contractAddress: reclaimContract,
    msg: {
      verify_proof: {
        instructor,
        provider,
        claim_info: proofData.claimInfo,
        signed_claim: proofData.signedClaim,
      },
    },
  };
}

export function buildQueryVerification(instructor: string, provider: string) {
  return {
    get_verification: { instructor, provider },
  };
}

export function buildQueryAllVerifications(instructor: string) {
  return {
    get_all_verifications: { instructor },
  };
}
