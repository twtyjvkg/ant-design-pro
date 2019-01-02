import {
  queryUserList,
  queryCurrent,
  updateUser,
  deleteUser,
  updateCurrent,
  ModifyPassword,
} from '@/services/account/user';

export default {
  namespace: 'user',

  state: {
    userList: {
      list: [],
      count: 0,
    },
    currentUser: {},
  },

  effects: {
    *fetchUser({ payload }, { call, put }) {
      const response = yield call(queryUserList, payload);
      yield put({
        type: 'queryUser',
        payload: {
          /* eslint-disable */
          list: Array.isArray(response.results)
            ? response.results
            : Array.isArray(response)
            ? response
            : [],
          /* eslint-disable */
          count: response.count || response.length,
        },
      });
    },

    *updateUser({ payload, callback }, { call }) {
      const response = yield call(updateUser, payload);
      if (callback) callback(response);
    },

    *deleteUser({ payload, callback }, { call }) {
      const response = yield call(deleteUser, payload);
      if (callback) callback(response);
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
    queryUser(state, action) {
      return {
        ...state,
        userList: action.payload,
      };
    },
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
