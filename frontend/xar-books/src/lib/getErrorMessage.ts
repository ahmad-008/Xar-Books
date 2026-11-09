export const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null && "data" in error) {
        const data = (error as { data?: { message?: string } }).data;
        if (data?.message) return data.message;
    }
    return "Something went wrong, please try again";
};
