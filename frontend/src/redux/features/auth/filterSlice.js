import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filteredUsers: []
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    FILTER_USERS(state, action) {
      
    }
  },
});
export default filterSlice.reducer;