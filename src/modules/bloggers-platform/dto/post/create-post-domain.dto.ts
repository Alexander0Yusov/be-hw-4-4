import { Types } from 'mongoose';
import { LikeForArrayViewDto } from '../like/like-for-array-view.dto';

export class CreatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
  blogName: string;
  //
  likesCount: number;
  dislikesCount: number;
  newestLikes: LikeForArrayViewDto[];
}
