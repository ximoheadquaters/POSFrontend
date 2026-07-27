import {
  loginFailure,
  loginStart,
  loginSuccess,
  sessionCleared,
  sessionResolved,
} from "./authSlice";
import { authService, resolveSessionAuth } from "../../services/authService";

export const signIn = (email, password) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const session = await authService.signIn(email, password);
    const auth = await resolveSessionAuth(session);
    dispatch(loginSuccess(auth));
    return auth;
  } catch (error) {
    dispatch(loginFailure(error.message));
    throw error;
  }
};

export const signOut = () => async (dispatch) => {
  dispatch(loginStart());
  try {
    await authService.signOut();
    dispatch(sessionCleared());
  } catch (error) {
    dispatch(loginFailure(error.message));
    throw error;
  }
};

export const initializeSession = () => async (dispatch) => {
  try {
    const session = await authService.getSession();
    dispatch(sessionResolved(await resolveSessionAuth(session)));
  } catch (error) {
    dispatch(loginFailure(error.message));
  }
};
