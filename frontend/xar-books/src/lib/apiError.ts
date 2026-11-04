// the backend sends errors as { success: false, message }.
// with no message, the request never got an answer from the server.
export const getApiErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null && "data" in error) {
        const data = error.data as { message?: unknown } | null | undefined;

        if (typeof data?.message === "string") {
            return data.message;
        }
    }

    return "Could not reach the server. Please try again.";
};
