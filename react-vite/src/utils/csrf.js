// Function to fetch CSRF token from the backend
export async function restoreCSRF() {
    const response = await fetch("/api/csrf/restore", {
        method: "GET",
        credentials: "include"
    });
    if (response.ok) {
        const data = await response.json();
        if (data.csrf_token) {
            return data.csrf_token;
        }
    }
    return null;
}

// Function to get CSRF token from cookies
export function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
} 