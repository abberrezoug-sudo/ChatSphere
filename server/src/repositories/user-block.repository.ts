import { Types } from "mongoose";
import { UserBlock } from "../models/user-block.model.js";

export class UserBlockRepository {
  async block(blockerId: string, blockedId: string) {
    return await UserBlock.findOneAndUpdate(
      {
        blocker: new Types.ObjectId(blockerId),
        blocked: new Types.ObjectId(blockedId),
      },
      {
        blocker: new Types.ObjectId(blockerId),
        blocked: new Types.ObjectId(blockedId),
      },
      {
        upsert: true,
        new: true,
      }
    );
  }

  async unblock(blockerId: string, blockedId: string) {
    return await UserBlock.findOneAndDelete({
      blocker: new Types.ObjectId(blockerId),
      blocked: new Types.ObjectId(blockedId),
    });
  }

  async findBlock(blockerId: string, blockedId: string) {
    return await UserBlock.findOne({
      blocker: new Types.ObjectId(blockerId),
      blocked: new Types.ObjectId(blockedId),
    });
  }

  async hasAnyBlock(userA: string, userB: string) {
    return await UserBlock.exists({
      $or: [
        {
          blocker: new Types.ObjectId(userA),
          blocked: new Types.ObjectId(userB),
        },
        {
          blocker: new Types.ObjectId(userB),
          blocked: new Types.ObjectId(userA),
        },
      ],
    });
  }

  async getBlockedUsers(userId: string, limit = 20, before?: string) {
    const query: any = {
      blocker: new Types.ObjectId(userId),
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const blockedUsers = await UserBlock.find(query)
      .populate("blocked", "username email avatar")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = blockedUsers.length > limit;

    return {
      blockedUsers: hasMore
        ? blockedUsers.slice(0, limit)
        : blockedUsers,
      hasMore,
    };
  }
}
