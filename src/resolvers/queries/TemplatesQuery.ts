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
import { TemplateCategoryId } from '../../models/ProposalModel';
import { Template } from '../types/Template';
@InputType()
class TemplatesFilter {
  @Field({ nullable: true })
  public isArchived?: boolean;

  @Field(() => TemplateCategoryId, { nullable: true })
  public category?: TemplateCategoryId;
}

@ArgsType()
export class TemplatesArgs {
  @Field(() => TemplatesFilter, { nullable: true })
  public filter?: TemplatesFilter;
}
@Resolver()
export class TemplatesQuery {
  @Query(() => [Template], { nullable: true })
  templates(@Ctx() context: ResolverContext, @Args() args: TemplatesArgs) {
    return context.queries.template.getTemplates(context.user, args);
  }
}
