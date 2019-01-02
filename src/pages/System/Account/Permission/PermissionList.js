import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Icon, Divider, Tooltip, Modal, Input, message } from 'antd';

import CustomTable from '@/components/CustomTable';
import reqwest from 'reqwest';

const FormItem = Form.Item;

@connect(({ permission, loading }) => ({
  permission,
  loading: loading.effects['permission/fetchPermission'],
}))
@Form.create()
class PermissionList extends PureComponent {
  state = {
    visible: false,
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  columns = [
    {
      title: '权限名称',
      dataIndex: 'name',
    },
    {
      title: '权限代码',
      dataIndex: 'codename',
    },
    {
      title: '内容类型',
      dataIndex: 'content_type',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="修改权限信息">
            <a onClick={e => this.handleEdit(e, record)}>
              <Icon type="edit" theme="twoTone" />
            </a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="删除权限">
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
      type: 'permission/fetchPermission',
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

  nameValidator = (rule, value, callback) => {
    const { current } = this.state;
    reqwest({
      url: `/api/account/exist?model=permission&name=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result && res.id !== current.id * 1) {
          callback(`权限${value}已存在`);
        }
        callback();
      },
    });
  };

  codeValidator = (rule, value, callback) => {
    const { current } = this.state;
    reqwest({
      url: `/api/account/exist?model=permission&codename=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result && res.id !== current.id * 1) {
          callback(`权限代码${value}已存在`);
        }
        callback();
      },
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
    Modal.confirm({
      title: '删除权限',
      content: `确定删除${record.name}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'permission/deletePermission',
          payload: record.id,
          callback: () => {
            const { currentPageSize } = this.customTable.current.state;
            dispatch({
              type: 'permission/fetchPermission',
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
            type: 'permission/deletePermission',
            payload: row.id,
            callback: () => {
              dispatch({
                type: 'permission/fetchPermission',
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

  handleCancel = e => {
    e.preventDefault();
    this.setState({
      visible: false,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { current } = this.state;
    const { currentPageSize, currentPage } = this.customTable.current.state;
    const id = current ? current.id : '';

    form.validateFields((error, fieldsValue) => {
      if (error) return;
      dispatch({
        type: 'permission/updatePermission',
        payload: { id, ...fieldsValue },
        callback: response => {
          if (response.id === id) {
            this.setState({
              visible: false,
            });
            message.success('权限信息修改成功！');
            dispatch({
              type: 'permission/fetchPermission',
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
      type: 'permission/fetchPermission',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  showSizeChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'permission/fetchPermission',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  render() {
    const {
      permission: { permissionList },
      form: { getFieldDecorator },
      loading,
    } = this.props;

    const { visible, current = {} } = this.state;

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
        <FormItem label="名称" {...this.formLayout}>
          {getFieldDecorator('name', {
            initialValue: current.name,
            rules: [
              {
                required: true,
                message: '请输入权限名称',
              },
              {
                validator: this.nameValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder="请输入权限名称" />)}
        </FormItem>
        <FormItem label="权限代码" {...this.formLayout}>
          {getFieldDecorator('codename', {
            initialValue: current.codename,
            rules: [
              {
                required: true,
                message: '请输入权限代码',
              },
              {
                validator: this.codeValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder="请输入权限代码" />)}
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
        data={permissionList}
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

export default PermissionList;
