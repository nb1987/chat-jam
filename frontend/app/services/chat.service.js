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

  async getChatHistory(roomId, friendId, offset) {
    const data = await this.client.get(
      offset
        ? `/api/chat//history/${roomId}/${friendId}?offset=${offset}`
        : `/api/chat//history/${roomId}/${friendId}`
    );
    return data;
  }
}

export default ChatService;
