import React, { PureComponent } from 'react';
import { Select, Form, Spin, Icon, Modal, Input, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import reqwest from 'reqwest';

import styles from './TagSelect.less';

const { Option } = Select;
const FormItem = Form.Item;

@connect(({ tag }) => {
  const { isLoading } = tag;
  return {
    isLoading,
  };
})
@Form.create()
class TagSelect extends PureComponent {
  state = {
    visible: false,
    confirmLoading: false,
    tagList: [],
    selected: undefined,
  };

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    this.onTagSelectVisibleChange(true);
    this.setState({
      selected: value,
    });
  }

  getOption = () => {
    const { tagList } = this.state;
    if (!tagList || tagList.length < 1) {
      return (
        <Option key={0} value={0}>
          没有找到选项
        </Option>
      );
    }
    return tagList.map(item => (
      <Option key={item.id} value={item.id}>
        {item.name}
      </Option>
    ));
  };

  onTagChange = value => {
    this.setState({
      selected: value,
    });
    const { onChange } = this.props;
    onChange(value);
  };

  onTagSelectVisibleChange = open => {
    if (open) {
      reqwest({
        url: `/api/blog/model?model=tag`,
        type: 'json',
        headers: {
          Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
        },
        method: 'get',
        contentType: 'application/json',
        success: res => {
          this.setState({
            tagList: Array.isArray(res) ? res : [],
          });
        },
      });
    }
  };

  showTagModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.setState({
      confirmLoading: true,
    });
    const { dispatch, form } = this.props;
    const id = '';
    form.validateFields((error, fieldsValue) => {
      if (error) {
        this.setState({
          confirmLoading: false,
        });
        return;
      }
      dispatch({
        type: 'tag/submitTagForm',
        payload: {
          id,
          name: fieldsValue.tag,
        },
        callback: response => {
          const { selected } = this.state;
          this.setState({
            confirmLoading: false,
            visible: false,
            tagList: [response],
            selected: [response.id, ...selected],
          });
          const { onChange } = this.props;
          onChange([response.id, ...selected]);
        },
      });
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      confirmLoading: false,
    });
  };

  tagValidator = (rule, value, callback) => {
    if (!value) {
      callback(formatMessage({ id: 'validation.article.tag.required' }));
    }
    reqwest({
      url: `/api/blog/exist?model=tag&name=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result) {
          callback(`名称为《${value}》的标签已存在`);
        }
        callback();
      },
    });
  };

  render() {
    const { isLoading } = this.props;
    const { visible, confirmLoading, selected } = this.state;

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

    const modalFooter = { okText: '保存', onOk: this.handleSubmit, onCancel: this.handleCancel };

    const getModalContent = () => (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label={<FormattedMessage id="form.article.tag.label" />}>
          {getFieldDecorator('tag', {
            rules: [
              {
                required: true,
                validator: this.tagValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder={formatMessage({ id: 'form.article.tag.label.placeholder' })} />)}
        </FormItem>
      </Form>
    );

    return (
      <Spin spinning={isLoading} wrapperClassName={styles.row}>
        <Select
          mode="multiple"
          placeholder={formatMessage({ id: 'form.article.tags.label.placeholder' })}
          className={styles.item}
          onChange={this.onTagChange}
          onDropdownVisibleChange={this.onTagSelectVisibleChange}
          value={selected}
        >
          {this.getOption()}
        </Select>
        <Tooltip title="新增标签">
          <a className={styles.add} onClick={this.showTagModal}>
            <Icon type="plus" />
          </a>
        </Tooltip>
        <Modal
          title="新增标签"
          width={1000}
          destroyOnClose
          visible={visible}
          {...modalFooter}
          confirmLoading={confirmLoading}
        >
          {getModalContent()}
        </Modal>
      </Spin>
    );
  }
}

export default TagSelect;
