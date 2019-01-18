import React, { PureComponent } from 'react';
import { Select, Spin, Icon, Modal, Form, Input, Cascader, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import reqwest from 'reqwest';

import styles from './CategoryCascader.less';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
@Form.create()
class CategoryCascader extends PureComponent {
  state = {
    visible: false,
    confirmLoading: false,
    categoryOptions: [],
    isLoading: false,
    level1Options: [],
    level2Options: [],
  };

  componentDidMount = () => {
    reqwest({
      url: `/api/blog/model?model=category&level=1`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        const data = Array.isArray(res) ? res : [];
        this.setState({
          categoryOptions: data.map(item => ({
            value: item.id,
            label: item.name,
            isLeaf: false,
          })),
          isLoading: false,
        });
      },
    });
  };

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (value && value.level1 && value.level2 && value.level3) {
      this.setState({
        text: `${value.level1.label}/${value.level2.label}/${value.level3.label}`,
      });
      const { onChange } = this.props;
      onChange(value.level3.key);
    }
  }

  loadCategoryOptions = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const { categoryOptions } = this.state;
    targetOption.loading = true;
    reqwest({
      url: `/api/blog/model?model=category&parent_category=${targetOption.value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        const data = Array.isArray(res) ? res : [];
        targetOption.loading = false;
        targetOption.children = data.map(item => ({
          value: item.id,
          label: item.name,
          isLeaf: item.level === 3,
        }));
        this.setState({
          categoryOptions: [...categoryOptions],
        });
      },
    });
  };

  onCategoryChange = (value, selectedOptions) => {
    this.setState({
      text: selectedOptions.map(o => o.label).join('/'),
    });
    const { onChange } = this.props;
    onChange(value[value.length - 1]);
  };

  showCategoryModal = () => {
    this.getOption(1);
    this.setState({
      visible: true,
    });
  };

  getOption = (level, parent) => {
    reqwest({
      url: parent
        ? `/api/blog/model?model=category&parent_category=${parent}`
        : `/api/blog/model?model=category&level=${level}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        const list = Array.isArray(res) ? res : [];
        switch (level) {
          case 1:
            this.setState({
              level1Options: list,
            });
            break;
          case 2:
            this.setState({
              level2Options: list,
            });
            break;
          default:
            break;
        }
      },
    });
  };

  selectLevel1Item = (value, option) => {
    const { children } = option.props;
    this.setState({
      level1: children,
    });
    this.getOption(2, value);
  };

  selectLevel2tem = (value, option) => {
    const { children } = option.props;
    this.setState({
      level2: children,
    });
  };

  categoryValidator = (rule, value, callback) => {
    if (!value) {
      callback(formatMessage({ id: 'validation.article.category.level3.required' }));
    }
    reqwest({
      url: `/api/blog/exist?model=category&name=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result) {
          callback(`名称为《${value}》的分类已存在`);
        }
        callback();
      },
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
        type: 'category/submitCategory',
        payload: {
          id,
          name: fieldsValue.level3,
          parent_category: fieldsValue.level2,
        },
        callback: response => {
          this.setState({
            confirmLoading: false,
            visible: false,
          });
          const { onChange } = this.props;
          const { level1, level2 } = this.state;
          onChange(response.id);
          this.setState({
            text: `${level1}/${level2}/${response.name}`,
          });
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

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    const {
      visible,
      confirmLoading,
      categoryOptions,
      isLoading,
      level1Options,
      level2Options,
      text,
    } = this.state;

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
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="form.article.category.label.level1" />}
        >
          {getFieldDecorator('level1', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'validation.article.category.level1.required' }),
              },
            ],
          })(
            <Select
              className={styles.item}
              onSelect={this.selectLevel1Item}
              placeholder={formatMessage({ id: 'form.article.category.placeholder.level1' })}
            >
              {level1Options.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="form.article.category.label.level2" />}
        >
          {getFieldDecorator('level2', {
            rules: [
              {
                required: true,
                message: formatMessage({ id: 'validation.article.category.level2.required' }),
              },
            ],
          })(
            <Select
              className={styles.item}
              onSelect={this.selectLevel2tem}
              placeholder={formatMessage({ id: 'form.article.category.placeholder.level2' })}
            >
              {level2Options.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={<FormattedMessage id="form.article.category.label.level3" />}
        >
          {getFieldDecorator('level3', {
            rules: [
              {
                validator: this.categoryValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(
            <Input
              placeholder={formatMessage({ id: 'form.article.category.placeholder.level3' })}
            />
          )}
          <span style={{ color: '#f00' }}>如需添加一二级目录请联系管理员</span>
        </FormItem>
      </Form>
    );

    return (
      <Spin spinning={isLoading} wrapperClassName={styles.row}>
        <Cascader
          options={categoryOptions}
          loadData={this.loadCategoryOptions}
          onChange={this.onCategoryChange}
        >
          <Input readOnly className={styles.item} value={text} />
        </Cascader>
        <Tooltip title="新增分类">
          <a className={styles.add} onClick={this.showCategoryModal}>
            <Icon type="plus" />
          </a>
        </Tooltip>
        <Modal
          title="新增分类"
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

export default CategoryCascader;
