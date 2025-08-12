import "dotenv/config";
import webpush from "web-push";
import pool from "../config/db.js";

// web-push library가 푸시를 보낼 때 사용할 정보를 설정함. VAPID: 서버 신원 증명
export function initWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const priviteKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "https://chatjam.com";

  if (!publicKey || !priviteKey) {
    console.warn("PUSH VAPID keys missing. Web Push disabled.");
    return;
  }
  webpush.setVapidDetails(subject, publicKey, priviteKey);
}

// 유저가 브라우저에서 푸시 구독을 하면 subscription 객체가 생성됨 =>
// 이 객체(endpoint, 공개키, 인증 토큰..)가 있어야 푸시를 전송할 수 있음.
// (endpoint): 특정 브라우저 전용 URL(엔드포인트)이 만들어짐.

// {
//   "endpoint": "https://fcm.googleapis.com/fcm/send/eXaMpLeEnDpOiNt123",
//   "expirationTime": null,
//   "keys": {
//     "p256dh": "BOnc1f1o3...G0lQ", 구독한 브라우저가 보낸 공개키
//     "auth": "aBCdEfGhIj" 구독할 때 생성되는 비밀값 (by 브라우저)
//   }
// }

// endpoint는 고유값이라 같은 값이 있으면 충돌로 간주.
// DO UPDATE SET: 충돌이 나면 SET에 적은 컬럼들을 어떤 값으로 바꿀지 지정.
// 'EXCLUDED.': INSERT 하려고 했던 값들 (INSERT..ON CONFLICT..DO UPDATE)
export async function saveSubscription(userId, subscription) {
  const {
    endpoint,
    keys: { p256dh, auth },
  } = subscription;

  const q = `
     INSERT INTO push_subscriptions 
     (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint)
     DO UPDATE SET
        user_id=EXCLUDED.user_id, 
        p256dh=EXCLUDED.p256dh, 
        auth=EXCLUDED.auth
    `;
  await pool.query(q, [String(userId), endpoint, p256dh, auth]);
}

// 유저의 특정 기기 구독을 삭제
export async function removeSubscription(userId, endpoint) {
  const q = `
    DELETE FROM push_subscriptions 
    WHERE user_id=$1 AND endpoint=$2
 `;
  await pool.query(q, [String(userId), endpoint]);
}

// 유저의 모든 구독(기기) 에 푸시를 보내고, 만료된 구독은 정리.
export async function sendPushToUser(userId, payloadObj) {
  const q = `
        SELECT endpoint, p256dh, auth 
        FROM push_subscriptions 
        WHERE user_id=$1
    `;
  const { rows } = await pool.query(q, [String(userId)]); // 구독 목록
  const payload = JSON.stringify(payloadObj); // 보낼 데이터를 문자로 변환

  // 각 구독마다 객체로 변환,
  for (const r of rows) {
    const sub = {
      endpoint: r.endpoint,
      keys: { p256dh: r.p256dh, auth: r.auth },
    };
    try {
      await webpush.sendNotification(sub, payload);
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        await removeSubscription(userId, r.endpoint); // 만료 정리
      } else {
        console.warn("[push] send error:", e.statusCode, e.body || e.message);
      }
    }
  }
}
// (status 404, Not Found || 410, Gone):
// webpush.sendNotification()을 호출시, 해당 endpoint가 무효함.
// 사용자가 알림 권한을 차단, 브라우저 재설치, 기기 변경, 앱 제거 등으로 발생.
