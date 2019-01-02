import request from '@/utils/request';
import { stringify } from 'qs';
/* eslint-disable */
export async function queryPermissionList(params) {
  return request(`/api/account/permissions?${stringify(params)}`);
}
/* eslint-disable */
