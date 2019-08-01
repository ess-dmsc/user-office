import { ResolverContext } from "../context";
import { isRejection, Rejection } from "../rejection";
import { Proposal } from "../models/Proposal";
import { User } from "../models/User";

interface ProposalArgs {
  id: string;
}

interface ProposalsArgs {
  first?: number;
  offset?: number;
  filter?: string;
}

interface CreateProposalArgs {}

interface UpdateProposalArgs {
  id: string;
  title: string;
  abstract: string;
  status: number;
  users: number[];
}

interface UpdateUserArgs {
  id: string;
  firstname: string;
  lastname: string;
  roles: number[];
}

interface ApproveProposalArgs {
  id: number;
}

interface UserArgs {
  id: string;
}

interface LoginArgs {
  username: string;
  password: string;
}

interface AddUserRoleArgs {
  userID: number;
  roleID: number;
}

interface UsersArgs {
  first?: number;
  offset?: number;
  filter?: string;
}

interface RolesArgs {}

interface CreateUserArgs {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
}

function resolveProposal(proposal: Proposal | null, context: ResolverContext) {
  if (proposal == null) {
    return null;
  }

  const { id, title, abstract, status, created, updated } = proposal;
  const agent = context.user;

  return {
    id,
    title,
    abstract,
    status,
    created,
    updated,
    user: () => context.queries.user.getProposers(agent, id),
    reviews: () => context.queries.review.reviewsForProposal(agent, id)
  };
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

function createMutationWrapper<T>(key: string) {
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

const wrapProposalMutation = createMutationWrapper<Proposal>("proposal");
const wrapUserMutation = createMutationWrapper<User>("user");

export default {
  async proposal(args: ProposalArgs, context: ResolverContext) {
    const proposal = await context.queries.proposal.get(
      context.user,
      parseInt(args.id)
    );

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

  createProposal(args: CreateProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.create(context.user)
    );
  },

  updateProposal(args: UpdateProposalArgs, context: ResolverContext) {
    const { id, title, abstract, status, users } = args;
    return wrapProposalMutation(
      context.mutations.proposal.update(
        context.user,
        id,
        title,
        abstract,
        status,
        users
      )
    );
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
    return context.mutations.review.addUserForReview(
      context.user,
      args.userID,
      args.proposalID
    );
  },

  login(args: LoginArgs, context: ResolverContext) {
    return context.mutations.user.login(args.username, args.password);
  },

  user(args: UserArgs, context: ResolverContext) {
    return context.queries.user.get(context.user, parseInt(args.id));
  },

  users(args: UsersArgs, context: ResolverContext) {
    return context.queries.user.getAll(
      context.user,
      args.filter,
      args.first,
      args.offset
    );
  },

  roles(_args: RolesArgs, context: ResolverContext) {
    return context.queries.user.getRoles(context.user);
  },

  createUser(args: CreateUserArgs, context: ResolverContext) {
    return wrapUserMutation(
      context.mutations.user.create(
        args.firstname,
        args.lastname,
        args.username,
        args.password
      )
    );
  },

  updateUser(args: UpdateUserArgs, context: ResolverContext) {
    return wrapUserMutation(
      context.mutations.user.update(
        context.user,
        args.id,
        args.firstname,
        args.lastname,
        args.roles
      )
    );
  }
};
