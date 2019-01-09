import { queryTagList, submitTag } from '../../services/blog/tag';

export default {
  namespace: 'tag',

  state: {
    tagList: {
      list: [],
      count: 0,
    },
    isLoading: false,
  },

  effects: {
    *fetchTag({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(queryTagList, payload);
      yield put({
        type: 'queryTag',
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
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *submitTag({ payload, callback }, { call }) {
      const response = yield call(submitTag, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    changeLoading(state, action) {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
    queryTag(state, action) {
      return {
        ...state,
        tagList: action.payload,
      };
    },
  },
};
