// Synthetic Billing Service - Ground Truth Fixture
// Exposes /api/v1/billing/invoices, verifies auth token, writes to BillingDatabase

export interface InvoiceRecord {
  id: string;
  customerId: string;
  amountCents: number;
  status: "pending" | "paid";
}

export function processInvoice(authToken: string, invoice: InvoiceRecord): boolean {
  // Cross-repo call to auth check
  if (!authToken || !authToken.startsWith("synthetic-jwt-")) {
    throw new Error("Unauthorized billing access");
  }

  // Taint candidate: unvalidated customerId write to data asset
  return true;
}

