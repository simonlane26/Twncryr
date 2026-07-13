'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadDropzone } from '@/lib/uploadthing'

// ─────────────────────────────────────────────
// Photo grid — shows existing photos with delete
// ─────────────────────────────────────────────

function PhotoGrid({
  photos,
  onDelete,
}: {
  photos: string[]
  onDelete: (url: string) => void
}) {
  if (photos.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {photos.map((url, i) => (
        <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-[var(--color-border-tertiary)]">
          <img
            src={url}
            alt={`Venue photo ${i + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Delete overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onDelete(url)}
              className="bg-white text-red-600 border-none rounded-lg px-3 py-1.5 text-[12px] font-medium cursor-pointer hover:bg-red-50 transition-colors"
            >
              <i className="ti ti-trash text-[13px]" aria-hidden="true" /> Remove
            </button>
          </div>
          {/* Primary badge */}
          {i === 0 && (
            <span className="absolute top-1.5 left-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#085041] text-[#E1F5EE]">
              Main photo
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// LogoUploader — single image with preview
// ─────────────────────────────────────────────

export function LogoUploader({
  currentLogo,
  businessName,
}: {
  currentLogo: string | null
  businessName: string
}) {
  const router = useRouter()
  const [logo, setLogo] = useState<string | null>(currentLogo)
  const [uploading, setUploading] = useState(false)

  return (
    <div className="flex items-center gap-4">
      {/* Current logo / placeholder */}
      <div className="w-16 h-16 rounded-xl border border-[var(--color-border-tertiary)] overflow-hidden flex-shrink-0 bg-[#E1F5EE] flex items-center justify-center">
        {logo ? (
          <img src={logo} alt={businessName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[28px]">🏪</span>
        )}
      </div>

      <div className="flex-1">
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-2">
          Square image works best. Shown in search results and your profile header.
        </p>
        <UploadDropzone
          endpoint="businessLogo"
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={res => {
            setLogo(res[0].url)
            setUploading(false)
            router.refresh()
          }}
          onUploadError={() => setUploading(false)}
          appearance={{
            container: 'border border-dashed border-[var(--color-border-secondary)] rounded-lg py-3 cursor-pointer hover:border-[#5DCAA5] transition-colors',
            label: 'text-[12px] text-[var(--color-text-secondary)]',
            allowedContent: 'text-[11px] text-[var(--color-text-secondary)]',
            uploadIcon: 'text-[var(--color-text-secondary)]',
            button: 'bg-[#0F6E56] text-[#E1F5EE] text-[12px] rounded-lg px-3 py-1.5',
          }}
          content={{
            label: uploading ? 'Uploading…' : 'Click or drag to upload logo',
            allowedContent: 'PNG, JPG up to 2MB',
          }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PhotoUploader — main export
// ─────────────────────────────────────────────

export default function PhotoUploader({
  initialPhotos,
  businessId,
}: {
  initialPhotos: string[]
  businessId: string
}) {
  const router = useRouter()
  const [photos, setPhotos]     = useState<string[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [error, setError]         = useState('')

  const remaining = 8 - photos.length

  async function handleDelete(url: string) {
    if (!confirm('Remove this photo from your listing?')) return
    setDeleting(url)
    try {
      await fetch(`/api/businesses/${businessId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      setPhotos(prev => prev.filter(p => p !== url))
      router.refresh()
    } catch {
      setError('Failed to remove photo. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      {/* Existing photos */}
      <PhotoGrid photos={photos} onDelete={handleDelete} />

      {/* Upload zone — hidden when at limit */}
      {remaining > 0 ? (
        <UploadDropzone
          endpoint="businessPhotos"
          onUploadBegin={() => { setUploading(true); setError('') }}
          onClientUploadComplete={res => {
            const newUrls = res.map(f => f.url)
            setPhotos(prev => [...prev, ...newUrls])
            setUploading(false)
            router.refresh()
          }}
          onUploadError={err => {
            setError(err.message)
            setUploading(false)
          }}
          appearance={{
            container: `border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors ${
              uploading
                ? 'border-[#5DCAA5] bg-[#E1F5EE]'
                : 'border-[var(--color-border-secondary)] hover:border-[#5DCAA5] hover:bg-[#E1F5EE]/30'
            }`,
            label: 'text-[13px] font-medium text-[var(--color-text-primary)]',
            allowedContent: 'text-[11px] text-[var(--color-text-secondary)] mt-1',
            button: 'bg-[#0F6E56] text-[#E1F5EE] text-[12px] font-medium rounded-lg px-4 py-2 mt-3',
          }}
          content={{
            label: uploading
              ? 'Uploading…'
              : photos.length === 0
              ? 'Add photos of your venue'
              : 'Add more photos',
            allowedContent: `PNG or JPG, up to 4MB each · ${remaining} slot${remaining !== 1 ? 's' : ''} remaining`,
            button: uploading ? 'Uploading…' : 'Choose files',
          }}
        />
      ) : (
        <p className="text-center text-[12px] text-[var(--color-text-secondary)] py-4 border border-dashed border-[var(--color-border-tertiary)] rounded-xl">
          Maximum 8 photos reached. Remove one to add another.
        </p>
      )}

      {error && (
        <p className="text-[12px] text-red-500 mt-2 flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-[13px]" aria-hidden="true" />
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <p className="text-[11px] text-[var(--color-text-secondary)] mt-2">
          The first photo is shown as your main listing image. Drag to reorder — coming soon.
        </p>
      )}
    </div>
  )
}
