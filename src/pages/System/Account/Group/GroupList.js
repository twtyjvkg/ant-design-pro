import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Icon, Divider, Tooltip, Modal, Input, message, Transfer } from 'antd';

import CustomTable from '@/components/CustomTable';
import reqwest from 'reqwest';

const FormItem = Form.Item;

@connect(({ group, permission, loading }) => ({
  group,
  permission,
  loading: loading.models.group,
}))
@Form.create()
class GroupList extends PureComponent {
  state = {
    current: {},
    visible: false,
    targetKeys: [],
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  columns = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="修改组信息">
            <a onClick={e => this.handleEdit(e, record)}>
              <Icon type="edit" theme="twoTone" />
            </a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="删除组">
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
      type: 'group/fetchGroup',
      payload: {
        page_size: currentPageSize,
      },
    });
  }

  handleAdd = e => {
    e.preventDefault();
    e.target.blur();
    const { dispatch } = this.props;
    dispatch({
      type: 'permission/fetchPermission',
    });
    this.setState({
      visible: true,
      current: {},
      targetKeys: [],
    });
  };

  handleEdit = (e, record) => {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch({
      type: 'permission/fetchPermission',
    });
    this.setState({
      visible: true,
      current: record,
      targetKeys: record.permissions.map(permission => permission),
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
            type: 'group/deleteGroup',
            payload: row.id,
            callback: () => {
              dispatch({
                type: 'group/fetchGroup',
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

  handleDelete = (e, record) => {
    e.preventDefault();
    e.target.blur();
    Modal.confirm({
      title: '删除组',
      content: `确定删除${record.name}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'group/deleteGroup',
          payload: record.id,
          callback: () => {
            const { currentPageSize } = this.customTable.current.state;
            dispatch({
              type: 'group/fetchGroup',
              payload: {
                page_size: currentPageSize,
              },
            });
          },
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
    const id = current ? current.id : '';

    form.validateFields((error, fieldsValue) => {
      if (error) return;
      if (id) {
        dispatch({
          type: 'group/updateGroup',
          payload: { id, ...fieldsValue },
          callback: response => {
            if (response.id === id) {
              const { currentPageSize } = this.customTable.current.state;
              this.setState({
                visible: false,
              });
              message.success('组信息修改成功！');
              dispatch({
                type: 'group/fetchGroup',
                payload: {
                  page_size: currentPageSize,
                },
              });
            }
          },
        });
      } else {
        dispatch({
          type: 'group/submitGroup',
          payload: { ...fieldsValue },
          callback: response => {
            if (response.id) {
              const { currentPageSize } = this.customTable.current.state;
              this.setState({
                visible: false,
              });
              message.success('添加成功！');
              dispatch({
                type: 'group/fetchGroup',
                payload: {
                  page_size: currentPageSize,
                },
              });
            }
          },
        });
      }
    });
  };

  nameValidator = (rule, value, callback) => {
    const { current } = this.state;
    reqwest({
      url: `/api/account/exist?model=group&name=${value}`,
      type: 'json',
      headers: {
        Authorization: `JWT ${localStorage.getItem('antd-cms-token')}`,
      },
      method: 'get',
      contentType: 'application/json',
      success: res => {
        if (res.result && res.id !== current.id * 1) {
          callback(`名称${value}已存在`);
        }
        callback();
      },
    });
  };

  pageChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'group/fetchGroup',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  showSizeChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'group/fetchGroup',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  renderItem = item => {
    const customLabel = (
      <span className="custom-item">
        {item.codename} - {item.content_type}
      </span>
    );
    return {
      label: customLabel,
      value: item.id,
    };
  };

  handleChange = target => {
    this.setState({ targetKeys: target });
  };

  render() {
    const {
      group: { groupList },
      permission: { permissionList },
      form: { getFieldDecorator },
      loading,
    } = this.props;

    const { visible, current, targetKeys } = this.state;

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
                message: '请输入名称',
              },
              {
                validator: this.nameValidator,
              },
            ],
            validateTrigger: 'onBlur',
          })(<Input placeholder="请输入名称" />)}
        </FormItem>
        <FormItem label="权限">
          {getFieldDecorator('permissions', {
            initialValue: current.permissions,
          })(
            <Transfer
              dataSource={permissionList.list}
              listStyle={{
                width: 250,
                height: 300,
              }}
              lazy
              targetKeys={targetKeys}
              operations={['添加', '删除']}
              rowKey={record => record.id}
              onChange={this.handleChange}
              render={this.renderItem}
            />
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
        data={groupList}
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

export default GroupList;
