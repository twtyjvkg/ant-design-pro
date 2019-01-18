import React, { PureComponent } from 'react';
import { Layout, Card } from 'antd';
import { connect } from 'dva';

import styles from './BlogSider.less';

const { Sider } = Layout;

class SiderView extends PureComponent {
  render() {
    const { width } = this.props;

    return (
      <Sider className={styles.sider} width={width} theme="light">
        <Card title={<strong>系统公告</strong>} className={styles.siderCard} bordered={false}>
          <p>测试</p>
        </Card>
        <Card title={<strong>热门文章</strong>} className={styles.siderCard} bordered={false}>
          <p>测试</p>
        </Card>
        <Card title={<strong>热门标签</strong>} className={styles.siderCard} bordered={false}>
          <p>测试</p>
        </Card>
      </Sider>
    );
  }
}

export default connect(({ setting }) => ({
  setting,
}))(SiderView);
