import { company as defaults } from "../lib/company";
import type { ContactSettings } from "../lib/types";
import { useApiData } from "./api";

export type Company = { [K in keyof typeof defaults]: string };

/**
 * Company details for printed invoices and quotations: the primary email, phone and
 * address from Contact details (settings/contact), falling back to src/lib/company.ts.
 */
export function useCompany(): Company {
  const { data } = useApiData<ContactSettings>("settings/contact");
  if (!data) return defaults;

  const address = data.addresses[0];
  const phone = data.phones[0]?.number;
  return {
    ...defaults,
    email: data.emails[0]?.email || defaults.email,
    phone: phone ? phone.replace(/[^\d+]/g, "") : defaults.phone,
    phoneDisplay: phone || defaults.phoneDisplay,
    city: address ? [address.city, address.state].filter(Boolean).join(", ") : defaults.city,
    address: address ? [address.street, address.city, address.state, address.pincode].filter(Boolean).join(", ") : defaults.address,
  };
}
