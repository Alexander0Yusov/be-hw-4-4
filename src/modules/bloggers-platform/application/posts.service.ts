import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../domain/post/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import type { PostModelType } from '../domain/post/post.entity';
import { PostInputDto } from '../dto/post/post-iput.dto';
import { CreatePostDomainDto } from '../dto/post/create-post-domain.dto';
import { Types } from 'mongoose';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostUpdateDto } from '../dto/post/post-update.dto';

@Injectable()
export class PostsService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: PostInputDto) {
    // если не существует блога, то вылетит ошибка
    const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);

    const newPostDto: CreatePostDomainDto = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new Types.ObjectId(dto.blogId),
      blogName: blog.name,
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };

    const post = this.PostModel.createInstance(newPostDto);

    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async updatePost(postId: string, dto: PostUpdateDto) {
    // если не существует *, то вылетит ошибка
    const post = await this.postsRepository.findOrNotFoundFail(postId);
    const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);

    post.update(dto, blog.name);

    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async deletePost(id: string) {
    await this.postsRepository.delete(id);
  }
}
