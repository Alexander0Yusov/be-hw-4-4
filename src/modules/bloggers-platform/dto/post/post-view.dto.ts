import { Types } from 'mongoose';
import { Like, LikeStatus } from '../../domain/like/like.entity';
import { Post, PostDocument } from '../../domain/post/post.entity';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  //
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };

  static mapToView(data: PostDocument): PostViewDto {
    return {
      id: data.id,
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: data.blogId.toString(),
      blogName: data.blogName,
      createdAt: data.createdAt,
      extendedLikesInfo: {
        likesCount: data.likesCount,
        dislikesCount: data.dislikesCount,
        myStatus: LikeStatus.None,
        newestLikes: data.newestLikes,
      },
    };
  }
}
