import React, { PureComponent } from 'react';
import { Card } from 'antd';
import router from 'umi/router';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

class Blog extends PureComponent {
  onTabChange = key => {
    const { match } = this.props;
    switch (key) {
      case 'article':
        router.push(`${match.url}/article`);
        break;
      case 'category':
        router.push(`${match.url}/category`);
        break;
      case 'tag':
        router.push(`${match.url}/tag`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, location, children } = this.props;

    const BlogTabList = [
      {
        key: 'article',
        tab: '文章',
      },
      {
        key: 'category',
        tab: '分类',
      },
      {
        key: 'tag',
        tab: '标签',
      },
    ];

    return (
      <PageHeaderWrapper>
        <Card
          bordered={false}
          tabList={BlogTabList}
          activeTabKey={location.pathname.replace(`${match.path}/`, '')}
          onTabChange={this.onTabChange}
        >
          {children}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Blog;
