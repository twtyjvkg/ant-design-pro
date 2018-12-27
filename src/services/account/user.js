import request from '@/utils/request';

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
