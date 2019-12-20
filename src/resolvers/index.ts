import { ResolverContext } from "../context";
import { isRejection, Rejection, rejection } from "../rejection";
import {
  ProposalAnswer,
  ProposalInformation,
  Topic,
  FieldDependency,
  ProposalTemplateField,
  DataType,
  ProposalTemplate
} from "../models/ProposalModel";
import { Proposal } from "../models/Proposal";
import {
  User,
  UpdateUserArgs,
  CreateUserArgs,
  UsersArgs,
  BasicUserDetails
} from "../models/User";
import { Call } from "../models/Call";
import { FileMetadata } from "../models/Blob";
import { Page } from "../models/Admin";

interface ProposalArgs {
  id: string;
}

interface ProposalsArgs {
  first?: number;
  offset?: number;
  filter?: string;
}

interface FileMetadataArgs {
  fileIds: string[];
}

interface CreateProposalArgs {}

interface CreateCallArgs {
  shortCode: string;
  startCall: string;
  endCall: string;
  startReview: string;
  endReview: string;
  startNotify: string;
  endNotify: string;
  cycleComment: string;
  surveyComment: string;
}

interface UpdateProposalArgs {
  id: string;
  title: string;
  abstract: string;
  answers: ProposalAnswer[];
  status: number;
  topicsCompleted: number[];
  users: number[];
  proposerId: number;
  partialSave: boolean;
}

interface UpdateProposalFilesArgs {
  proposal_id: number;
  question_id: string;
  files: string[];
}

interface CreateTopicArgs {
  sortOrder: number;
}

interface UpdateTopicArgs {
  id: number;
  title: string;
  is_enabled: boolean;
}

interface UpdateFieldTopicRelArgs {
  topic_id: number;
  field_ids: string[];
}

interface DeleteTopicArgs {
  id: number;
}

interface UpdateTopicOrderArgs {
  topicOrder: number[];
}

interface DeleteProposalTemplateFieldArgs {
  id: string;
}

interface DeleteProposalArgs {
  id: number;
}

interface UpdateProposalTemplateFieldArgs {
  id: string;
  dataType: string;
  question: string;
  topicId: number;
  config: string;
  sortOrder: number;
  dependencies: FieldDependency[];
}

interface CreateProposalTemplateFieldArgs {
  topicId: number;
  dataType: string;
}

interface ApproveProposalArgs {
  id: number;
}

