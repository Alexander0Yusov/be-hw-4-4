import { Like, LikeDocument } from '../../domain/like/like.entity';
import { LikeForArrayViewDto } from '../../dto/like/like-for-array-view.dto';

export const likeDocsToViewMap = (
  likeDocsArray: LikeDocument[],
): LikeForArrayViewDto[] => {
  const resultArray: LikeForArrayViewDto[] = [];

  for (const like of likeDocsArray) {
    resultArray.push(Like.mapToView(like));
  }

  return resultArray;
};
