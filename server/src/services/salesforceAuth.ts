import { getRequiredEnvVars } from "../utils/env.ts";
import { logger } from "../utils/loggingUtil.ts";

const MODULE = "data360Service";

const { SF_INSTANCE_URL, SF_CLIENT_ID, SF_CLIENT_SECRET } = getRequiredEnvVars(
  "SF_INSTANCE_URL",
  "SF_CLIENT_ID",
  "SF_CLIENT_SECRET",
);

const TOKEN_TTL_MS = 55 * 60 * 1000;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const getSalesforceToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await fetch(`${SF_INSTANCE_URL}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(MODULE, `Salesforce token request failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to get Salesforce token: ${response.statusText}`);
  }

  const { access_token } = (await response.json()) as { access_token: string };
  cachedToken = access_token;
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS;
  return access_token;
};

export default getSalesforceToken;
