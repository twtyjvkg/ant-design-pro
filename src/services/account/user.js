import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryUserList(params) {
  return request(`/api/account/users?${stringify(params)}`);
}

export async function updateUser(params) {
  return request(`/api/account/users/${params.id}`, {
    method: 'PATCH',
    body: params,
  });
}

export async function deleteUser(id) {
  return request(`/api/account/users/${id}`, {
    method: 'DELETE',
  });
}

export async function queryCurrent() {
  return request('/api/account/current/1');
}

export async function updateCurrent(params) {
  return request('/api/account/current/1', {
    method: 'PATCH',
    body: params,
  });
}

export async function ModifyPassword(params) {
  return request('/api/account/password_modify', {
    method: 'POST',
    body: params,
  });
}

export async function accountLogin(params) {
  return request('/api/login', {
    method: 'POST',
    body: params,
  });
}
