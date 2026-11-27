const PAYMENT_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    refunded: "bg-purple-100 text-purple-700",
    failed: "bg-gray-100 text-gray-600",
};

export default function PaymentBadge({ status }: { status: string }) {
    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STYLES[status] ?? PAYMENT_STYLES.failed}`}>
            {status}
        </span>
    );
}