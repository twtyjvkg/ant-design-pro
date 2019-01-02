import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

import police from '../../assets/police.png';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0 }}>
    <GlobalFooter
      // links={[
      //   {
      //     key: 'Pro 首页',
      //     title: 'Pro 首页',
      //     href: 'https://pro.ant.design',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'github',
      //     title: <Icon type="github" />,
      //     href: 'https://github.com/ant-design/ant-design-pro',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'Ant Design',
      //     title: 'Ant Design',
      //     href: 'https://ant.design',
      //     blankTarget: true,
      //   },
      // ]}
      beian={
        <Fragment>
          <a>鄂ICP备16009877号</a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42070402000086"
          >
            <img src={police} alt="police" />
            鄂公网安备42070402000086号
          </a>
        </Fragment>
      }
      copyright={
        <Fragment>
          Copyright <Icon type="copyright" /> 2018 断线的风筝
        </Fragment>
      }
    />
  </Footer>
);
export default FooterView;
