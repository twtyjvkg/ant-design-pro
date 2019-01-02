import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Icon, Divider, Tooltip, Modal, Input, message } from 'antd';

import CustomTable from '@/components/CustomTable';
import reqwest from 'reqwest';

const FormItem = Form.Item;

@connect(({ role, loading }) => ({
  role,
  loading: loading.models.role,
}))
@Form.create()
class RoleList extends PureComponent {
  state = {
    visible: false,
    current: {},
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '角色描述',
      dataIndex: 'description',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="修改角色信息">
            <a onClick={e => this.handleEdit(e, record)}>
              <Icon type="edit" theme="twoTone" />
            </a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="删除角色">
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
    const { currentPageSize } = this.customTable.current.state;
    dispatch({
      type: 'role/fetchRole',
      payload: {
        page_size: currentPageSize,
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
      title: '删除角色',
      content: `确定删除${record.name}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        const { currentPageSize } = this.customTable.current.state;
        dispatch({
          type: 'role/deleteRole',
          payload: record.id,
          callback: () => {
            dispatch({
              type: 'role/fetchRole',
              payload: {
                page_size: currentPageSize,
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
            type: 'role/deleteRole',
            payload: row.id,
            callback: () => {
              dispatch({
                type: 'role/fetchRole',
                payload: {
                  page_size: currentPageSize,
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
      url: `/api/account/exist?model=role&name=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result && res.id !== current.id * 1) {
          callback(`角色{value}已存在`);
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
        type: 'role/submitRoleForm',
        payload: { id, ...fieldsValue },
        callback: response => {
          if (response.id) {
            this.setState({
              visible: false,
            });
            message.success('提交成功！');
            dispatch({
              type: 'role/fetchRole',
              payload: {
                page: currentPage,
                page_size: currentPageSize,
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
      type: 'role/fetchRole',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  showSizeChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/fetchRole',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  render() {
    const {
      role: { roleList },
      form: { getFieldDecorator },
      loading,
    } = this.props;

    const { current = {}, visible } = this.state;

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
        <FormItem label="角色名称" {...this.formLayout}>
          {getFieldDecorator('name', {
            initialValue: current.name,
            rules: [
              {
                required: true,
                message: '请输入角色名称',
              },
              {
                validator: this.nameValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder="请输入角色名称" />)}
        </FormItem>
        <FormItem label="角色描述" {...this.formLayout}>
          {getFieldDecorator('description', {
            initialValue: current.description,
            rules: [
              {
                required: true,
                message: '请输入角色描述',
              },
            ],
          })(<Input placeholder="请输入角色描述" />)}
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
        data={roleList}
        pagination={paginationProps}
        columns={this.columns}
        tableModal={tableModalProps}
        onAdd={this.handleAdd}
        onBatchDelete={this.handleBatchDelete}
        ref={this.customTable}
      />
    );
  }
}

export default RoleList;
