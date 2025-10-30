import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreatePostDomainDto } from '../../dto/post/create-post-domain.dto';
import { Like, LikeDocument, LikeSchema } from '../like/like.entity';
import { PostUpdateDto } from '../../dto/post/post-update.dto';
import { LikeForArrayViewDto } from '../../dto/like/like-for-array-view.dto';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Blog' })
  blogId: Types.ObjectId;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;

  @Prop({ type: [Object], default: [] })
  newestLikes: LikeForArrayViewDto[];

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.likesCount = dto.likesCount;
    post.dislikesCount = dto.dislikesCount;
    post.newestLikes = dto.newestLikes;

    return post as PostDocument;
  }

  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  update(dto: PostUpdateDto, blogName: string) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = new Types.ObjectId(dto.blogId);
    this.blogName = blogName;
  }

  updateLikesCountersAndLastLikesList(
    likes: number,
    disLikes: number,
    newestLikes: LikeForArrayViewDto[],
  ) {
    this.likesCount = likes;
    this.dislikesCount = disLikes;
    this.newestLikes = newestLikes;
  }

  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new Error('Entity already deleted');
  //   }
  //   this.deletedAt = new Date();
  // }
}

export const PostSchema = SchemaFactory.createForClass(Post);

//регистрирует методы сущности в схеме
PostSchema.loadClass(Post);

//Типизация документа
export type PostDocument = HydratedDocument<Post>;

//Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;
