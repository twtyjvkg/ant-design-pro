import {
  query as queryUsers,
  queryCurrent,
  updateCurrent,
  ModifyPassword,
} from '@/services/account/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },

    *updateCurrent({ payload }, { call, put }) {
      const response = yield call(updateCurrent, payload);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },

    *modifyPassword({ payload, callback }, { call }) {
      const response = yield call(ModifyPassword, payload);
      if (callback) callback(response || {});
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
