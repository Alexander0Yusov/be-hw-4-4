import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewDto } from 'src/modules/bloggers-platform/dto/post/post-view.dto';
import { LikesRepository } from 'src/modules/bloggers-platform/infrastructure/likes.repository';
import { PostsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/posts-query.repository';

export class GetPostCommand {
  constructor(
    public postId: string,
    public userId?: string,
  ) {}
}

@CommandHandler(GetPostCommand)
export class GetPostUseCase
  implements ICommandHandler<GetPostCommand, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private likesRepository: LikesRepository,
  ) {}

  async execute({ postId, userId }: GetPostCommand): Promise<PostViewDto> {
    // делаем квери запрос на комментарий и лайк. затем лепим вью обьект
    const post = await this.postsQueryRepository.findByIdOrNotFoundFail(postId);

    if (userId) {
      const like = await this.likesRepository.findByPostIdByAuthorId(
        postId,
        userId,
      );

      // если юзер авторизован и ставил лайк, то подмешиваем в объект статус
      if (like) {
        post.extendedLikesInfo.myStatus = like.status;
      }
    }

    return post;
  }
}
