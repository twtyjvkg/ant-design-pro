import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryTagList(params) {
  return request(`/api/blog/tags?${stringify(params)}`);
}

export async function submitTag(params) {
  const id = params.id * 1;
  if (id) {
    return null;
  }
  return request('/api/blog/tags', {
    method: 'POST',
    body: params,
  });
}
