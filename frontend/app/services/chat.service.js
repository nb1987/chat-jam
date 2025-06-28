import Client from "./client";

class ChatService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async getChatRoomId(friendId) {
    const data = await this.client.get(`/api/chat/${friendId}`);
    return data;
  }

  async getChatHistory(roomId) {
    const data = await this.client.get(`/api/chat//history/${roomId}`);
    return data;
  }

  async getChatFriends() {
    const data = await this.client.get(`/api/chat/chat-friends`);
    return data;
  }
}

export default ChatService;
