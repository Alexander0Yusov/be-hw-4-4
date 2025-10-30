import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Comment } from 'src/modules/bloggers-platform/domain/comment/comment.entity';
import type { CommentModelType } from 'src/modules/bloggers-platform/domain/comment/comment.entity';
import { CommentInputDto } from 'src/modules/bloggers-platform/dto/comment/comment-input.dto';
import { CreateCommentDomainDto } from 'src/modules/bloggers-platform/dto/comment/create-comment-domain';
import { CommentsRepository } from 'src/modules/bloggers-platform/infrastructure/comments.repository';
import { PostsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/posts-query.repository';
import { UsersQueryRepository } from 'src/modules/user-accounts/infrastructure/query/users-query.repository';

export class CreateCommentCommand {
  constructor(
    public dto: CommentInputDto,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({
    dto,
    postId,
    userId,
  }: CreateCommentCommand): Promise<string> {
    await this.postsQueryRepository.findByIdOrNotFoundFail(postId);
    const user = await this.usersQueryRepository.findByIdOrNotFoundFail(userId);

    const newComment: CreateCommentDomainDto = {
      content: dto.content,
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      userLogin: user.login,
      likesCount: 0,
      dislikesCount: 0,
    };

    const comment = this.CommentModel.createInstance(newComment);
    await this.commentsRepository.save(comment);

    return comment._id.toString();
  }
}
