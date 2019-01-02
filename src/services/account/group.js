import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryGroupList(params) {
  return request(`/api/account/groups?${stringify(params)}`);
}

export async function submitGroup(params) {
  return request('/api/account/groups', {
    method: 'POST',
    body: params,
  });
}

export async function updateGroup(params) {
  return request(`/api/account/groups/${params.id}`, {
    method: 'PATCH',
    body: params,
  });
}

export async function deleteGroup(id) {
  return request(`/api/account/groups/${id}`, {
    method: 'DELETE',
  });
}
