import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Switch, Icon, Divider, Tooltip, Modal, Input, Transfer, message } from 'antd';
import reqwest from 'reqwest';

import CustomTable from '@/components/CustomTable';

const FormItem = Form.Item;

@connect(({ user, group, role, permission, loading }) => ({
  user,
  group,
  role,
  permission,
  loading: loading.effects['user/fetchUser'],
  submitting: loading.effects['user/updateUser'],
}))
@Form.create()
class UserList extends PureComponent {
  state = {
    current: {},
    visible: false,
    // 编辑类型： 1->基本信息，2->角色， 3->权限
    editType: 1,
    groupTargetKeys: [],
    roleTargetKeys: [],
    permissionTargetKeys: [],
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  columns = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
      render: email => <a href={`mailto:${email}`}>{email}</a>,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      render: (text, record) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          defaultChecked={text}
          onChange={checked => this.onSwitchChange(record, { is_active: checked })}
        />
      ),
    },
    {
      title: '是否超级用户',
      dataIndex: 'is_superuser',
      /* eslint-disable */
      render: is_superuser => (
        <Switch checkedChildren="是" unCheckedChildren="否" defaultChecked={is_superuser} />
      ),
      /* eslint-disable */
    },
    {
      title: '是否员工',
      dataIndex: 'is_staff',
      render: (text, record) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          defaultChecked={text}
          onChange={checked => this.onSwitchChange(record, { is_staff: checked })}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="修改用户信息">
            <a onClick={e => this.handleEdit(e, record, 1)}>
              <Icon type="edit" />
            </a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="修改用角色信息">
            <a onClick={e => this.handleEdit(e, record, 2)}>
              <Icon type="team" />
            </a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="修改用户权限信息">
            <a onClick={e => this.handleEdit(e, record, 3)}>
              <Icon type="safety" />
            </a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="删除用户">
            <a onClick={e => this.handleDelete(e, record)}>
              <Icon type="delete" style={{ color: '#f00' }} />
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
      type: 'user/fetchUser',
      payload: {
        page_size: currentPageSize,
      },
    });
  }

  handleAdd = () => {
    this.setState({
      visible: true,
      editType: 1,
      current: {},
    });
  };

  handleDelete = (e, record) => {
    Modal.confirm({
      title: '删除用户',
      content: `确定删除${record.username}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'user/deleteUser',
          payload: record.id,
          callback: () => {
            const { currentPageSize } = this.customTable.current.state;
            dispatch({
              type: 'user/fetchUser',
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
            type: 'user/deleteUser',
            payload: row.id,
            callback: () => {
              dispatch({
                type: 'user/fetchUser',
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

  handleEdit = (e, record, type) => {
    e.preventDefault();
    const { dispatch } = this.props;
    if (type === 1) {
      dispatch({
        type: 'group/fetchGroup',
      });
    }
    if (type === 2) {
      dispatch({
        type: 'role/fetchRole',
      });
    }
    if (type === 3) {
      dispatch({
        type: 'permission/fetchPermission',
      });
    }
    this.setState({
      visible: true,
      current: record,
      editType: type,
      groupTargetKeys: type === 1 ? record.groups.map(group => group) : [],
      roleTargetKeys: type === 2 ? record.system_roles.map(role => role) : [],
      permissionTargetKeys: type === 3 ? record.user_permissions.map(permission => permission) : [],
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
      url: `/api/account/exist?model=user&username=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result && res.id !== current.id * 1) {
          callback(`用户名${value}已注册`);
        }
        callback();
      },
    });
  };

  emailValidator = (rule, value, callback) => {
    const { current } = this.state;
    reqwest({
      url: `/api/account/exist?model=user&email=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result && res.id !== current.id * 1) {
          callback(`邮箱${value}已注册`);
        }
        callback();
      },
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
        type: 'user/updateUser',
        payload: { id, ...fieldsValue },
        callback: response => {
          if (response.id === id) {
            this.setState({
              visible: false,
            });
            message.success('用户信息修改成功！');
            dispatch({
              type: 'user/fetchUser',
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

  onSwitchChange = (record, value) => {
    const { dispatch } = this.props;
    const { currentPageSize, currentPage } = this.customTable.current.state;
    const id = record ? record.id : '';
    dispatch({
      type: 'user/updateUser',
      payload: { id, ...value },
      callback: () => {
        dispatch({
          type: 'user/fetchUser',
          payload: {
            page: currentPage,
            page_size: currentPageSize,
          },
        });
      },
    });
  };

  pageChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchUser',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  showSizeChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchUser',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  renderGroupItem = item => {
    const customLabel = <span className="custom-item">{item.name}</span>;
    return {
      label: customLabel,
      value: item.id,
    };
  };

  renderRoleItem = item => {
    const customLabel = (
      <span className="custom-item">
        {item.name}-{item.description}
      </span>
    );
    return {
      label: customLabel,
      value: item.id,
    };
  };

  handleChange = target => {
    const { editType } = this.state;
    switch (editType) {
      case 1:
        this.setState({ groupTargetKeys: target });
        break;
      case 2:
        this.setState({ roleTargetKeys: target });
        break;
      case 3:
        this.setState({ permissionTargetKeys: target });
        break;
      default:
        this.setState({ groupTargetKeys: target });
        break;
    }
  };

  render() {
    const {
      user: { userList },
      group: { groupList },
      role: { roleList },
      permission: { permissionList },
      form: { getFieldDecorator },
      loading,
      submitting,
    } = this.props;

    const {
      visible,
      current,
      groupTargetKeys,
      roleTargetKeys,
      permissionTargetKeys,
      editType,
    } = this.state;

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
        <FormItem
          label="用户名"
          {...this.formLayout}
          style={{ display: editType === 1 ? 'block' : 'none' }}
        >
          {getFieldDecorator('username', {
            initialValue: current.username,
            rules: [
              {
                required: true,
                message: '请输入用户名',
              },
              {
                validator: this.nameValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder="请输入用户名" />)}
        </FormItem>
        <FormItem
          label="真实姓名"
          {...this.formLayout}
          style={{ display: editType === 1 ? 'block' : 'none' }}
        >
          {getFieldDecorator('real_name', {
            initialValue: current.real_name,
          })(<Input placeholder="请输入真实姓名" />)}
        </FormItem>
        <FormItem
          label="电子邮箱"
          {...this.formLayout}
          style={{ display: editType === 1 ? 'block' : 'none' }}
        >
          {getFieldDecorator('email', {
            initialValue: current.email,
            rules: [
              {
                required: true,
                message: '请输入电子邮箱',
              },
              {
                type: 'email',
                message: '请输入合法的邮箱',
              },
              {
                validator: this.emailValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder="请输入电子邮箱" />)}
        </FormItem>
        <FormItem label="组" style={{ display: editType === 1 ? 'block' : 'none' }}>
          {getFieldDecorator('groups', {})(
            <Transfer
              dataSource={groupList.list}
              listStyle={{
                width: 250,
                height: 200,
              }}
              lazy
              targetKeys={groupTargetKeys}
              operations={['添加', '删除']}
              rowKey={record => record.id}
              onChange={this.handleChange}
              render={this.renderGroupItem}
            />
          )}
        </FormItem>
        <FormItem label="用户角色" style={{ display: editType === 2 ? 'block' : 'none' }}>
          {getFieldDecorator('system_roles', {})(
            <Transfer
              dataSource={roleList.list}
              listStyle={{
                width: 250,
                height: 300,
              }}
              lazy
              targetKeys={roleTargetKeys}
              operations={['添加', '删除']}
              rowKey={record => record.id}
              onChange={this.handleChange}
              render={this.renderRoleItem}
            />
          )}
        </FormItem>
        <FormItem label="权限" style={{ display: editType === 3 ? 'block' : 'none' }}>
          {getFieldDecorator('user_permissions', {})(
            <Transfer
              dataSource={permissionList.list}
              listStyle={{
                width: 250,
                height: 300,
              }}
              lazy
              targetKeys={permissionTargetKeys}
              operations={['添加', '删除']}
              rowKey={record => record.id}
              onChange={this.handleChange}
              render={this.renderGroupItem}
            />
          )}
        </FormItem>
      </Form>
    );

    const tableModalProps = {
      tableModalContent: modalContent,
      tableModelFooter: modelFooter,
      tableModelConfirmLoading: submitting,
      tableModelVisible: visible,
    };

    return (
      <CustomTable
        rowKey={record => record.id}
        loading={loading}
        data={userList}
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

export default UserList;
