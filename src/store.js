import { configureStore, createSlice } from '@reduxjs/toolkit'

let user = createSlice({
  name : 'user',
  initialState : {id: ""},
  reducers : {
    setUserId(state, action){
        state.id = action.payload;
    }
}
});

const store = configureStore({
  reducer: {
    user : user.reducer
  }
});

export {store};
export let { setUserId } = user.actions;