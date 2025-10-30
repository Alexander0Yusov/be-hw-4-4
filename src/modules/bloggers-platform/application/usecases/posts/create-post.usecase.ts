import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  Post,
  type PostModelType,
} from 'src/modules/bloggers-platform/domain/post/post.entity';
import { CreatePostDomainDto } from 'src/modules/bloggers-platform/dto/post/create-post-domain.dto';
import { PostInputDto } from 'src/modules/bloggers-platform/dto/post/post-iput.dto';
import { PostsRepository } from 'src/modules/bloggers-platform/infrastructure/posts.repository';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/blogs-query.repository';

export class CreatePostCommand {
  constructor(public dto: PostInputDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, string>
{
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<string> {
    const blog = await this.blogsQueryRepository.findByIdOrNotFoundFail(
      dto.blogId,
    );

    const newPost: CreatePostDomainDto = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new Types.ObjectId(dto.blogId),
      blogName: blog.name,
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };

    const post = this.PostModel.createInstance(newPost);
    await this.postsRepository.save(post);

    return post._id.toString();
  }
}
