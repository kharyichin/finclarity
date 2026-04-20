// pdfjs-dist recommends using the legacy build in Node.js environments
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'

// In Next.js API routes (Node.js), browser Web Worker is unavailable.
// pdfjs falls back to its "fake worker" which uses dynamic import() of this module specifier.
GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.min.mjs'

export async function parsePDF(
  fileBytes: Buffer,
  password?: string
): Promise<{
  text: string
  needsPassword: boolean
  pageCount: number
  dateRange: { start: Date; end: Date } | null
}> {
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

    return {
      text: fullText.trim(),
      needsPassword: false,
      pageCount,
      dateRange: detectDateRange(fullText),
    }
  } catch (error: unknown) {
    const err = error as { name?: string }
    if (err?.name === 'PasswordException') {
      return { text: '', needsPassword: true, pageCount: 0, dateRange: null }
    }
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
