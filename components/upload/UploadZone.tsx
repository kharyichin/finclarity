'use client'

import { useRef, useState } from 'react'

interface Props {
  onStatementCreated: (statementId: string, file: File) => void
  onDuplicate: () => void
  onError: (message: string) => void
  onAnonymousSuccess?: () => void
  onNeedsPasswordAnonymous?: (file: File) => void
}

export function UploadZone({ onStatementCreated, onDuplicate, onError, onAnonymousSuccess, onNeedsPasswordAnonymous }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      onError('Please upload a PDF file.')
      return
    }

    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/statements/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.duplicate) {
        onDuplicate()
        return
      }
      if (data.error) {
        onError(data.error)
        return
      }
      // Anonymous user: server processed everything in memory, no DB writes
      if (data.anonymous) {
        sessionStorage.setItem('finclarity_pending_upload', JSON.stringify(data))
        onAnonymousSuccess?.()
        return
      }
      // Anonymous user: PDF is password-protected, no statement_id exists
      if (data.needsPassword) {
        onNeedsPasswordAnonymous?.(file)
        return
      }
      onStatementCreated(data.statement_id, file)
    } catch {
      onError('Upload failed. Please check your connection and try again.')
    } finally {
      setIsUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
        cursor-pointer transition-all duration-200 p-10 text-center select-none
        ${isDragging
          ? 'border-green-400 bg-green-50'
          : 'border-stone-300 bg-stone-50 hover:border-green-300 hover:bg-green-50/50'
        }
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={onInputChange}
      />

      {isUploading ? (
        <>
          <div className="h-10 w-10 rounded-full border-2 border-green-300 border-t-green-600 animate-spin" />
          <p className="text-sm text-stone-500">Uploading…</p>
        </>
      ) : (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
            ↑
          </div>
          <div>
            <p className="font-medium text-stone-700">Drop your bank statement here</p>
            <p className="text-sm text-stone-400 mt-1">or click to browse — PDF only</p>
          </div>
        </>
      )}
    </div>
  )
}
