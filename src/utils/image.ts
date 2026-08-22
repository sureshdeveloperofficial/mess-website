const DEFAULT_FALLBACK_IMAGE = '/images/food/biryani_premium.png'

export const getFullImageUrl = (path: string | undefined | null, fallback: string = DEFAULT_FALLBACK_IMAGE): string => {
    if (!path || typeof path !== 'string' || path.trim() === '') {
        return fallback
    }

    const cleanPath = path.trim()

    // Absolute URLs (Cloudinary, S3, external HTTPS)
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return cleanPath
    }

    // Local public paths (e.g., /images/food/...)
    if (cleanPath.startsWith('/')) {
        return cleanPath
    }

    // Relative Cloudinary public IDs
    const baseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || ''
    if (baseUrl) {
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
        return `${normalizedBase}${cleanPath}`
    }

    return fallback
}
