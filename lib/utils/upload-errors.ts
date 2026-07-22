/** Map raw API / network errors to calm user-facing copy. */

export function friendlyUploadError(raw: unknown): string {
  const msg = (typeof raw === 'string' ? raw : raw == null ? '' : String(raw)).trim()
  const lower = msg.toLowerCase()

  if (!msg) {
    return 'Something went wrong while reading that file. Please try again.'
  }

  if (
    lower.includes('password') ||
    lower.includes('decrypt') ||
    lower.includes('encrypted') ||
    lower.includes('incorrect')
  ) {
    return 'That password did not unlock the PDF. Check the statement password from your bank and try again. We never store it.'
  }

  if (
    lower.includes('not a pdf') ||
    lower.includes('please upload a pdf') ||
    lower.includes('invalid file') ||
    lower.includes('file type') ||
    lower.includes('only pdf')
  ) {
    return 'Please upload a PDF bank statement. Other file types are not supported yet.'
  }

  if (
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('aborted')
  ) {
    return 'That took too long. Check your connection and try a smaller statement, or try again in a moment.'
  }

  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('connection') ||
    lower.includes('failed to fetch')
  ) {
    return 'We could not reach the server. Check your connection and try again.'
  }

  if (
    lower.includes('extract') ||
    lower.includes('claude') ||
    lower.includes('processing failed') ||
    lower.includes('could not read') ||
    lower.includes('no transaction')
  ) {
    return 'We could not read transactions from this statement. Try another PDF export from your bank app, or a different month.'
  }

  if (lower.includes('too large') || lower.includes('payload') || lower.includes('size')) {
    return 'That file is too large. Try exporting a single-month statement from your bank app.'
  }

  if (lower.includes('rate') || lower.includes('429')) {
    return 'We are a bit busy right now. Wait a minute and try again.'
  }

  // Avoid dumping stack-like or ultra-long technical strings
  if (msg.length > 180 || lower.includes('at ') || lower.includes('stack')) {
    return 'Something went wrong while processing your statement. Please try again.'
  }

  return msg
}
