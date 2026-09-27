/**
 * Imprint details (§ 5 DDG) come from environment variables set in the Vercel project, so
 * the repository itself carries no postal address. Missing values are shown as missing –
 * never invented.
 */
export interface Imprint {
  name?: string;
  street?: string;
  city?: string;
  email?: string;
}

export function imprint(): Imprint {
  return {
    name: process.env.IMPRINT_NAME,
    street: process.env.IMPRINT_STREET,
    city: process.env.IMPRINT_CITY,
    email: process.env.IMPRINT_EMAIL,
  };
}

export function imprintComplete(i: Imprint = imprint()): boolean {
  return Boolean(i.name && i.street && i.city && i.email);
}
