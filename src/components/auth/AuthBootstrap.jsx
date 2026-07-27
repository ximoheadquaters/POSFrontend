import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { authService, resolveSessionAuth } from "../../services/authService";
import { sessionCleared, sessionResolved } from "../../features/auth/authSlice";
import { initializeSession } from "../../features/auth/authThunk";

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeSession());
    const subscription = authService.onAuthStateChange((session) => {
      if (!session) {
        dispatch(sessionCleared());
        return;
      }
      resolveSessionAuth(session).then((auth) => {
        dispatch(sessionResolved(auth));
      });
    });
    return () => subscription.unsubscribe();
  }, [dispatch]);

  return children;
}
