import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewStatus } from '../../models/Review';
import { ReviewResponseWrap } from '../types/CommonWrappers';
import { Review } from '../types/Review';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class AddReviewArgs {
  @Field(() => Int)
  public reviewID: number;

  @Field()
  public comment: string;

  @Field(() => Int)
  public grade: number;

  @Field(() => ReviewStatus)
  status: ReviewStatus;

  @Field(() => Int)
  public sepID: number;
}

@Resolver()
export class UpdateReviewMutation {
  @Mutation(() => ReviewResponseWrap)
  addReview(@Args() args: AddReviewArgs, @Ctx() context: ResolverContext) {
    return wrapResponse<Review>(
      context.mutations.review.updateReview(context.user, args),
      ReviewResponseWrap
    );
  }
}
