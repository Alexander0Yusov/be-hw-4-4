import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { CommentsRepository } from 'src/modules/bloggers-platform/infrastructure/comments.repository';
import { LikesRepository } from 'src/modules/bloggers-platform/infrastructure/likes.repository';
import { CommentsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/comments-query.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private likesRepository: LikesRepository,
  ) {}

  async execute({ commentId, userId }: DeleteCommentCommand): Promise<void> {
    // делаем квери запрос, убеждаемся что удаляет автор
    const comment =
      await this.commentsQueryRepository.findByIdOrNotFoundFail(commentId);

    if (comment.commentatorInfo.userId === userId) {
      // делаем удаление комментария
      await this.commentsRepository.findByIdAndDelete(commentId);
      // делаем удаление лайков к этому комментарию
      await this.likesRepository.deleteManyByParentId(commentId);
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Comment was created by another user',
      });
    }
  }
}
