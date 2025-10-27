import { headers } from "next/headers";

const stripTrailingSlash = (value: string) => value.replace(/\/$/, "");

export async function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const isLocalEnvUrl =
    envUrl && /localhost|127\.0\.0\.1/i.test(envUrl);

  if (envUrl && !isLocalEnvUrl) {
    return stripTrailingSlash(envUrl);
  }

  const headersList = await headers();
  const proto =
    headersList.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine request host for base URL resolution");
  }

  return `${proto}://${host}`;
}
