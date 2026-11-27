// "Contact Support" opens the visitor's own email app (Gmail on most phones)
// with a new message to the support inbox already addressed.

export const SUPPORT_EMAIL = 'support@qaventramarkets.com'

export function supportMailto(subject: string, body = '') {
  const params = [`subject=${encodeURIComponent(subject)}`]
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  return `mailto:${SUPPORT_EMAIL}?${params.join('&')}`
}

export function openSupportEmail(subject: string, body = '') {
  window.location.href = supportMailto(subject, body)
}
