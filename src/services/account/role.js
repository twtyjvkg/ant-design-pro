import request from '@/utils/request';
import { stringify } from 'qs';

const baseUrl = '/api/account/system_roles';

export async function queryRoleList(params) {
  return request(`${baseUrl}?${stringify(params)}`);
}

export async function submitRole(params) {
  const id = params.id * 1;
  if (id) {
    return request(`${baseUrl}/${params.id}`, {
      method: 'PATCH',
      body: params,
    });
  }
  return request(baseUrl, {
    method: 'POST',
    body: params,
  });
}

export async function deleteRole(id) {
  return request(`${baseUrl}/${id}`, {
    method: 'DELETE',
  });
}
