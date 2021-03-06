import { Field, ObjectType } from 'type-graphql';

import { Answer as AnswerOrigin } from '../../models/ProposalModel';
import { IntStringDateBool } from '../CustomScalars';
import { QuestionTemplateRelation } from './QuestionTemplateRelation';

@ObjectType()
export class Answer extends QuestionTemplateRelation
  implements Partial<AnswerOrigin> {
  @Field(() => IntStringDateBool, { nullable: true })
  public value?: number | string | Date | boolean;
}
