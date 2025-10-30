import { Injectable } from '@nestjs/common';
import type { CommentModelType } from '../domain/comment/comment.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel('Comment')
    private CommentModel: CommentModelType,
    // private postsRepository: PostsRepository,
    // private blogsRepository: BlogsRepository,
  ) {}
}
