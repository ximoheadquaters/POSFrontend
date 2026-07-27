import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth } from "../features/auth/authSelectors";
import {
  signIn as signInThunk,
  signOut as signOutThunk,
} from "../features/auth/authThunk";
import { clearError } from "../features/auth/authSlice";

export default function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  return {
    ...auth,
    signIn: useCallback(
      (email, password) => dispatch(signInThunk(email, password)),
      [dispatch],
    ),
    signOut: useCallback(() => dispatch(signOutThunk()), [dispatch]),
    clearError: useCallback(() => dispatch(clearError()), [dispatch]),
  };
}
