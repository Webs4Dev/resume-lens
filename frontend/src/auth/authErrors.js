import { ApiError } from "../services/apiClient";

// Turns backend auth errors into messages for people. Details of
// anything unexpected stay in the console.
const MESSAGES = {
    401: "Incorrect email or password.",
    409: "An account with this email already exists. Try logging in.",
    422: "Please enter a valid email and a password of at least 8 characters.",
    429: "Too many attempts. Please wait a minute and try again."
};

export function authErrorMessage(error) {
    if (error instanceof ApiError && MESSAGES[error.status]) {
        return MESSAGES[error.status];
    }

    console.error("Auth error", error);

    return error instanceof ApiError
        ? "Something went wrong. Please try again."
        : "Could not reach ResumeLens. Is the backend running?";
}

export const MIN_PASSWORD_LENGTH = 8;
