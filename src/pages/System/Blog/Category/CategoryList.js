import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Icon, Divider, Tooltip, Modal, Input, message, Select } from 'antd';

import reqwest from 'reqwest';

import CustomTable from '@/components/CustomTable';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
@Form.create()
class CategoryList extends PureComponent {
  state = {
    visible: false,
    parentCategories: [],
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
    },
    {
      title: '目录级别',
      dataIndex: 'level',
      render: level => {
        switch (level) {
          case 1:
            return <span>一级目录</span>;
          case 2:
            return <span>二级目录</span>;
          case 3:
            return <span>三级目录</span>;
          default:
            return <span>未知</span>;
        }
      },
    },
    {
      title: '作者',
      dataIndex: 'author_display',
      /* eslint-disable */
      render: author_display => <span>{author_display.name}</span>,
      /* eslint-disable */
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="修改分类信息">
            <a onClick={e => this.handleEdit(e, record)}>
              <Icon type="edit" theme="twoTone" />
            </a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="删除分类">
            <a onClick={e => this.handleDelete(e, record)}>
              <Icon type="delete" theme="twoTone" twoToneColor="#ff0000" />
            </a>
          </Tooltip>
        </span>
      ),
    },
  ];

  constructor(props) {
    super(props);
    this.customTable = React.createRef();
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/fetchCategory',
      payload: {
        page_size: 10,
        level: 1,
      },
    });
  }

  handleAdd = () => {
    this.setState({
      visible: true,
      current: {},
    });
  };

  handleEdit = (e, record) => {
    e.preventDefault();
    this.setState({
      visible: true,
      current: record,
    });
  };

  handleDelete = (e, record) => {
    e.preventDefault();
    Modal.confirm({
      title: '删除功能',
      content: `确定删除${record.name}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        const { currentPageSize } = this.customTable.current.state;
        dispatch({
          type: 'category/deleteCategory',
          payload: record.id,
          callback: () => {
            dispatch({
              type: 'category/fetchCategory',
              payload: {
                page_size: currentPageSize,
                level: 1,
              },
            });
          },
        });
      },
    });
  };

  handleBatchDelete = () => {
    Modal.confirm({
      title: '批量删除',
      content: '确定要批量删除吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        const { selectedRows, currentPageSize } = this.customTable.current.state;
        selectedRows.forEach(row => {
          dispatch({
            type: 'category/deleteCategory',
            payload: row.id,
            callback: () => {
              dispatch({
                type: 'category/fetchCategory',
                payload: {
                  page_size: currentPageSize,
                  level: 1,
                },
              });
            },
          });
        });
      },
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  nameValidator = (rule, value, callback) => {
    const { current } = this.state;
    reqwest({
      url: `/api/blog/exist?model=category&name=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result && res.id !== current.id * 1) {
          callback(`分类《${value}》已存在`);
        }
        callback();
      },
    });
  };

  handleSubmit = () => {
    const { dispatch, form } = this.props;
    const { current } = this.state;
    const { currentPageSize, currentPage } = this.customTable.current.state;
    const id = current ? current.id : '';
    form.validateFields((error, fieldsValue) => {
      if (error) return;
      dispatch({
        type: 'category/submitCategory',
        payload: { id, ...fieldsValue },
        callback: response => {
          if (response.id) {
            this.setState({
              visible: false,
            });
            message.success('提交成功！');
            dispatch({
              type: 'category/fetchCategory',
              payload: {
                page: currentPage,
                page_size: currentPageSize,
                level: 1,
              },
            });
          }
        },
      });
    });
  };

  pageChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/fetchCategory',
      payload: {
        page: current,
        page_size: pageSize,
        level: 1,
      },
    });
  };

  showSizeChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/fetchCategory',
      payload: {
        page: current,
        page_size: pageSize,
        level: 1,
      },
    });
  };

  onLevelSelect = value => {
    if (value > 1) this.getParentCategoryOptions(value);
  };

  getParentCategoryOptions = level => {
    reqwest({
      url: `/api/blog/model?model=category&level=${level - 1}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },

      contentType: 'application/json',
      success: res => {
        this.setState({
          parentCategories: Array.isArray(res) ? res : [],
        });
      },
    });
  };

  render() {
    const {
      category: { categoryList },
      form: { getFieldDecorator, getFieldValue },
      loading,
    } = this.props;

    const { current = {}, parentCategories, visible } = this.state;

    const modelFooter = {
      okText: '保存',
      onOk: this.handleSubmit,
      onCancel: this.handleCancel,
    };

    const paginationProps = {
      onShowSizeChange: this.showSizeChange,
      onChange: this.pageChange,
    };

    const modalContent = (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label="目录名称" {...this.formLayout}>
          {getFieldDecorator('name', {
            initialValue: current.name,
            rules: [
              {
                required: true,
                message: '请输入分类名称',
              },
              {
                validator: this.nameValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder="请输入分类名称" />)}
        </FormItem>
        <FormItem label="目录级别" {...this.formLayout}>
          {getFieldDecorator('level', {
            initialValue: current.level,
          })(
            <Select onSelect={this.onLevelSelect}>
              <Option key={1} value={1}>
                一级目录
              </Option>
              <Option key={2} value={2}>
                二级目录
              </Option>
              <Option key={3} value={3}>
                三级目录
              </Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="上级目录"
          {...this.formLayout}
          style={{
            display: getFieldValue('level') === 1 ? 'none' : 'block',
          }}
        >
          {getFieldDecorator('parent_category', {
            initialValue: current.parent_category,
          })(
            <Select>
              {parentCategories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
      </Form>
    );

    const tableModalProps = {
      tableModalContent: modalContent,
      tableModelFooter: modelFooter,
      tableModelVisible: visible,
    };

    return (
      <CustomTable
        rowKey={record => record.id}
        loading={loading}
        data={categoryList}
        pagination={paginationProps}
        columns={this.columns}
        childrenColumnName="sub_categories"
        tableModal={tableModalProps}
        onAdd={this.handleAdd}
        onBatchDelete={this.handleBatchDelete}
        ref={this.customTable}
      />
    );
  }
}

export default CategoryList;
