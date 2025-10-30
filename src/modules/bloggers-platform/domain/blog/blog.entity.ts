import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from '../../dto/blog/create-blog-domain.dto';
import { BlogUpdateDto } from '../../dto/blog/blog-update.dto';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, max: 1000 })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ default: false })
  isMembership: boolean;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog as BlogDocument;
  }

  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  update(dto: BlogUpdateDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

//регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);

//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;

//Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
