import { configureStore, createSlice, current } from '@reduxjs/toolkit'

let user = createSlice({
  name : 'user',
  initialState : {id: "", profile_img: ""},
  reducers : {
    setUserId(state, action){
        state.id = action.payload;
    },
    setProfileImg(state, action){
        state.profile_img = action.payload;
    }
}
});

let FriendInfo = createSlice({
  name : 'friendInfo',
  initialState: {},
  reducers : {
    FriendInfoSet(state, action){
      state[action.payload[0]] = action.payload[1];
      console.log('FriendInfoSet', current(state))
    },
    FriendInfoChange(state, action){
      if (state[action.payload[0]] !== undefined){
        state[action.payload[0]] = action.payload[1];
        console.log('friendinfochange test:',current(state));
      }
    },
    FriendInfoReset(state, action){
      state = {};
    }
  }
})

const store = configureStore({
  reducer: {
    user : user.reducer,
    FriendInfo : FriendInfo.reducer
  }
});

export {store};
export let { setUserId, setProfileImg } = user.actions;
export let { FriendInfoSet, FriendInfoChange, FriendInfoReset } = FriendInfo.actions;