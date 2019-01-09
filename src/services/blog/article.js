import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryArticleList(params) {
  return request(`/api/blog/articles?${stringify(params)}`);
}

export async function submitArticle(params) {
  const id = params.id * 1;
  if (id) {
    return request(`/api/blog/articles/${id}`, {
      method: 'PUT',
      body: params,
    });
  }
  return request('/api/blog/articles', {
    method: 'POST',
    body: params,
  });
}

export async function queryCurrentArticle(id) {
  return request(`/api/blog/articles/${id}`);
}
