import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../domain/blog/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDomainDto } from '../dto/blog/create-blog-domain.dto';
import { BlogInputDto } from '../dto/blog/blog-input.dto';
import type { BlogModelType } from '../domain/blog/blog.entity';
import { BlogUpdateDto } from '../dto/blog/blog-update.dto';

@Injectable()
export class BlogsService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: BlogInputDto) {
    const newBlogDto: CreateBlogDomainDto = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
    };

    const blog = this.BlogModel.createInstance(newBlogDto);

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlog(id: string, dto: BlogUpdateDto) {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    blog.update(dto);

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async deleteBlog(id: string) {
    await this.blogsRepository.delete(id);
  }
}
