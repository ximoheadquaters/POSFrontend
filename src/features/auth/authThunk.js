import {
  loginFailure,
  loginStart,
  loginSuccess,
  sessionCleared,
  sessionResolved,
} from "./authSlice";
import { authService, resolveSessionAuth } from "../../services/authService";
import { logStage } from "../../utils/logger";

// Authentication should never hold the entire application on a loading screen.
// Supabase normally resolves from local storage immediately, but a stale browser
// connection can otherwise leave the initial role lookup pending indefinitely.
const INITIAL_SESSION_TIMEOUT_MS = 6_000;

function resolveInitialSession() {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(
        "Session setup took too long. Please sign in again.",
      );
      error.code = "AUTH_INITIALIZATION_TIMEOUT";
      reject(error);
    }, INITIAL_SESSION_TIMEOUT_MS);
  });

  const session = (async () => {
    const currentSession = await authService.getSession();
    return resolveSessionAuth(currentSession);
  })();

  return Promise.race([session, timeout]).finally(() => clearTimeout(timeoutId));
}

export const signIn = (email, password) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const session = await authService.signIn(email, password);
    const auth = await resolveSessionAuth(session);
    dispatch(loginSuccess(auth));
    return auth;
  } catch (error) {
    logStage("sign in", error);
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
    logStage("sign out", error);
    dispatch(loginFailure(error.message));
    throw error;
  }
};

export const initializeSession = () => async (dispatch) => {
  try {
    dispatch(sessionResolved(await resolveInitialSession()));
  } catch (error) {
    logStage("session initialization", error);
    dispatch(loginFailure(error.message));
  }
};
