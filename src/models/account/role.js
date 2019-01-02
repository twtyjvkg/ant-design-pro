import { queryRoleList, submitRole, deleteRole } from '@/services/account/role';

export default {
  namespace: 'role',

  state: {
    roleList: {
      list: [],
      count: 0,
    },
  },

  effects: {
    *fetchRole({ payload }, { call, put }) {
      const response = yield call(queryRoleList, payload);
      yield put({
        type: 'queryRole',
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
    *submitRoleForm({ payload, callback }, { call }) {
      const response = yield call(submitRole, payload);
      if (callback) callback(response);
    },
    *deleteRole({ payload, callback }, { call }) {
      yield call(deleteRole, payload);
      if (callback) callback();
    },
  },

  reducers: {
    queryRole(state, action) {
      return {
        ...state,
        roleList: action.payload,
      };
    },
  },
};
