import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  CommentDocument,
  CommentModelType,
} from '../domain/comment/comment.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { Comment } from '../domain/comment/comment.entity';

@Injectable()
export class CommentsRepository {
  // пришлось перейти на строчку 'Comment' из-за цикличности зависимостей
  constructor(@InjectModel('Comment') private CommentModel: CommentModelType) {}

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findByIdOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment = await this.CommentModel.findById(id);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return comment;
  }

  async findByIdAndDelete(id: string): Promise<void> {
    await this.CommentModel.findByIdAndDelete(id);
  }
}