interface UserArgs {
  id: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface RolesArgs {}

enum PageName {
  HOMEPAGE = 1,
  HELPPAGE = 2,
  PRIVACYPAGE = 3,
  COOKIEPAGE = 4
}

async function resolveProposal(
  proposal: Proposal | null,
  context: ResolverContext
) {
  if (proposal == null) {
    return rejection("PROPOSAL_DOES_NOT_EXIST");
  }
  const { id, title, abstract, status, created, updated, shortCode } = proposal;
  const agent = context.user;

  if (!agent) {
    return rejection("NOT_AUTHORIZED");
  }

  const users = await context.queries.user.getProposers(agent, id);
  if (isRejection(users)) {
    return users;
  }

  const proposer = await context.queries.user.getBasic(
    agent,
    proposal.proposer
  );
  if (proposer === null) {
    return rejection("NO_PROPOSER_ON_THE_PROPOSAL");
  }

  const reviews = await context.queries.review.reviewsForProposal(agent, id);
  if (isRejection(reviews)) {
    return reviews;
  }

  const questionary = await context.queries.proposal.getQuestionary(agent, id);
  if (isRejection(questionary)) {
    return questionary;
  }

  return new ProposalInformation(
    id,
    title,
    abstract,
    proposer,
    status,
    created,
    updated,
    users,
    reviews,
    questionary!,
    shortCode
  );
}

function resolveProposals(
  proposals: { totalCount: number; proposals: Proposal[] } | null,
  context: ResolverContext
) {
  if (proposals == null) {
    return null;
  }

  return {
    totalCount: proposals.totalCount,
    proposals: proposals.proposals.map(proposal =>
      resolveProposal(proposal, context)
    )
  };
}

function createResponseWrapper<T>(key: string) {
  return async function(promise: Promise<T | Rejection>) {
    const result = await promise;
    if (isRejection(result)) {
      return {
        [key]: null,
        error: result.reason
      };
    } else {
      return {
        [key]: result,
        error: null
      };
    }
  };
}

const wrapFilesMutation = createResponseWrapper<string[]>("files");
const wrapProposalMutation = createResponseWrapper<Proposal>("proposal");
const wrapTopicMutation = createResponseWrapper<Topic>("topic");
const wrapProposalInformationMutation = createResponseWrapper<
  ProposalInformation
>("proposal");
const wrapUserMutation = createResponseWrapper<User>("user");
const wrapLoginMutation = createResponseWrapper<String>("token");
const wrapBasicUserDetailsMutation = createResponseWrapper<BasicUserDetails>(
  "template"
);
const wrapCallMutation = createResponseWrapper<Call>("call");
const wrapReviewMutation = createResponseWrapper<Review>("review");
const wrapPageTextMutation = createResponseWrapper<Page>("page");
const wrapProposalTemplateFieldMutation = createResponseWrapper<
  ProposalTemplateField
>("field");
const wrapProposalTemplateMutation = createResponseWrapper<ProposalTemplate>(
  "template"
);

export default {
  async proposal(args: ProposalArgs, context: ResolverContext) {
    const proposal = await context.queries.proposal.get(
      context.user,
      parseInt(args.id)
    );

    return resolveProposal(proposal, context);
  },

  async blankProposal(args: ProposalArgs, context: ResolverContext) {
    const proposal = await context.queries.proposal.getBlank(context.user);
    return resolveProposal(proposal, context);
  },

  async proposals(args: ProposalsArgs, context: ResolverContext) {
    const proposals = await context.queries.proposal.getAll(
      context.user,
      args.filter,
      args.first,
      args.offset
    );

    return resolveProposals(proposals, context);
  },

  async proposalTemplate(args: CreateProposalArgs, context: ResolverContext) {
    return context.queries.template.getProposalTemplate(context.user);
  },

  async createProposal(args: CreateProposalArgs, context: ResolverContext) {
    return wrapProposalInformationMutation(
      new Promise(async (resolve, reject) => {
        let newProposal = await context.mutations.proposal.create(context.user);
        if (isRejection(newProposal)) {
          return newProposal;
        }

        let newProposalInformation = await resolveProposal(
          newProposal,
          context
        );
        if (isRejection(newProposalInformation)) {
          return newProposalInformation;
        }

        resolve(newProposalInformation);
      })
    );
  },

  createTopic(args: CreateTopicArgs, context: ResolverContext) {
    return wrapProposalTemplateMutation(
      context.mutations.template.createTopic(context.user, args.sortOrder)
    );
  },

  updateTopic(args: UpdateTopicArgs, context: ResolverContext) {
    return wrapTopicMutation(
      context.mutations.template.updateTopic(
        context.user,
        args.id,
        args.title,
        args.is_enabled
      )
    );
  },

  updateFieldTopicRel(args: UpdateFieldTopicRelArgs, context: ResolverContext) {
    return createResponseWrapper<string[]>("result")(
      context.mutations.template.updateFieldTopicRel(
        context.user,
        args.topic_id,
        args.field_ids
      )
    );
  },

  deleteTopic(args: DeleteTopicArgs, context: ResolverContext) {
    return createResponseWrapper<Topic>("result")(
      context.mutations.template.deleteTopic(context.user, args.id)
    );
  },

  updateTopicOrder(args: UpdateTopicOrderArgs, context: ResolverContext) {
    return createResponseWrapper<number[]>("result")(
      context.mutations.template.updateTopicOrder(context.user, args.topicOrder)
    );
  },

  updateProposalTemplateField(
    args: UpdateProposalTemplateFieldArgs,
    context: ResolverContext
  ) {
    return wrapProposalTemplateMutation(
      context.mutations.template.updateProposalTemplateField(
        context.user,
        args.id,
        args.dataType as DataType,
        args.sortOrder,
        args.question,
        args.topicId,
        args.config,
        args.dependencies
      )
    );
  },
  createTemplateField(
    args: CreateProposalTemplateFieldArgs,
    context: ResolverContext
  ) {
    return wrapProposalTemplateFieldMutation(
      context.mutations.template.createTemplateField(
        context.user,
        args.topicId,
        args.dataType as DataType
      )
    );
  },

  deleteTemplateField(
    args: DeleteProposalTemplateFieldArgs,
    context: ResolverContext
  ) {
    return wrapProposalTemplateMutation(
      context.mutations.template.deleteTemplateField(context.user, args.id)
    );
  },

  updateProposal(args: UpdateProposalArgs, context: ResolverContext) {
    const {
      id,
      title,
      abstract,
      answers,
      topicsCompleted,
      status,
      users,
      proposerId,
      partialSave
    } = args;
    return wrapProposalMutation(
      context.mutations.proposal.update(
        context.user,
        id,
        title,
        abstract,
        answers,
        topicsCompleted,
        status,
        users,
        proposerId,
        partialSave
      )
    );
  },

  async updateProposalFiles(
    args: UpdateProposalFilesArgs,
    context: ResolverContext
  ) {
    const { proposal_id, question_id, files } = args;
    return await wrapFilesMutation(
      context.mutations.proposal.updateFiles(
        context.user,
        proposal_id,
        question_id,
        files
      )
    );
  },

  async fileMetadata(
    args: FileMetadataArgs,
    context: ResolverContext
  ): Promise<FileMetadata[]> {
    return await context.queries.file.getFileMetadata(args.fileIds);
  },

  approveProposal(args: ApproveProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.accept(context.user, args.id)
    );
  },

