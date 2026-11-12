import { Badge } from "../../components/ui/ui";
import type { InvoiceStatus } from "../../lib/types";
import { STATUS } from "./invoice-status";

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge tone={STATUS[status]?.tone ?? "neutral"} dot>
      {STATUS[status]?.label ?? status}
    </Badge>
  );
}
