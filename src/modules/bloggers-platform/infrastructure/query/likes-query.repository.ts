import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, type LikeModelType } from '../../domain/like/like.entity';
import { Types } from 'mongoose';

@Injectable()
export class LikesQueryRepository {
  constructor(@InjectModel(Like.name) private LikeModel: LikeModelType) {}

  async getLikesByParentsIds(
    parentsIds: Types.ObjectId[],
    userId: string,
  ): Promise<Like[]> {
    return await this.LikeModel.find({
      parentId: { $in: parentsIds },
      authorId: new Types.ObjectId(userId),
      status: { $in: ['Like', 'Dislike'] },
    }).lean();
  }
}
