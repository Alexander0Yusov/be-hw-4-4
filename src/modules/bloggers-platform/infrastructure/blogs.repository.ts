import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogDocument } from '../domain/blog/blog.entity';
import type { BlogModelType } from '../domain/blog/blog.entity';

import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findById(id);

    if (!blog) {
      //TODO: replace with domain exception
      throw new NotFoundException('blog not found');
    }

    return blog;
  }

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findById(id);
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async delete(id: string): Promise<void> {
    const result = await this.BlogModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }
}
