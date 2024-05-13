const BASE_URL = import.meta.env.VITE_BASE_URL

// AUTH ENDPOINTS
export const authEndpoints = {
    SENDOTP_API: BASE_URL + "/auth/send-otp",
    SIGNUP_API: BASE_URL + "/auth/signup",
    LOGIN_API: BASE_URL + "/auth/login",
    RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
    RESETPASSWORD_API: BASE_URL + "/auth/reset-password"
}

// CATAGORIES API
export const categories = {
    CATEGORIES_API: BASE_URL + "/course/showAllCategories"
}