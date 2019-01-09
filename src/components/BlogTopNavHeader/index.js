import React, { PureComponent } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';

import BlogMenu from '../SiderMenu/BlogMenu';

import styles from './index.less';

class TopNavHeader extends PureComponent {
  state = {
    maxWidth: undefined,
  };

  static getDerivedStateFromProps(props) {
    return {
      maxWidth: (props.contentWidth === 'Fixed' ? 1200 : window.innerWidth) - 280 - 165 - 40,
    };
  }

  render() {
    const {
      logo,
      contentWidth,
      setting: { theme },
    } = this.props;

    const { maxWidth } = this.state;

    return (
      <div className={`${styles.head} ${theme === 'light' ? styles.light : ''}`}>
        <div className={`${styles.main} ${contentWidth === 'Fixed' ? styles.wide : ''}`}>
          <div className={styles.left}>
            <div className={styles.logo} key="logo" id="logo">
              <Link to="/">
                <img src={logo} alt="logo" />
                <h1>徐昭的个人博客</h1>
              </Link>
            </div>
            <div
              style={{
                maxWidth,
              }}
            >
              <BlogMenu {...this.props} className={styles.menu} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(({ setting }) => ({
  setting,
}))(TopNavHeader);
