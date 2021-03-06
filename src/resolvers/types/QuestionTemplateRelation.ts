import { Field, Int, ObjectType } from 'type-graphql';

import { QuestionTemplateRelation as QuestionTemplateRelationOrign } from '../../models/ProposalModel';
import { FieldConfigType } from './FieldConfig';
import { FieldDependency } from './FieldDependency';
import { Question } from './Question';

@ObjectType()
export class QuestionTemplateRelation
  implements Partial<QuestionTemplateRelationOrign> {
  @Field()
  public question: Question;

  @Field(() => Int)
  public sortOrder: number;

  @Field(() => Int)
  public topicId: number;

  @Field(() => FieldConfigType)
  public config: typeof FieldConfigType;

  @Field(() => FieldDependency, { nullable: true })
  public dependency?: FieldDependency;
}
