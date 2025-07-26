import Client from "./client";

class ChatService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async getChatRoomId(friendId) {
    const data = await this.client.get(`/api/chat/${friendId}`);
    return data;
  }

  async getChatSummaries() {
    const data = await this.client.get(`/api/chat/chat-summaries`);
    return data;
  }

  async countUnreadMsgs() {
    const data = await this.client.get(`/api/chat/unread-count`);
    return data;
  }

  async deleteMessage(messageId) {
    const data = await this.client.patch(
      `/api/chat/delete-message/${messageId}`
    );
    return data;
  }

  async exitChatRoom(roomId) {
    const data = await this.client.delete(`/api/chat/exit/${roomId}`);
    return data;
  }

  async getChatHistory(roomId, friendId, cursor) {
    const isCursorValid =
      !!cursor?.createdAt &&
      cursor.createdAt !== "undefined" &&
      !!cursor?.id &&
      cursor.id !== "undefined";

    const url = isCursorValid
      ? `/api/chat/history/${roomId}/${friendId}?cursor=${cursor.createdAt}&cursorId=${cursor.id}`
      : `/api/chat/history/${roomId}/${friendId}`;

    const data = await this.client.get(url);
    return data;
  }
}

export default ChatService;
