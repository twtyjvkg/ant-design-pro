import React, { PureComponent } from 'react';
import { Form, Card, Input, Switch, Button, Spin } from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import reqwest from 'reqwest';

import CategoryCascader from './CategoryCascader';
import TagSelect from './TagSelect';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import MarkdownEditor from '@/components/MarkdownEditor';

const FormItem = Form.Item;

@connect(({ article, loading }) => ({
  article,
  currentArticleLoading: loading.effects['article/fetchCurrentArticle'],
  submitting: loading.effects['article/submitArticleForm'],
}))
@Form.create()
class ArticleDetail extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    if (params.id) {
      dispatch({
        type: 'article/fetchCurrentArticle',
        payload: params.id,
      });
    }
  }

  titleValidator = (rule, value, callback) => {
    if (!value) {
      callback(formatMessage({ id: 'validation.article.title.required' }));
    }
    reqwest({
      url: `/api/blog/exist?model=article&title=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        const {
          match: { params },
        } = this.props;
        if (res.result && res.id !== params.id * 1) {
          callback(`标题为《${value}》的文章已存在`);
        }
        callback();
      },
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      dispatch,
      form,
      article: { currentArticle },
    } = this.props;
    const id = currentArticle ? currentArticle.id : '';
    form.validateFieldsAndScroll((error, fieldsValue) => {
      if (error) {
        return;
      }
      dispatch({
        type: 'article/submitArticleForm',
        payload: { id, ...fieldsValue },
        callback: () => {
          router.push('/blog/article/list');
        },
      });
    });
  };

  render() {
    const {
      submitting,
      article: { currentArticle },
      currentArticleLoading,
    } = this.props;

    const {
      form: { getFieldDecorator },
    } = this.props;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    const onStatusChange = checked => {
      currentArticle.status = checked;
    };

    const onCommentStatusChange = checked => {
      currentArticle.comment_status = checked;
    };

    return (
      <PageHeaderWrapper title={<FormattedMessage id="app.blog.article.detail" />}>
        <Card bordered={false}>
          <Spin spinning={currentArticleLoading}>
            <Form onSubmit={this.handleSubmit}>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="form.article.title.label" />}
              >
                {getFieldDecorator('title', {
                  initialValue: currentArticle.title,
                  rules: [
                    {
                      validator: this.titleValidator,
                    },
                  ],
                  validateTrigger: 'onBlur',
                })(<Input placeholder={formatMessage({ id: 'form.article.title.placeholder' })} />)}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="form.article.body.label" />}
              >
                {getFieldDecorator('body', {
                  initialValue: currentArticle.body,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'validation.article.body.required' }),
                    },
                  ],
                })(<MarkdownEditor />)}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="form.article.category.label" />}
              >
                {getFieldDecorator('category', {
                  initialValue: currentArticle.category,
                  rules: [
                    {
                      required: true,
                      message: '请选择文章分类',
                    },
                  ],
                })(<CategoryCascader />)}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="form.article.tag.label" />}
              >
                {getFieldDecorator('tags', {
                  initialValue: currentArticle.tags ? currentArticle.tags.map(item => item.id) : [],
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'validation.article.tags.required' }),
                    },
                  ],
                })(<TagSelect />)}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="form.article.status.label" />}
              >
                {getFieldDecorator('status', {
                  initialValue: currentArticle.status,
                })(
                  <Switch
                    checkedChildren="发表"
                    unCheckedChildren="草稿"
                    checked={currentArticle.status}
                    onChange={onStatusChange}
                  />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="form.article.comment.status.label" />}
              >
                {getFieldDecorator('comment_status', {
                  initialValue: currentArticle.comment_status,
                })(
                  <Switch
                    checkedChildren={formatMessage({ id: 'app.settings.open' })}
                    unCheckedChildren={formatMessage({ id: 'app.settings.close' })}
                    checked={currentArticle.comment_status}
                    onChange={onCommentStatusChange}
                  />
                )}
              </FormItem>
              <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  <FormattedMessage id="form.submit" />
                </Button>
              </FormItem>
            </Form>
          </Spin>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ArticleDetail;
