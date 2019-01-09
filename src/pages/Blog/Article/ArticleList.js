import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { findDOMNode } from 'react-dom';
import moment from 'moment';
import { Card, Row, Col, Form, Input, List, Tag, Button, message } from 'antd';
import router from 'umi/router';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './ArticleList.less';

const { Search } = Input;

@connect(({ article, user, loading }) => ({
  article,
  user,
  loading: loading.models.article,
}))
@Form.create()
class ArticleList extends PureComponent {
  state = { articlePageSize: 5, currentPage: 1 };

  componentDidMount() {
    const { dispatch } = this.props;
    const { articlePageSize } = this.state;
    dispatch({
      type: 'user/fetchCurrent',
    });
    dispatch({
      type: 'article/fetchArticle',
      payload: {
        page_size: articlePageSize,
      },
    });
  }

  addArticle = () => {
    router.push('/blog/article/add');
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { current } = this.state;
    const id = current ? current.id : '';

    setTimeout(() => this.addBtn.blur(), 0);
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.handleDone();
      dispatch({
        type: 'article/submitArticleForm',
        payload: { id, ...fieldsValue },
        callback: () => {
          message.success('提交成功');
          this.addBtn.blur();
        },
      });
    });
  };

  pageChange = (current, pageSize) => {
    this.setState({ currentPage: current });
    const { dispatch } = this.props;
    dispatch({
      type: 'article/fetchArticle',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  showSizeChange = (current, pageSize) => {
    const { dispatch } = this.props;
    this.setState({ articlePageSize: pageSize, currentPage: current });
    dispatch({
      type: 'article/fetchArticle',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  render() {
    const {
      article: { articleList },
      user: { currentUser },
      loading,
    } = this.props;

    const { articlePageSize, currentPage } = this.state;

    const articleDetail = currentItem => {
      router.push(`/blog/article/detail/${currentItem.id}`);
    };

    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );

    const extraContent = (
      <div className={styles.extraContent}>
        <Search className={styles.extraContentSearch} placeholder="请输入" onSearch={() => ({})} />
      </div>
    );

    const paginationProps = totalSize => ({
      showSizeChanger: true,
      showQuickJumper: true,
      pageSize: articlePageSize,
      current: currentPage,
      onShowSizeChange: this.showSizeChange,
      pageSizeOptions: ['5', '10', '20', '30', '40', '100'],
      onChange: this.pageChange,
      total: totalSize,
    });
    /* eslint-disable */
    const ListContent = ({ data: { author, category, publish_time } }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <span>
            <b>分类</b>
          </span>
          <p>{category.level3.label}</p>
        </div>
        <div className={styles.listContentItem}>
          <span>
            <b>作者</b>
          </span>
          <p>{author.name}</p>
        </div>
        <div className={styles.listContentItem}>
          <span>
            <b>发表时间</b>
          </span>
          <p>{moment(publish_time).format('YYYY-MM-DD HH:mm')}</p>
        </div>
      </div>
    );
    /* eslint-disable */

    return (
      <PageHeaderWrapper>
        <div className={styles.standardList}>
          <Card bordered={false}>
            <Row>
              <Col sm={8} xs={24}>
                <Info title="我的文章" value={currentUser.article_count} bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="我的分类" value={currentUser.category_count} bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="我的标签" value={currentUser.tag_count} />
              </Col>
            </Row>
          </Card>

          <Card
            className={styles.listCard}
            bordered={false}
            title="文章列表"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={extraContent}
          >
            <Button
              type="dashed"
              style={{ width: '100%', marginBottom: 8 }}
              icon="plus"
              onClick={this.addArticle}
              ref={component => {
                /* eslint-disable */
                this.addBtn = findDOMNode(component);
                /* eslint-enable */
              }}
            >
              添加
            </Button>
            <List
              itemLayout="vertical"
              size="large"
              rowKey="id"
              loading={loading}
              pagination={paginationProps(articleList.count)}
              dataSource={articleList.list}
              renderItem={item => (
                <List.Item
                  actions={[
                    <div style={{ paddingTop: 5 }}>
                      <span>标签：</span>
                      {item.tags.map(tag => (
                        <Tag key={tag.id}>{tag.name}</Tag>
                      ))}
                    </div>,
                  ]}
                  extra={<ListContent data={item} />}
                  /* eslint-disable */
                  onDoubleClick={articleDetail.bind(this, item)}
                  /* eslint-disable */
                >
                  <List.Item.Meta title={<b>{item.title}</b>} description={item.body} />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default ArticleList;
