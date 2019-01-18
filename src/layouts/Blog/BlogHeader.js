import React, { PureComponent } from 'react';
import { Layout } from 'antd';
import Animate from 'rc-animate';
import { connect } from 'dva';

import TopNavHeader from '@/components/BlogTopNavHeader';
import GlobalHeader from '@/components/GlobalHeader';

import styles from './BlogHeader.less';

const { Header } = Layout;

class HeaderView extends PureComponent {
  state = {
    visible: true,
  };

  static getDerivedStateFromProps(props, state) {
    if (!props.autoHideHeader && !state.visible) {
      return {
        visible: true,
      };
    }
    return null;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handScroll, { passive: true });
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handScroll);
  }

  handScroll = () => {
    const { autoHideHeader } = this.props;
    const { visible } = this.state;
    if (!autoHideHeader) {
      return;
    }
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        if (this.oldScrollTop > scrollTop) {
          this.setState({
            visible: true,
          });
        } else if (scrollTop > 300 && visible) {
          this.setState({
            visible: false,
          });
        } else if (scrollTop < 300 && !visible) {
          this.setState({
            visible: true,
          });
        }
        this.oldScrollTop = scrollTop;
        this.ticking = false;
      });
    }
  };

  render() {
    const { isMobile, setting } = this.props;
    const { navTheme, fixedHeader } = setting;
    const { visible } = this.state;
    const HeaderDom = visible ? (
      <Header style={{ padding: 0 }} className={fixedHeader ? styles.fixedHeader : ''}>
        {!isMobile ? (
          <TopNavHeader mode="horizontal" theme={navTheme} {...this.props} />
        ) : (
          <GlobalHeader {...this.props} />
        )}
      </Header>
    ) : null;
    return (
      <Animate component="" transitionName="fade">
        {HeaderDom}
      </Animate>
    );
  }
}

export default connect(({ setting }) => ({
  setting,
}))(HeaderView);
