"use client"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
}

export async function registerServiceWorker() {
  if (!pushSupported()) return null
  return navigator.serviceWorker.register("/sw.js")
}

export async function subscribeToPush(vapidPublicKey: string) {
  if (!pushSupported()) throw new Error("Push not supported on this device/browser.")

  const permission = await Notification.requestPermission()
  if (permission !== "granted") throw new Error("Notification permission denied.")

  const reg = (await navigator.serviceWorker.getRegistration()) || (await registerServiceWorker())
  if (!reg) throw new Error("Service worker not available.")
  await navigator.serviceWorker.ready

  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing.toJSON()

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })
  return sub.toJSON()
}

export async function getCurrentSubscription() {
  if (!pushSupported()) return null
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return null
  const sub = await reg.pushManager.getSubscription()
  return sub
}

export async function unsubscribeFromPush() {
  const sub = await getCurrentSubscription()
  if (sub) {
    const endpoint = sub.endpoint
    await sub.unsubscribe()
    return endpoint
  }
  return null
}
