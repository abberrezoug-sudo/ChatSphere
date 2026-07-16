import { Types } from "mongoose";
import { User } from "../models/User.js";
import { UserBlockRepository } from "../repositories/user-block.repository.js";

const userBlockRepository = new UserBlockRepository();

export class UserBlockService {
  async blockUser(blockerId: string, blockedId: string) {
    this.validateUsers(blockerId, blockedId);

    if (blockerId === blockedId) {
      throw new Error("You cannot block yourself");
    }

    return await userBlockRepository.block(blockerId, blockedId);
  }

  async unblockUser(blockerId: string, blockedId: string) {
    this.validateUsers(blockerId, blockedId);

    return await userBlockRepository.unblock(blockerId, blockedId);
  }

  async getBlockedUsers(userId: string, limit = 20, before?: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user");
    }

    return await userBlockRepository.getBlockedUsers(userId, limit, before);
  }

  async isBlockedBetween(userA: string, userB: string) {
    this.validateUsers(userA, userB);

    return Boolean(await userBlockRepository.hasAnyBlock(userA, userB));
  }

  async assertNoBlockBetween(userA: string, userB: string) {
    const blocked = await this.isBlockedBetween(userA, userB);

    if (blocked) {
      throw new Error("Action not allowed because one user blocked the other");
    }
  }

  async assertCanMention(authorId: string, content: string) {
    const usernames = this.extractMentionedUsernames(content);

    if (usernames.length === 0) {
      return;
    }

    const users = await User.find({
      username: { $in: usernames },
    }).select("_id username");

    for (const user of users) {
      await this.assertNoBlockBetween(authorId, user._id.toString());
    }
  }

  private extractMentionedUsernames(content: string) {
    const matches = content.match(/@([a-zA-Z0-9_]+)/g) ?? [];

    return Array.from(
      new Set(matches.map((match) => match.slice(1)))
    );
  }

  private validateUsers(userA: string, userB: string) {
    if (!Types.ObjectId.isValid(userA) || !Types.ObjectId.isValid(userB)) {
      throw new Error("Invalid user");
    }
  }
}
