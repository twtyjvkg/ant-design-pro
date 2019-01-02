import { queryGroupList, updateGroup, submitGroup, deleteGroup } from '@/services/account/group';

export default {
  namespace: 'group',

  state: {
    groupList: {
      list: [],
      count: 0,
    },
  },

  effects: {
    *fetchGroup({ payload }, { call, put }) {
      const response = yield call(queryGroupList, payload);
      yield put({
        type: 'queryGroup',
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
    *updateGroup({ payload, callback }, { call }) {
      const response = yield call(updateGroup, payload);
      if (callback) callback(response);
    },
    *submitGroup({ payload, callback }, { call }) {
      const response = yield call(submitGroup, payload);
      if (callback) callback(response);
    },
    *deleteGroup({ payload, callback }, { call }) {
      yield call(deleteGroup, payload);
      if (callback) callback();
    },
  },

  reducers: {
    queryGroup(state, action) {
      return {
        ...state,
        groupList: action.payload,
      };
    },
  },
};
