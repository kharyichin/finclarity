'use client'

import { useRef, useState, useCallback } from 'react'
import { friendlyUploadError } from '@/lib/utils/upload-errors'

interface Props {
  onStatementCreated: (statementId: string, file: File) => void
  onDuplicate: () => void
  onError: (message: string) => void
  onAnonymousSuccess?: () => void
  onNeedsPasswordAnonymous?: (file: File) => void
  onAllDone?: () => void // called when a multi-file queue finishes
}

type FileStatus = 'queued' | 'uploading' | 'processing' | 'done' | 'duplicate' | 'error' | 'needs_password'

interface FileItem {
  file: File
  status: FileStatus
  statementId?: string
  errorMsg?: string
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

async function pollStatement(id: string): Promise<'complete' | 'failed' | 'needs_password'> {
  for (let i = 0; i < 90; i++) {
    await sleep(2000)
    try {
      const res = await fetch(`/api/statements/${id}`)
      const data = await res.json()
      if (data.status === 'complete') return 'complete'
      if (data.status === 'failed') return 'failed'
      if (data.status === 'needs_password') return 'needs_password'
    } catch { /* keep polling */ }
  }
  return 'failed'
}

export function UploadZone({
  onStatementCreated,
  onDuplicate,
  onError,
  onAnonymousSuccess,
  onNeedsPasswordAnonymous,
  onAllDone,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [queue, setQueue] = useState<FileItem[]>([])
  const [passwordInputs, setPasswordInputs] = useState<Record<number, string>>({})
  const passwordResolvers = useRef<Record<number, (pwd: string) => void>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Single-file path (unchanged behaviour) ─────────────────────────────
  async function handleSingleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) { onError(friendlyUploadError('Please upload a PDF file.')); return }
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/statements/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.duplicate) { onDuplicate(); return }
      if (data.error) { onError(friendlyUploadError(data.error)); return }
      if (data.anonymous) { sessionStorage.setItem('finclarity_pending_upload', JSON.stringify(data)); onAnonymousSuccess?.(); return }
      if (data.needsPassword) { onNeedsPasswordAnonymous?.(file); return }
      onStatementCreated(data.statement_id, file)
    } catch { onError(friendlyUploadError('Upload failed. Please check your connection and try again.')) }
    finally { setIsUploading(false) }
  }

  // ── Multi-file queue path ───────────────────────────────────────────────
  const updateItem = useCallback((index: number, patch: Partial<FileItem>) => {
    setQueue((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item))
  }, [])

  async function processQueueItem(index: number, items: FileItem[]) {
    const item = items[index]
    if (!item.file.name.toLowerCase().endsWith('.pdf')) {
      updateItem(index, { status: 'error', errorMsg: friendlyUploadError('Not a PDF') })
      return
    }

    updateItem(index, { status: 'uploading' })
    try {
      const fd = new FormData()
      fd.append('file', item.file)
      const res = await fetch('/api/statements/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.duplicate) { updateItem(index, { status: 'duplicate' }); return }
      if (data.error) { updateItem(index, { status: 'error', errorMsg: friendlyUploadError(data.error) }); return }

      const statementId: string = data.statement_id
      updateItem(index, { status: 'processing', statementId })

      let result = await pollStatement(statementId)

      if (result === 'needs_password') {
        updateItem(index, { status: 'needs_password' })
        // Pause queue and wait for the user to type the password
        const password = await new Promise<string>((resolve) => {
          passwordResolvers.current[index] = resolve
        })
        // Retry with password
        updateItem(index, { status: 'uploading' })
        const fd2 = new FormData()
        fd2.append('file', item.file)
        fd2.append('password', password)
        const res2 = await fetch('/api/statements/upload', { method: 'POST', body: fd2 })
        const data2 = await res2.json()
        if (data2.error) { updateItem(index, { status: 'error', errorMsg: friendlyUploadError(data2.error) }); return }
        updateItem(index, { status: 'processing', statementId: data2.statement_id ?? statementId })
        result = await pollStatement(data2.statement_id ?? statementId)
      }

      updateItem(index, { status: result === 'complete' ? 'done' : 'error', errorMsg: result === 'failed' ? friendlyUploadError('Processing failed') : undefined })
    } catch {
      updateItem(index, { status: 'error', errorMsg: friendlyUploadError('Upload failed') })
    }
  }

  async function startQueue(files: File[]) {
    const items: FileItem[] = files.map((f) => ({ file: f, status: 'queued' as FileStatus }))
    setQueue(items)
    for (let i = 0; i < items.length; i++) {
      await processQueueItem(i, items)
    }
    onAllDone?.()
  }

  function submitPassword(index: number) {
    const pwd = passwordInputs[index] ?? ''
    if (!pwd.trim()) return
    passwordResolvers.current[index]?.(pwd)
    delete passwordResolvers.current[index]
    setPasswordInputs((prev) => { const n = { ...prev }; delete n[index]; return n })
  }

  // ── Drag / input handlers ───────────────────────────────────────────────
  function handleFiles(files: File[]) {
    if (files.length === 0) return
    if (files.length === 1) {
      handleSingleFile(files[0])
    } else {
      startQueue(files)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    handleFiles(files)
    e.target.value = ''
  }

  // ── Queue UI ────────────────────────────────────────────────────────────
  if (queue.length > 0) {
    const doneCount = queue.filter((q) => q.status === 'done').length
    const allDone = queue.every((q) => ['done', 'duplicate', 'error'].includes(q.status))

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-stone-500">
            {allDone ? `${doneCount} of ${queue.length} processed` : `Processing ${queue.length} statement${queue.length > 1 ? 's' : ''}…`}
          </p>
          {allDone && (
            <span className="text-xs text-green-600 font-medium">All done ✓</span>
          )}
        </div>

        <div className="space-y-2">
          {queue.map((item, i) => (
            <div key={i} className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-base shrink-0">📄</span>
                <p className="flex-1 text-sm text-stone-700 truncate min-w-0">{item.file.name}</p>
                <StatusBadge status={item.status} />
              </div>

              {item.status === 'needs_password' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="PDF password"
                    value={passwordInputs[i] ?? ''}
                    onChange={(e) => setPasswordInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitPassword(i) }}
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                    autoFocus
                  />
                  <button
                    onClick={() => submitPassword(i)}
                    className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700 transition"
                  >
                    Unlock
                  </button>
                </div>
              )}

              {item.status === 'error' && item.errorMsg && (
                <p className="mt-1 text-xs text-red-500 pl-9">{item.errorMsg}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Default drop zone UI ────────────────────────────────────────────────
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
        cursor-pointer transition-all duration-200 p-10 text-center select-none
        ${isDragging ? 'border-green-400 bg-green-50' : 'border-stone-300 bg-stone-50 hover:border-green-300 hover:bg-green-50/50'}
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">↑</div>
          <div>
            <p className="font-medium text-stone-700">Drop your statements here</p>
            <p className="text-sm text-stone-400 mt-1">Click to browse — PDF only · multiple files supported</p>
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: FileStatus }) {
  switch (status) {
    case 'queued':
      return <span className="text-xs text-stone-400">Queued</span>
    case 'uploading':
      return <div className="h-4 w-4 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin shrink-0" />
    case 'processing':
      return (
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-4 w-4 rounded-full border-2 border-green-200 border-t-green-500 animate-spin" />
          <span className="text-xs text-stone-400">Processing…</span>
        </div>
      )
    case 'done':
      return <span className="text-green-600 font-bold text-base shrink-0">✓</span>
    case 'duplicate':
      return <span className="text-xs text-stone-400 shrink-0">Already uploaded</span>
    case 'needs_password':
      return <span className="text-xs text-amber-600 shrink-0">🔒 Password needed</span>
    case 'error':
      return <span className="text-red-500 font-bold shrink-0">✕</span>
  }
}
