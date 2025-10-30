import { Comment, CommentDocument } from '../../domain/comment/comment.entity';
import { LikeStatus } from '../../domain/like/like.entity';

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };

  static mapToView(
    comment: CommentDocument,
    myStatus: LikeStatus = LikeStatus.None,
  ): CommentViewDto {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId!.toString(),
        userLogin: comment.commentatorInfo.userLogin!.toString(),
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likeCount,
        dislikesCount: comment.dislikeCount,
        myStatus: myStatus,
      },
    };
  }
}
