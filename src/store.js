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

let gameInfo = createSlice({
  name : 'gameInfo',
  initialState : [null, 1],
  reducers : {
    turnStatusChange(state, action){
      state[0] = action.payload;
      console.log(current(state));
    },
    surviveStatusChange(state, action){
      state[1] = action.payload;
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
      return {};
    }
  }
})

let videoInfo = createSlice({
  name : 'videoInfo',
  initialState : {stream: ""},
  reducers : {
    VideoStreamChange(state, action){
        state.stream = action.payload;
    }
}
});



const store = configureStore({
  reducer: {
    user : user.reducer,
    FriendInfo : FriendInfo.reducer,
    gameInfo : gameInfo.reducer,
    videoInfo : videoInfo.reducer
  },

  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false
  }),
});

export {store};

export let { setUserId, setProfileImg } = user.actions;
export let { FriendInfoSet, FriendInfoChange, FriendInfoReset } = FriendInfo.actions;
export let { turnStatusChange, surviveStatusChange } = gameInfo.actions;
export let { VideoStreamChange } = videoInfo.actions;
