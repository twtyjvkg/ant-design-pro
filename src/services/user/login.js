import request from '@/utils/request';

export default async function accountLogin(params) {
  return request('/api/login', {
    method: 'POST',
    body: params,
  });
}
