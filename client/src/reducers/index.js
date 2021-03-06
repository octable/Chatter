import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";

import authReducer from "./auth";
import decodeReducer from "./decodeData";
import loadUsersReducer from "./loadUsers";

export default combineReducers({
  form: formReducer,
  auth: authReducer,
  decode: decodeReducer,
  load: loadUsersReducer
});
