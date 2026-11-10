import VerifyEmailStatus from "../components/VerifyEmailStatus";

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}) {
    const params = await searchParams;
    const token = typeof params.token === "string" ? params.token: "";

    return(
        <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
            <VerifyEmailStatus token={token}/>
        </div>
    );
}