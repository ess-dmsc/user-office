import { UserDataSource } from "../datasources/UserDataSource";

import createEmailHandler from "./email";
import createLoggingHandler from "./logging";
import createSDMHandler from "./sdm";

export default function createEventHandlers(userDataSource: UserDataSource) {
  return [
    createEmailHandler(userDataSource),
    createLoggingHandler(),
    createSDMHandler()
  ];
}