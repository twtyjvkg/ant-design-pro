import request from '@/utils/request';

export async function accountLogin(params) {
  return request('/api/login', {
    method: 'POST',
    body: params,
  });
}

export async function accountRegister(params) {
  return request('/api/account/users', {
    method: 'POST',
    body: params,
  });
}