  rejectProposal(args: ApproveProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.reject(context.user, args.id)
    );
  },

  submitProposal(args: ApproveProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.submit(context.user, args.id)
    );
  },

  deleteProposal(args: DeleteProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.delete(context.user, args.id)
    );
  },

  review(args: { id: number }, context: ResolverContext) {
    return context.queries.review.get(context.user, args.id);
  },

  addReview(
    args: { reviewID: number; comment: string; grade: number },
    context: ResolverContext
  ) {
    return context.mutations.review.submitReview(
      context.user,
      args.reviewID,
      args.comment,
      args.grade
    );
  },

  addUserForReview(
    args: { userID: number; proposalID: number },
    context: ResolverContext
  ) {
    return wrapReviewMutation(context.mutations.review.addUserForReview(
      context.user,
      args.userID,
      args.proposalID
    ));
  },

  removeUserForReview(args: { reviewID: number }, context: ResolverContext) {
    return wrapReviewMutation(context.mutations.review.removeUserForReview(
      context.user,
      args.reviewID
    ));
  },

  login(args: LoginArgs, context: ResolverContext) {
    return wrapLoginMutation(
      context.mutations.user.login(args.email, args.password)
    );
  },

  token(args: { token: string }, context: ResolverContext) {
    return wrapLoginMutation(context.mutations.user.token(args.token));
  },

  user(args: UserArgs, context: ResolverContext) {
    return context.queries.user.get(context.user, parseInt(args.id));
  },

  basicUserDetails(args: UserArgs, context: ResolverContext) {
    return context.queries.user.getBasic(context.user, parseInt(args.id));
  },

  getOrcIDInformation(
    args: { authorizationCode: string },
    context: ResolverContext
  ) {
    return context.queries.user.getOrcIDInformation(args.authorizationCode);
  },

  users(args: UsersArgs, context: ResolverContext) {
    return context.queries.user.getAll(
      context.user,
      args.filter,
      args.first,
      args.offset,
      args.usersOnly,
      args.subtractUsers
    );
  },

  roles(_args: RolesArgs, context: ResolverContext) {
    return context.queries.user.getRoles(context.user);
  },

  async createUserByEmailInvite(
    args: { firstname: string; lastname: string; email: string },
    context: ResolverContext
  ) {
    const res = await context.mutations.user.createUserByEmailInvite(
      context.user,
      args.firstname,
      args.lastname,
      args.email
    );
    if (isRejection(res)) {
      return null;
    }
    return res.userId;
  },

  async createUser(args: CreateUserArgs, context: ResolverContext) {
    const res = await context.mutations.user.create(args);

    return wrapUserMutation(
      isRejection(res) ? Promise.resolve(res) : Promise.resolve(res.user)
    );
  },

  updateUser(args: UpdateUserArgs, context: ResolverContext) {
    return wrapUserMutation(context.mutations.user.update(context.user, args));
  },

  async resetPasswordEmail(args: { email: string }, context: ResolverContext) {
    const result = await context.mutations.user.resetPasswordEmail(args.email);
    return !isRejection(result);
  },

  resetPassword(
    args: { token: string; password: string },
    context: ResolverContext
  ) {
    return wrapBasicUserDetailsMutation(
      context.mutations.user.resetPassword(args.token, args.password)
    );
  },

  checkEmailExist(args: { email: string }, context: ResolverContext) {
    return context.queries.user.checkEmailExist(context.user, args.email);
  },

  updatePassword(
    args: { id: number; password: string },
    context: ResolverContext
  ) {
    return wrapBasicUserDetailsMutation(
      context.mutations.user.updatePassword(
        context.user,
        args.id,
        args.password
      )
    );
  },

  emailVerification(args: { token: string }, context: ResolverContext) {
    return context.mutations.user.emailVerification(args.token);
  },

  createCall(args: CreateCallArgs, context: ResolverContext) {
    return wrapCallMutation(
      context.mutations.call.create(
        context.user,
        args.shortCode,
        args.startCall,
        args.endCall,
        args.startReview,
        args.endReview,
        args.startNotify,
        args.endNotify,
        args.cycleComment,
        args.surveyComment
      )
    );
  },
  call(args: { id: number }, context: ResolverContext) {
    return context.queries.call.get(context.user, args.id);
  },
  calls(args: {}, context: ResolverContext) {
    return context.queries.call.getAll(context.user);
  },

  setPageContent(
    args: { id: PageName; text: string },
    context: ResolverContext
  ) {
    return wrapPageTextMutation(
      context.mutations.admin.setPageText(
        context.user,
        parseInt(PageName[args.id]),
        args.text
      )
    );
  },

  getPageContent(args: { id: PageName }, context: ResolverContext) {
    return context.queries.admin.getPageText(parseInt(PageName[args.id]));
  },
  getFields(args: {}, context: ResolverContext) {
    return {
      nationalities: () => context.queries.admin.getNationalities(),
      countries: () => context.queries.admin.getCountries(),
      institutions: () => context.queries.admin.getInstitutions()
    };
  }
};
