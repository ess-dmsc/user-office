import { BasicResolverContext } from './context';
// Site specific imports (only ESS atm)
import {
  adminDataSource,
  callDataSource,
  eventLogsDataSource,
  fileDataSource,
  proposalDataSource,
  reviewDataSource,
  sepDataSource,
  templateDataSource,
  userDataSource,
  instrumentDatasource,
  questionaryDataSource,
} from './datasources';
import AdminMutations from './mutations/AdminMutations';
import CallMutations from './mutations/CallMutations';
import FileMutations from './mutations/FileMutations';
import InstrumentMutations from './mutations/InstrumentMutations';
import ProposalMutations from './mutations/ProposalMutations';
import QuestionaryMutations from './mutations/QuestionaryMutations';
import ReviewMutations from './mutations/ReviewMutations';
import SEPMutations from './mutations/SEPMutations';
import TemplateMutations from './mutations/TemplateMutations';
import UserMutations from './mutations/UserMutations';
import AdminQueries from './queries/AdminQueries';
import CallQueries from './queries/CallQueries';
import EventLogQueries from './queries/EventLogQueries';
import FileQueries from './queries/FileQueries';
import InstrumentQueries from './queries/InstrumentQueries';
import ProposalQueries from './queries/ProposalQueries';
import QuestionaryQueries from './queries/QuestionaryQueries';
import ReviewQueries from './queries/ReviewQueries';
import SEPQueries from './queries/SEPQueries';
import TemplateQueries from './queries/TemplateQueries';
import UserQueries from './queries/UserQueries';
import { logger } from './utils/Logger';
import { questionaryAuthorization } from './utils/QuestionaryAuthorization';
import { userAuthorization } from './utils/UserAuthorization';

// From this point nothing is site-specific
const userQueries = new UserQueries(userDataSource);
const userMutations = new UserMutations(userDataSource, userAuthorization);

const proposalQueries = new ProposalQueries(
  proposalDataSource,
  callDataSource,
  userAuthorization
);
const proposalMutations = new ProposalMutations(
  proposalDataSource,
  questionaryDataSource,
  callDataSource,
  userAuthorization,
  logger
);

const reviewQueries = new ReviewQueries(reviewDataSource, userAuthorization);
const reviewMutations = new ReviewMutations(
  reviewDataSource,
  userAuthorization
);

const callQueries = new CallQueries(callDataSource);
const callMutations = new CallMutations(callDataSource);

const fileQueries = new FileQueries(fileDataSource);
const fileMutations = new FileMutations(fileDataSource);

const adminQueries = new AdminQueries(adminDataSource);
const adminMutations = new AdminMutations(adminDataSource);

const templateQueries = new TemplateQueries(templateDataSource);
const templateMutations = new TemplateMutations(templateDataSource);

const eventLogQueries = new EventLogQueries(eventLogsDataSource);

const sepQueries = new SEPQueries(sepDataSource);
const sepMutations = new SEPMutations(sepDataSource, userAuthorization);

const instrumentQueries = new InstrumentQueries(instrumentDatasource);
const instrumentMutations = new InstrumentMutations(instrumentDatasource);

const questionaryQueries = new QuestionaryQueries(
  questionaryDataSource,
  templateDataSource,
  questionaryAuthorization
);
const questionaryMutations = new QuestionaryMutations(
  questionaryDataSource,
  templateDataSource,
  questionaryAuthorization,
  logger
);

const context: BasicResolverContext = {
  userAuthorization,
  queries: {
    user: userQueries,
    proposal: proposalQueries,
    review: reviewQueries,
    call: callQueries,
    file: fileQueries,
    admin: adminQueries,
    template: templateQueries,
    eventLogs: eventLogQueries,
    sep: sepQueries,
    instrument: instrumentQueries,
    questionary: questionaryQueries,
  },
  mutations: {
    user: userMutations,
    proposal: proposalMutations,
    review: reviewMutations,
    call: callMutations,
    file: fileMutations,
    admin: adminMutations,
    sep: sepMutations,
    template: templateMutations,
    instrument: instrumentMutations,
    questionary: questionaryMutations,
  },
};

export default context;
