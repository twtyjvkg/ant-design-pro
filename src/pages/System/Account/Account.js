import React, { PureComponent } from 'react';
import { Card } from 'antd';
import router from 'umi/router';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

class Account extends PureComponent {
  onTabChange = key => {
    const { match } = this.props;
    switch (key) {
      case 'users':
        router.push(`${match.url}/users`);
        break;
      case 'groups':
        router.push(`${match.url}/groups`);
        break;
      case 'permissions':
        router.push(`${match.url}/permissions`);
        break;
      case 'roles':
        router.push(`${match.url}/roles`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, location, children } = this.props;

    const accountTabList = [
      {
        key: 'users',
        tab: '用户',
      },
      {
        key: 'groups',
        tab: '组',
      },
      {
        key: 'permissions',
        tab: '权限',
      },
      {
        key: 'roles',
        tab: '角色',
      },
    ];

    return (
      <PageHeaderWrapper>
        <Card
          bordered={false}
          tabList={accountTabList}
          activeTabKey={location.pathname.replace(`${match.path}/`, '')}
          onTabChange={this.onTabChange}
        >
          {children}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Account;
