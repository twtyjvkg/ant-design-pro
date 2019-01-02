import { queryPermissionList } from '@/services/account/permission';

export default {
  namespace: 'permission',

  state: {
    permissionList: {
      list: [],
      count: 0,
    },
  },

  effects: {
    *fetchPermission({ payload }, { call, put }) {
      const response = yield call(queryPermissionList, payload);
      yield put({
        type: 'queryPermission',
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
  },

  reducers: {
    queryPermission(state, action) {
      return {
        ...state,
        permissionList: action.payload,
      };
    },
  },
};
