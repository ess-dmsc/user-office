import { Query, Ctx, Resolver, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEP } from '../types/SEP';

@Resolver()
export class SEPQuery {
  @Query(() => SEP, { nullable: true })
  async sep(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ): Promise<SEP | null> {
    return context.queries.sep.get(context.user, id);
  }
}