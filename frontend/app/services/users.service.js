import Client from "./client";

class UsersService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async exploreUsers(userId) {
    const data = await this.client.get(`/api/users/${userId}/others`);
    return data;
  }

  async addFriend(userId, friendId) {
    const data = await this.client.post(`/api/users/${userId}/${friendId}`);
    return data;
  }
}

export default UsersService;
