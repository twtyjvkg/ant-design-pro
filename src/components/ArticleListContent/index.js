import React from 'react';
import moment from 'moment';
import { Avatar } from 'antd';
import styles from './index.less';

/* eslint-disable */
const ArticleListContent = ({
  data: {
    body,
    publish_time,
    author,
    href,
    category: { level1, level2, level3 },
  },
}) => (
  <div className={styles.listContent}>
    <div className={styles.description}>{body}</div>
    <div className={styles.extra}>
      <Avatar src={author.avatar} size="small" />
      <a href={href}>{author.name}</a> 发布在{' '}
      <a href={href}>{`${level1.label}/${level2.label}/${level3.label}`}</a>
      <em>{moment(publish_time).format('YYYY-MM-DD HH:mm')}</em>
    </div>
  </div>
);
/* eslint-disable */

export default ArticleListContent;
