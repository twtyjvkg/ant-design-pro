import React, { PureComponent } from 'react';
import { Menu } from 'antd';

import classNames from 'classnames';

export default class BlogMenu extends PureComponent {
  render() {
    const { theme, mode, className } = this.props;

    const cls = classNames(className, {
      'top-nav-menu': mode === 'horizontal',
    });

    return <Menu key="Menu" mode={mode} theme={theme} className={cls} />;
  }
}
