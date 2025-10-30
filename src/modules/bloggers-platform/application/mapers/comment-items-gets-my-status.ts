import { Like } from '../../domain/like/like.entity';
import { CommentViewDto } from '../../dto/comment/comment-view.dto';
import { PostViewDto } from '../../dto/post/post-view.dto';

export const commentItemsGetsMyStatus = (
  comments: CommentViewDto[],
  likes: Like[],
): CommentViewDto[] => {
  console.log(2222, comments);

  const updatedComments = comments.map((comment) => {
    const currentLike = likes.find(
      (like) => like.parentId.toString() === comment.id,
    );

    if (currentLike) {
      comment.likesInfo.myStatus = currentLike.status;
    }

    return comment;
  });

  console.log(3333, updatedComments);

  return updatedComments;
};
