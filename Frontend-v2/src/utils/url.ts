const getBaseUrl = () => {
    const viteUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    // Remove /api and any trailing slash
    return viteUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

const API_BASE_URL = getBaseUrl();

/**
 * Resolves a potentially relative image path from the backend into a full URL.
 */
export function resolveImageUrl(path: string | undefined): string {
    if (!path) return 'https://via.placeholder.com/800x600?text=No+Image';

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Fix Windows-style backslashes and remove leading slash if present to avoid doubles
    const normalizedPath = path.replace(/\\/g, '/').replace(/^\//, '');

    return `${API_BASE_URL}/${normalizedPath}`;
}
