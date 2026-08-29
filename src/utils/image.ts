const DEFAULT_FALLBACK_IMAGE = 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/biryani_premium.png'

export const getFullImageUrl = (path: string | undefined | null, fallback: string = DEFAULT_FALLBACK_IMAGE): string => {
    if (!path || typeof path !== 'string' || path.trim() === '') {
        return fallback
    }

    const cleanPath = path.trim()

    // Absolute URLs (DigitalOcean Spaces, S3, external HTTPS)
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return cleanPath
    }

    // Local public paths (e.g., /images/food/...)
    if (cleanPath.startsWith('/')) {
        return cleanPath
    }

    // Default return
    return `${process.env.NEXT_PUBLIC_DO_SPACES_URL || 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website'}/${cleanPath}`
}
