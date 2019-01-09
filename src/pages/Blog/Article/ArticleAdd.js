import React, { PureComponent } from 'react';
import { Form, Input, Switch, Button, Upload, Icon } from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import reqwest from 'reqwest';

import CategoryCascader from './CategoryCascader';
import TagSelect from './TagSelect';

import MarkdownEditor from '@/components/MarkdownEditor';

const FormItem = Form.Item;

@connect(({ loading }) => ({
  submitting: loading.effects['article/submitArticleForm'],
}))
@Form.create()
class ArticleAdd extends PureComponent {
  state = {
    storageSpace: undefined,
  };

  componentDidMount() {
    reqwest({
      url: '/api/attachment/storage_space?name=blog_attachments',
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (Array.isArray(res)) {
          this.setState({
            storageSpace: res[0] ? res[0].id : undefined,
          });
        }
      },
    });
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
        if (res.result) {
          callback(`标题为《${value}》的文章已存在`);
        }
        callback();
      },
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((error, fieldsValue) => {
      if (error) {
        return;
      }
      dispatch({
        type: 'article/submitArticleForm',
        payload: { ...fieldsValue },
        callback: () => {
          router.push('/blog/article/list');
        },
      });
    });
  };

  /* eslint-disable */
  handleAttachmentChange = info => {
    let fileList = info.fileList;
    fileList = fileList.slice(-2);
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    fileList = fileList.filter(file => {
      if (file.response) {
        return file.response.status === 'success';
      }
      return false;
    });
  };
  /* eslint-disable */

  render() {
    const {
      submitting,
      form: { getFieldDecorator },
    } = this.props;

    const { storageSpace } = this.state;

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

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label={<FormattedMessage id="form.article.title.label" />}>
          {getFieldDecorator('title', {
            rules: [
              {
                validator: this.titleValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder={formatMessage({ id: 'form.article.title.placeholder' })} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={<FormattedMessage id="form.article.body.label" />}>
          {getFieldDecorator('body', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'validation.article.body.required' }),
              },
            ],
          })(<MarkdownEditor />)}
        </FormItem>
        <FormItem {...formItemLayout} label={<FormattedMessage id="form.article.category.label" />}>
          {getFieldDecorator('category', {
            rules: [
              {
                required: true,
                message: '请选择文章分类',
              },
            ],
          })(<CategoryCascader />)}
        </FormItem>
        <FormItem {...formItemLayout} label={<FormattedMessage id="form.article.tag.label" />}>
          {getFieldDecorator('tags', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'validation.article.tags.required' }),
              },
            ],
          })(<TagSelect />)}
        </FormItem>
        <FormItem {...formItemLayout} label="附件">
          {storageSpace && (
            <Upload
              action="/api/attachment/attachments"
              name="file"
              data={{ directory: storageSpace }}
              multiple
              supportServerRender
              onChange={this.handleAttachmentChange}
              headers={{ Authorization: `JWT ${localStorage.getItem('antd-cms-token')}` }}
            >
              <Button>
                <Icon type="upload" />
                点击上传
              </Button>
            </Upload>
          )}
          {!storageSpace && (
            <span style={{ color: '#f00' }}>
              请联系管理员创建博客附件存储空间【blog_attachments】
            </span>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={<FormattedMessage id="form.article.status.label" />}>
          {getFieldDecorator('status', {
            initialValue: true,
          })(<Switch checkedChildren="发表" unCheckedChildren="草稿" defaultChecked />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="form.article.comment.status.label" />}
        >
          {getFieldDecorator('comment_status', {
            initialValue: true,
          })(
            <Switch
              checkedChildren={formatMessage({ id: 'app.settings.open' })}
              unCheckedChildren={formatMessage({ id: 'app.settings.close' })}
              defaultChecked
            />
          )}
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            <FormattedMessage id="form.submit" />
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default ArticleAdd;
