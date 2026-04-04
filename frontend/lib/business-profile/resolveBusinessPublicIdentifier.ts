import { getBusiness, getBusinessBySlug } from "@/lib/api";
import type { Business } from "@/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function resolveBusinessPublicIdentifier(identifier: string): Promise<Business> {
  if (UUID_PATTERN.test(identifier)) {
    return getBusiness(identifier);
  }

  return getBusinessBySlug(identifier);
}
