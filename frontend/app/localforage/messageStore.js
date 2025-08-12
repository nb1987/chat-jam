import { messageStore } from "@frontend/localforage/localforageConfig";
import { sendMsg, socket } from "@frontend/services/socket";

// { tempId, roomId, text, senderId, friendId, status, created_at } = msg

export async function saveLocalMessage(msg) {
  return messageStore.setItem(msg.id, msg);
}

export async function getMessagesByStatus(status) {
  const list = [];
  await messageStore.iterate((value) => {
    if (value.status === status) {
      list.push(value);
    }
  });
  return list;
}

export async function updateMessageStatus(
  id,
  newStatus,
  newId = null,
  newCreatedAt = null
) {
  try {
    const msg = await messageStore.getItem(id);
    if (!msg) return;

    msg.status = newStatus;

    if (newCreatedAt != null) {
      msg.created_at = newCreatedAt;
    }

    if (newId && newId !== id) {
      msg.id = newId;
      await messageStore.removeItem(id);
      await messageStore.setItem(newId, msg);
    } else {
      await messageStore.setItem(id, msg);
    }
    return msg;
  } catch (err) {
    console.error("Failed to update message status", err);
  }
}

let isRetrying = false;

export async function retryOnReconnect() {
  if (isRetrying) return;

  try {
    isRetrying = true;
    const failedMsgs = await getMessagesByStatus("failed");
    for (const msg of failedMsgs) {
      sendMsg(msg);
    }
  } finally {
    isRetrying = false;
  }
}

socket.on("connect", retryOnReconnect);

// 브라우저가 온라인이 됨. 소켓 재연결보다 빠르게 실행됨.
window.addEventListener("online", () => {
  if (socket.connected) retryOnReconnect();
});

//    1) 값 저장
//   await localforage.setItem('username', 'codeGenerator');

//    2) 값 가져오기
//   const name = await localforage.getItem('username');
//   console.log(name); // 'codeGenerator'

//    3) 객체 저장
//   const settings = { theme: 'dark', fontSize: 16 };
//   await localforage.setItem('settings', settings);

//    4) 객체 가져오기
//   const loadedSettings = await localforage.getItem('settings');
//   console.log(loadedSettings.theme); // 'dark'

//    5) 값 삭제
//   await localforage.removeItem('username');

//    6) 전체 삭제
//    await localforage.clear();
