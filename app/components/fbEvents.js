// অ্যাডমিন/এডিটর/রাইডারের কাজ গণনা হবে না, শুধু কাস্টমারের কাজ যাবে
export function trackFb(event, params = {}) {
  try {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    if (localStorage.getItem('role')) return;
    window.fbq('track', event, params);
  } catch (e) {}
}