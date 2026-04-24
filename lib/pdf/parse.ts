export async function parsePDF(
  fileBytes: Buffer,
  password?: string
): Promise<{
  text: string
  needsPassword: boolean
  pageCount: number
  dateRange: { start: Date; end: Date } | null
}> {
  // DOMMatrix is a browser API required by pdfjs but absent in Node.js serverless environments
  if (typeof globalThis.DOMMatrix === 'undefined') {
    (globalThis as Record<string, unknown>).DOMMatrix = class DOMMatrix {
      a=1;b=0;c=0;d=1;e=0;f=0
      m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0
      m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1
      is2D=true;isIdentity=true
      constructor(_init?: unknown) {}
      multiply() { return this }
      translate() { return this }
      scale() { return this }
      rotate() { return this }
      inverse() { return this }
      transformPoint(p: {x?:number;y?:number}) { return { x: p?.x??0, y: p?.y??0, z: 0, w: 1 } }
    }
  }

  // Dynamic import avoids module-level crash in Vercel serverless environment
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Resolve the worker file path so pdfjs can load it in fake-worker (main-thread) mode
  try {
    const { createRequire } = await import('module')
    const { pathToFileURL } = await import('url')
    const req = createRequire(import.meta.url)
    const workerPath = req.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
    GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href
  } catch {
    GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.min.mjs'
  }

  try {
    const loadingTask = getDocument({
      data: new Uint8Array(fileBytes),
      password: password ?? '',
      useWorkerFetch: false,
      isEvalSupported: false,
    })

    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages
    let fullText = ''

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const lineText = (textContent.items as Array<{ str?: string; hasEOL?: boolean }>)
        .map((item) => {
          const s = item.str ?? ''
          return item.hasEOL ? s + '\n' : s + ' '
        })
        .join('')
      fullText += lineText + '\n'
    }

    const trimmed = fullText.trim()
    console.log('[parsePDF] extracted', pageCount, 'pages,', trimmed.length, 'chars')
    return {
      text: trimmed,
      needsPassword: false,
      pageCount,
      dateRange: detectDateRange(fullText),
    }
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string }
    if (err?.name === 'PasswordException') {
      return { text: '', needsPassword: true, pageCount: 0, dateRange: null }
    }
    console.error('[parsePDF] error:', err?.name, err?.message, error)
    throw error
  }
}

function detectDateRange(text: string): { start: Date; end: Date } | null {
  const dates: Date[] = []

  const dmy = /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/g
  let m
  while ((m = dmy.exec(text)) !== null) {
    const d = new Date(`${m[3]}-${m[2]}-${m[1]}`)
    if (!isNaN(d.getTime()) && d.getFullYear() > 2000) dates.push(d)
  }

  const ymd = /\b(\d{4})-(\d{2})-(\d{2})\b/g
  while ((m = ymd.exec(text)) !== null) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}`)
    if (!isNaN(d.getTime()) && d.getFullYear() > 2000) dates.push(d)
  }

  if (dates.length < 2) return null
  dates.sort((a, b) => a.getTime() - b.getTime())
  return { start: dates[0], end: dates[dates.length - 1] }
}
