import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryCategoryList(params) {
  return request(`/api/blog/categories?${stringify(params)}`);
}

export async function submitCategory(params) {
  const id = params.id * 1;
  if (id) {
    return request(`/api/blog/categories/${params.id}`, {
      method: 'PATCH',
      body: params,
    });
  }
  return request('/api/blog/categories', {
    method: 'POST',
    body: params,
  });
}

export async function deleteCategory(id) {
  return request(`/api/blog/categories/${id}`, {
    method: 'DELETE',
  });
}
