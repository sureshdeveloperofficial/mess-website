export const getFullImageUrl = (path: string | undefined | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const baseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || ''
    return `${baseUrl}${path}`
}
