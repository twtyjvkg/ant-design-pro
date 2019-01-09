import { queryCategoryList, submitCategory, deleteCategory } from '@/services/blog/category';

export default {
  namespace: 'category',

  state: {
    categoryList: {
      list: [],
      count: 0,
    },
  },

  effects: {
    *fetchCategory({ payload }, { call, put }) {
      const response = yield call(queryCategoryList, payload);
      yield put({
        type: 'queryCategory',
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
    *submitCategory({ payload, callback }, { call }) {
      const response = yield call(submitCategory, payload);
      if (callback) callback(response);
    },
    *deleteCategory({ payload, callback }, { call }) {
      yield call(deleteCategory, payload);
      if (callback) callback();
    },
  },

  reducers: {
    queryCategory(state, action) {
      return {
        ...state,
        categoryList: action.payload,
      };
    },
  },
};
