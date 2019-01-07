import React, { PureComponent } from 'react';
import { List, Icon, Tag, Button } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';

import ArticleListContent from '@/components/ArticleListContent';

import styles from './Articles.less';

@connect(({ list }) => ({
  list,
}))
class Center extends PureComponent {
  addArticle = e => {
    e.preventDefault();
    router.push('/blog/article/add');
  };

  render() {
    const {
      list: { list },
    } = this.props;
    const IconText = ({ type, text }) => (
      <span>
        <Icon type={type} style={{ marginRight: 8 }} />
        {text}
      </span>
    );
    return (
      <div>
        <Button
          type="dashed"
          style={{ width: '100%', marginBottom: 8 }}
          icon="plus"
          onClick={this.addArticle}
        >
          添加
        </Button>
        <List
          size="large"
          className={styles.articleList}
          rowKey="id"
          itemLayout="vertical"
          dataSource={list}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <IconText type="star-o" text={item.star} />,
                <IconText type="like-o" text={item.like} />,
                <IconText type="message" text={item.message} />,
              ]}
            >
              <List.Item.Meta
                title={
                  <a className={styles.listItemMetaTitle} href={item.href}>
                    {item.title}
                  </a>
                }
                description={
                  <span>
                    <Tag>Ant Design</Tag>
                    <Tag>设计语言</Tag>
                    <Tag>蚂蚁金服</Tag>
                  </span>
                }
              />
              <ArticleListContent data={item} />
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default Center;
