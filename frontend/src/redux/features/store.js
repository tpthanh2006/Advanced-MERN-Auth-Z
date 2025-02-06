import authReducer from "../redux/features/auth/authSlice";
import { configureStore} from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    auth: authReducer
  }
})