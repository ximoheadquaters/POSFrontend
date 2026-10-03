import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { authService, resolveSessionAuth } from "../../services/authService";
import {
  loginFailure,
  sessionCleared,
  sessionResolved,
} from "../../features/auth/authSlice";
import { initializeSession } from "../../features/auth/authThunk";
import { logStage } from "../../utils/logger";

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;
    let subscription;

    void Promise.resolve(dispatch(initializeSession())).catch((error) => {
      logStage("session initialization dispatch", error);
      if (active) dispatch(loginFailure(error.message));
    });

    const handleSession = async (session) => {
      if (!active) return;

      if (!session) {
        dispatch(sessionCleared());
        return;
      }

      try {
        const auth = await resolveSessionAuth(session);
        if (active) dispatch(sessionResolved(auth));
      } catch (error) {
        logStage("auth state update", error);
        if (active) dispatch(loginFailure(error.message));
      }
    };

    try {
      subscription = authService.onAuthStateChange((session) => {
        void handleSession(session);
      });
    } catch (error) {
      logStage("auth state listener", error);
      dispatch(loginFailure(error.message));
    }

    return () => {
      active = false;
      subscription?.unsubscribe?.();
    };
  }, [dispatch]);

  return children;
}
