import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostDocument } from '../domain/post/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../domain/post/post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.PostModel.findById(id);

    if (!post) {
      //TODO: replace with domain exception
      throw new NotFoundException('post not found');
    }

    return post;
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async delete(id: string): Promise<void> {
    const result = await this.PostModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
  }
}
