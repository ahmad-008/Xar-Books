import ResetPasswordForm from "../components/ResetPasswordForm";

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const token = typeof params.token === "string" ? params.token : "";

    return (
        <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
            <ResetPasswordForm token={token} />
        </div>
    );
}
