import Client from "./client";

class UsersService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async getAllUsersExceptSelf(userId) {
    const data = await this.client.get(`/api/users/${userId}/others`);
    return data;
  }
}

export default UsersService;

//   async getUserInfo(userId) {
//     const data = await this.client.get(`/api/accounts/${userId}`);
//     return data;
//   }

//   async getUserFriends(userId) {
//     const data = await this.client.get(`/api/accounts/${userId}/friends`);
//     return data;
//   }
