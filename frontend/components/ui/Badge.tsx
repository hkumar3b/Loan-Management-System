type BadgeVariant =
  | "APPLIED"
  | "SANCTIONED"
  | "REJECTED"
  | "DISBURSED"
  | "CLOSED";

const variantStyles: Record<BadgeVariant, string> = {
  APPLIED: "bg-yellow-100 text-yellow-800",
  SANCTIONED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  DISBURSED: "bg-purple-100 text-purple-800",
  CLOSED: "bg-green-100 text-green-800",
};

export const Badge = ({ status }: { status: BadgeVariant }) => {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${variantStyles[status]}`}
    >
      {status}
    </span>
  );
};
