'use client'

import React, { useState, useRef } from 'react'
import { Icon } from '@iconify/react'
import axios from 'axios'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getFullImageUrl } from '@/utils/image'

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    folder?: string;
}

const ImageUpload = ({ value, onChange, folder = 'restaurant' }: ImageUploadProps) => {
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 10MB Limit for Cloudinary Free Tier
        const MAX_SIZE = 10 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            toast.error('File is too large. Maximum size is 10MB.')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (res.data.path) {
                onChange(res.data.path)
                toast.success('Image uploaded successfully')
            }
        } catch (error: any) {
            console.error('Upload error:', error)
            const msg = error.response?.data?.error || 'Failed to upload image'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleContainerClick = () => {
        fileInputRef.current?.click()
    }

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div
            onClick={handleContainerClick}
            className={`
                relative h-48 w-full border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center 
                ${value ? 'border-transparent' : 'border-grey/20 hover:border-[#df6853] hover:bg-[#df6853]/5'}
            `}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept="image/*"
            />

            {value ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                    <Image
                        src={getFullImageUrl(value)}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={removeImage}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            <Icon icon="ion:trash-outline" fontSize={24} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center text-grey/40">
                    {loading ? (
                        <div className="flex flex-col items-center">
                            <Icon icon="line-md:loading-loop" fontSize={48} className="text-[#df6853] mb-2" />
                            <span className="text-sm font-medium">Uploading...</span>
                        </div>
                    ) : (
                        <>
                            <Icon icon="ion:cloud-upload-outline" fontSize={48} className="mb-2" />
                            <span className="text-sm font-medium">Click to upload image</span>
                            <span className="text-xs mt-1">Maximum quality preserved</span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default ImageUpload
