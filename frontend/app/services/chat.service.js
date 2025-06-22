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

  // async insertMsg(roomId, text, senderId, createdAt) {
  //   const data = await this.client.post(`/api/chat/insert-msg`, {
  //     roomId,
  //     text,
  //     senderId,
  //     createdAt,
  //   });
  //   return data;
  // }
}

export default ChatService;
