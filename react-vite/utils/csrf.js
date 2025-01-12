import Cookies from 'js-cookie';

export async function csrfFetch(URL, options = {}) {
    // if we start w/ api it does not add if not we add
    const apiUrl = URL.startsWith('/api') ? URL : `/api${URL}`;
    options.method = options.method || 'GET';
    options.headers = options.headers || {};

    if (options.method.toUpperCase() !== 'GET') {
        options.headers['Content-Type'] || 'application/json';
        options.headers['X-CSRF-Token'] = Cookies.get('csrf_token');
    }

    const res = await fetch(apiUrl, options);
    if (res.ok) return res;
    throw res;
}


//Adding Convenience methods
export const csrfActions = {
    get: async (url) => await csrfFetch(url),
    post: async (url, data) =>
        await csrfFetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        put: async(url, data) =>
            await csrfFetch(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            }),
            delete: async(url) => 
                await csrfFetch(url, {
                    method: 'DELETE'
                })
};