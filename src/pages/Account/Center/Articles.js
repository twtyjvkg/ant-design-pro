import React, { PureComponent } from 'react';
import { List, Icon, Tag, Button } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';

import ArticleListContent from '@/components/ArticleListContent';

import styles from './Articles.less';

@connect(({ article }) => ({
  article,
}))
class Center extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'article/fetchArticle',
    });
  }

  addArticle = e => {
    e.preventDefault();
    router.push('/blog/article/add');
  };

  render() {
    const {
      article: { articleList },
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
          dataSource={articleList.list}
          renderItem={item => (
            <List.Item key={item.id} actions={[<IconText type="eye-o" text={item.views} />]}>
              <List.Item.Meta
                title={
                  <a className={styles.listItemMetaTitle} href={item.href}>
                    {item.title}
                  </a>
                }
                description={
                  <span>
                    {item.tags.map(tag => (
                      <Tag key={tag.id}>{tag.name}</Tag>
                    ))}
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
