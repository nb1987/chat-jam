// 앱 서버의 연결을 받아 알림을 띄움 (채팅앱 백그라운드 프로세싱 담당).
// DOM(리액트 컴포넌트)에 접근을 못함.
// 앱에서 등록(register)을 해야 활성화됨.
// 앱이 꺼져 있어도 서버 푸시 → 서비스워커 → OS 알림 흐름으로 알림이 뜸.

const DB = "app-settings"; // db 이름
const STORE = "keyValueStore"; // 저장소 이름 (table 처럼)

// IndexedDB (브라우저에 내장된 비동기형 데이터베이스 API)를 열고 'STORE'와 연결.
// 특정 key에 해당하는 값을 IndexedDB에서 읽어오는 비동기 함수.
async function indexedDbGet(key) {
  const db = await new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = rej;
  });
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => res(req.result);
    req.onerror = rej;
  }); // 데이터베이스 객체 (res)가 반환되어 데이터를 읽는 작업.
}

// IndexedDB에 key-value 저장
async function indexedDbSet(key, value) {
  const db = await new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = rej;
  });
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite"); // 데이터 읽고 쓰기 모드
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = rej;
  });
} // tx: 작업 범위 설정 (STORE라는 object store 안에서만 작업 가능)

// 'message' 이벤트를 듣고, IndexedDB에 quietMode 값 저장.
// 외부(리액트 앱)에서 모드 변경 명령을 받으면 DB에 저장.
self.addEventListener("message", (e) => {
  const { type, mode } = e.data || {};

  if (type === "SET_MODE" && (mode === "alert" || mode === "quiet")) {
    indexedDbSet("quietMode", mode);
  }
});

// push 이벤트 (비동기) 수신,
// 이벤트가 끝날 때까지 서비스워커가 죽지 않도록 waitUntil 사용
self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const mode = (await indexedDbGet("quietMode")) || "alert";
      if (mode === "quiet") return;

      // data: 서버가 보낸 push 알림 데이터(보통 JSON)
      const data = event.data ? event.data.json() : {};
      const title = data.title || "Message";
      const body = data.body || "New message has arrived.";
      const tag = data.tag || `room-${data.roomId}`;

      // 알림을 띄움.
      // data: 알림을 띄우며 숨겨서 저장하는 데이터. (클릭시 url로 이동 가능)
      await self.registration.showNotification(title, {
        body,
        tag, // 같은 tag 값을 가진 알림이면 기존의 알림을 갱신.
        renotify: true, // 같은 태그여도 소리나 배지를 다시 표시.
        data: { url: data.url || `/chat` },
        icon: "/chatjam.png",
      });
    })()
  );
});

// 사용자가 브라우저 푸시 알림을 클릭했을 때 실행되는 이벤트.
// 현재 브라우저에서 서비스 워커가 제어하는 모든 탭(창)을 가져옴.
// 이미 앱이 열려 ('focus') 있으면 그 탭을 앞으로 가져옴(focus()) + 해당 url로 이동

// 브라우저 표준 API: 브라우저에 기본으로 들어있는 기능들.
// "notificationclick" e가 발생하면, 그 e 안에 notification 객체가 들어옴.
// notification:브라우저 표준 API인 Notification 객체.
// clients: 서비스 워커 전용 전역 객체. 워커 컨텍스트에서만 존재.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    (event.notification.data && event.notification.data.url) || "/chat";

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of all) {
        if ("focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // 열린 창이 없으면 새 탭을 열어서 해당 URL로 이동.
      if (self.clients.openWindow) await self.clients.openWindow(url);
    })()
  );
});
