import { SearchRepository } from "../repositories/search.repository.js";

const repository = new SearchRepository();

export class SearchService {
  async search(userId: string, query: string) {
    const [
      users,
      rooms,
      privateMessages,
      roomMessages,
    ] = await Promise.all([
      repository.searchUsers(query),

      repository.searchRooms(userId, query),

      repository.searchPrivateMessages(
        userId,
        query
      ),

      repository.searchRoomMessages(
        userId,
        query
      ),
    ]);

    return {
      users,
      rooms,
      privateMessages,
      roomMessages,
    };
  }
}