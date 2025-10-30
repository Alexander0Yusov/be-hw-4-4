import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts-query.repository';
import { PostInputDto } from '../dto/post/post-iput.dto';
import { PostViewDto } from '../dto/post/post-view.dto';
import { GetPostsQueryParams } from '../dto/post/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostUpdateDto } from '../dto/post/post-update.dto';
import { CommentViewDto } from '../dto/comment/comment-view.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CommentInputDto } from '../dto/comment/comment-input.dto';
import { CreateCommentCommand } from '../application/usecases/comments/create-comment.usecase';
import { ExtractUserFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CommentsQueryRepository } from '../infrastructure/query/comments-query.repository';
import { LikeInputDto } from '../dto/like/like-input.dto';
import { UpdatePostLikeStatusCommand } from '../application/usecases/posts/update-post-like-status.usecase';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { GetPostCommand } from '../application/usecases/posts/get-post.usecase';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basi-auth.guard';
import { CreatePostCommand } from '../application/usecases/posts/create-post.usecase';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { LikesQueryRepository } from '../infrastructure/query/likes-query.repository';
import { Types } from 'mongoose';
import { postItemsGetsMyStatus } from '../application/mapers/post-items-gets-my-status';
import { GetCommentsQueryParams } from '../dto/comment/get-comments-query-params.input-dto';
import { commentItemsGetsMyStatus } from '../application/mapers/comment-items-gets-my-status';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() dto: PostInputDto): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand(dto));
    return await this.postsQueryRepository.findByIdOrNotFoundFail(postId);
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PostViewDto> {
    return await this.commandBus.execute(new GetPostCommand(id, user?.id));
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const posts = await this.postsQueryRepository.getAll(query);

    if (user.id) {
      const postIds = posts.items.map((post) => new Types.ObjectId(post.id));
      const likes = await this.likesQueryRepository.getLikesByParentsIds(
        postIds,
        user.id,
      );

      const updatedItems = postItemsGetsMyStatus(posts.items, likes);
      posts.items = updatedItems;
    }

    return posts;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() body: PostUpdateDto,
  ): Promise<void> {
    await this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePost(id);
  }
  //

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForCurrentPost(
    @Param('id') id: string,
    @Body() body: CommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand(body, id, user.id),
    );

    return await this.commentsQueryRepository.findByIdOrNotFoundFail(commentId);
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatusForCurrentPost(
    @Param('id') id: string,
    @Body() body: LikeInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(body, id, user.id),
    );
  }

  @Get(':id/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsByPostId(
    @Param('id') id: string,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.findByIdOrNotFoundFail(id);

    console.log(6666, '---', query, '----', user);

    const comments = await this.commentsQueryRepository.findManyByPostId(
      id,
      query,
    );

    console.log(666666, comments);

    if (user.id) {
      const commentIds = comments.items.map(
        (comment) => new Types.ObjectId(comment.id),
      );
      const likes = await this.likesQueryRepository.getLikesByParentsIds(
        commentIds,
        user.id,
      );

      const updatedItems = commentItemsGetsMyStatus(comments.items, likes);
      comments.items = updatedItems;
    }

    return comments;
  }
}
