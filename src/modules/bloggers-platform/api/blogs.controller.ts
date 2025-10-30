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
import { BlogsService } from '../application/blogs.service';
import { BlogInputDto } from '../dto/blog/blog-input.dto';
import { BlogViewDto } from '../dto/blog/blog-view.dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs-query.repository';
import { GetBlogsQueryParams } from '../dto/blog/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../src/core/dto/base.paginated.view-dto';
import { BlogUpdateDto } from '../dto/blog/blog-update.dto';
import { PostViewDto } from '../dto/post/post-view.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts-query.repository';
import { GetPostsQueryParams } from '../dto/post/get-posts-query-params.input-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basi-auth.guard';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { Types } from 'mongoose';
import { LikesQueryRepository } from '../infrastructure/query/likes-query.repository';
import { postItemsGetsMyStatus } from '../application/mapers/post-items-gets-my-status';
import { PostUpdateOnBlogRouteDto } from '../dto/post/post-update-on-blog-route.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() dto: BlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(dto);

    // можем возвращать Promise из action. Сам NestJS будет дожидаться, когда
    // промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const blogs = await this.blogsQueryRepository.getAll(query);
    return blogs;
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: BlogUpdateDto,
  ): Promise<BlogViewDto> {
    const blogId = await this.blogsService.updateBlog(id, body);
    return this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }

  // маршрут: POST /blogs/:id/posts
  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('id') id: string,
    @Body() dto: PostUpdateOnBlogRouteDto,
  ): Promise<PostViewDto> {
    const postId = await this.postsService.createPost({ ...dto, blogId: id });
    return this.postsQueryRepository.findByIdOrNotFoundFail(postId);
  }

  // маршрут: GET /blogs/:id/posts
  @Get(':id/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsForBlog(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const posts = await this.postsQueryRepository.getAll(query, id);

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
}
