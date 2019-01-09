import { queryArticleList, submitArticle, queryCurrentArticle } from '../../services/blog/article';

export default {
  namespace: 'article',

  state: {
    articleList: {
      list: [],
      count: 0,
    },
    currentArticle: {},
  },

  effects: {
    *fetchArticle({ payload }, { call, put }) {
      const response = yield call(queryArticleList, payload);
      yield put({
        type: 'queryArticle',
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
    *fetchCurrentArticle({ payload }, { call, put }) {
      const response = yield call(queryCurrentArticle, payload);
      yield put({
        type: 'queryCurrent',
        payload: response,
      });
    },
    *submitArticle({ payload, callback }, { call, put }) {
      yield call(submitArticle, payload);
      if (callback) callback();
      const response = yield call(queryArticleList);
      yield put({
        type: 'queryArticle',
        payload: {
          list: Array.isArray(response.results) ? response.results : [],
          count: response.count,
        },
      });
    },
    *validateArticleTitle({ payload, callback }, { call }) {
      const response = yield call(validateTitle, payload);
      if (callback) callback(response.result);
    },
  },

  reducers: {
    queryArticle(state, action) {
      return {
        ...state,
        articleList: action.payload,
      };
    },
    queryCurrent(state, action) {
      return {
        ...state,
        currentArticle: action.payload || {},
      };
    },
  },
};
