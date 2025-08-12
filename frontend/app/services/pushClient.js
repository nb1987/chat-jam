// Voluntary Application Server Identification
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// endpoint: 특정 브라우저에서 구독을 하면 브라우저 전용 URL이 만들어짐.

// Base64URL 문자열을 Uint8Array(바이너리 배열)로 변환하는 함수.
// 웹 푸시를 구독할 때 applicationServerKey 값을 Uint8Array 형식으로 요구함. 왜?
// 'VAPID_PUBLIC_KEY'는 암호화된 키(배송장, 네트워크에서 안전하므로)

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

// 서비스 워커를 등록하는 함수.
// 브라우저가 서비스 워커를 지원하지 않으면 종료.
// `/sw.js` 파일을 서비스 워커로 등록하고, 그 Promise를 반환.
export async function registerSW() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js");
}

// 해당 사이트 알림(Notification) 권한을 확인.
// 'denied': 브라우저가 알림 API를 지원하지 않거나 거부로 설정됨.
// 권한이 아직 'default'(미정).
export function checkNotifyPermission() {
  if (!("Notification" in window)) return "denied";
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

// 서비스워커&알림 권한이 존재=> 푸시 구독을 진행하고 구독 정보를 반환하는 함수.
// 알림권한 확인→ 서비스워커 존재 확인→ 구독 유무 확인→ 서버에 구독 정보 등록.
// navigator: 브라우저의 전역 객체로 사용자의 브라우저와 관련된 기능/정보 제공.

// 브라우저가 서비스워커를 지원("serviceWorker" in navigator)하지 않으면 중단.
// 알림 권한 상태를 확인 후 권한이(permissionStatus) 허용되지 않으면 중단.
// 이미 등록된 서비스워커 객체를 기다리고(registerd)
// 서버에 브라우저가 푸시 구독 정보를 저장해둔 게 있는지 확인.
export async function subscribePush(userId) {
  if (!("serviceWorker" in navigator)) return null;

  const registered = await navigator.serviceWorker.ready;
  let activeSubscription = await registered.pushManager.getSubscription();
  if (!activeSubscription) {
    activeSubscription = await registered.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  // 서버에 누가(userId) 구독 정보(sub)를 쓰는지 구독 정보를 전송.
  // 서버가 이 정보를 저장해 두면, 나중에 푸시 메시지를 보낼 수 있음.
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, subscription: activeSubscription }),
  });

  return activeSubscription; // 구독 객체의 반환.
}

// 브라우저의 푸시 구독을 취소하고, 서버에도 구독 취소 사실을 알려줌.
// 이미 등록된 서비스워커가 준비되길 기다림, 브라우저의 푸시 구독 정보 가져옴.
export async function unsubscribePush(userId) {
  const registered = await navigator.serviceWorker.ready;
  const currentSubscription = await registered.pushManager.getSubscription();
  if (currentSubscription) {
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, endpoint: currentSubscription.endpoint }),
    });
    await currentSubscription.unsubscribe();
  }
}

// 특정 모드('alert'/'quiet')를 서비스워커에 전달해 저장하거나 동작을 변경
// 활성 상태인(active) 또는 페이지를 제어 중인(controller) sw 가져오기
export async function sendModeToSW(mode) {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registered = await navigator.serviceWorker.ready;
    const sw = registered.active || navigator.serviceWorker.controller;
    if (sw) sw.postMessage({ type: "SET_MODE", mode });
  } catch (e) {
    console.warn("Failed to send mode to Service Worker", e);
  }
}
