async function call(path: string, token: string, body?: any) {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body || {}),
    })
    return await res.json()
  } catch (e) {
    return { ok: false, message: 'নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন' }
  }
}

export const sendStaffCode = (token: string) => call('/api/auth/code/send', token)
export const verifyStaffCode = (token: string, code: string) => call('/api/auth/code/verify', token, { code })