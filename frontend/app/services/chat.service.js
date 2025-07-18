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

  async DeleteMessage(messageId) {
    const data = await this.client.patch(
      `/api/chat/delete-message/${messageId}`
    );
    return data;
  }

  async getChatHistory(roomId, offset) {
    const data = await this.client.get(
      `/api/chat//history/${roomId}?offset=${offset}`
    );
    return data;
  }
}

export default ChatService;
