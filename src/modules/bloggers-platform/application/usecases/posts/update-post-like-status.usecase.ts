import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeInputDto } from 'src/modules/bloggers-platform/dto/like/like-input.dto';
import { LikesRepository } from 'src/modules/bloggers-platform/infrastructure/likes.repository';
import { PostsRepository } from 'src/modules/bloggers-platform/infrastructure/posts.repository';
import { UsersQueryRepository } from 'src/modules/user-accounts/infrastructure/query/users-query.repository';
import { likeDocsToViewMap } from '../../mapers/likeDocs-to-view.map';

export class UpdatePostLikeStatusCommand {
  constructor(
    public dto: LikeInputDto,
    public parentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatepostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand, void>
{
  constructor(
    private postsRepository: PostsRepository,
    private likesRepository: LikesRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({
    dto,
    parentId,
    userId,
  }: UpdatePostLikeStatusCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(parentId);
    const user = await this.usersQueryRepository.findByIdOrNotFoundFail(userId);

    // создание/обновление записи в коллекции лайков
    await this.likesRepository.createOrUpdate(
      parentId,
      userId,
      dto.likeStatus,
      user.login,
    );

    // пересчет счетчиков. можно уточнять название коллекции в которой айдишка искомая
    const { likes, dislikes } =
      await this.likesRepository.countReactions(parentId);

    // поиск трех последних лайков для поста
    const latestLikesList = await this.likesRepository.getLatestLikes(parentId);

    // явно мапим лайки
    const latestLikesListView = likeDocsToViewMap(latestLikesList);

    // правка и сохранение отредактированного комметария в репозитории
    post.updateLikesCountersAndLastLikesList(
      likes,
      dislikes,
      latestLikesListView,
    );

    await this.postsRepository.save(post);
  }
}
