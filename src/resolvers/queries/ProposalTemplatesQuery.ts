import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Query,
  Resolver,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplate } from '../types/ProposalTemplate';
@InputType()
class ProposalTemplatesFilter {
  @Field()
  public isArchived?: boolean;
}

@ArgsType()
export class ProposalTemplatesArgs {
  @Field(() => ProposalTemplatesFilter, { nullable: true })
  public filter?: ProposalTemplatesFilter;
}
@Resolver()
export class ProposalTemplatesQuery {
  @Query(() => [ProposalTemplate])
  proposalTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: ProposalTemplatesArgs
  ) {
    return context.queries.template.getProposalTemplates(context.user, args);
  }
}