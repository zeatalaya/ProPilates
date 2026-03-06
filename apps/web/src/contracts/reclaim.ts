/**
 * Reclaim Protocol verification contract message builders.
 * Stores ZK proof verifications for BASI/STOTT/Balanced Body certifications.
 */

const RECLAIM_CONTRACT =
  process.env.NEXT_PUBLIC_RECLAIM_CONTRACT ??
  "xion1qf8jtznwf0tykpg7e65gwafwp47rwxl4x2g2kldvv357s6frcjlsh2m24e";

/**
 * Submit a Reclaim proof on-chain to verify a certification
 */
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
  return {
    contractAddress: RECLAIM_CONTRACT,
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

/**
 * Query a verification for an instructor
 */
export function buildQueryVerification(instructor: string, provider: string) {
  return {
    get_verification: {
      instructor,
      provider,
    },
  };
}

/**
 * Query all verifications for an instructor
 */
export function buildQueryAllVerifications(instructor: string) {
  return {
    get_all_verifications: {
      instructor,
    },
  };
}

export { RECLAIM_CONTRACT };
