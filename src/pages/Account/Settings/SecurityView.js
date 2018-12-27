import React, { Component, Fragment } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { List, Modal, Form, Input, message, Progress, Popover } from 'antd';
import { connect } from 'dva';
import styles from '../../User/Register.less';

const passwordStatusMap = {
  strong: (
    <font className="strong">
      <FormattedMessage id="app.settings.security.strong" defaultMessage="Strong" />
    </font>
  ),
  medium: (
    <font className="medium">
      <FormattedMessage id="app.settings.security.medium" defaultMessage="Medium" />
    </font>
  ),
  weak: (
    <font className="weak">
      <FormattedMessage id="app.settings.security.weak" defaultMessage="Weak" />
      Weak
    </font>
  ),
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

const FormItem = Form.Item;

@connect(({ user, loading }) => ({
  currentUser: user.currentUser,
  submitting: loading.effects['user/modifyPassword'],
}))
@Form.create()
class SecurityView extends Component {
  state = {
    visible: false,
    type: 'modify',
    help: '',
    helpVisible: false,
  };

  getFormLayout = () => {
    const { helpVisible } = this.state;
    if (helpVisible) {
      return {
        labelCol: { span: 7 },
        wrapperCol: { span: 7 },
      };
    }
    return {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  };

  modifyPassword = () => {
    this.setState({
      type: 'modify',
      visible: true,
    });
  };

  getData = currentUser => [
    {
      title: formatMessage({ id: 'app.settings.security.password' }, {}),
      description: (
        <Fragment>
          {formatMessage({ id: 'app.settings.security.password-description' })}：
          {passwordStatusMap.strong}
        </Fragment>
      ),
      actions: [
        <a onClick={this.modifyPassword}>
          <FormattedMessage id="app.settings.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'app.settings.security.email' }, {}),
      description: `${formatMessage({ id: 'app.settings.security.email-description' })}${
        currentUser.email
      }`,
      // actions: [
      //   <a>
      //     <FormattedMessage id="app.settings.security.modify" defaultMessage="Modify" />
      //   </a>,
      // ],
    },
  ];

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      dispatch({
        type: 'user/modifyPassword',
        payload: { ...fieldsValue },
        callback: response => {
          if (response.error) {
            form.setFields({
              password1: {
                errors: [new Error(response.error)],
              },
            });
          } else if (response.status === 'ok') {
            this.setState({ visible: false });
            message.success('密码修改成功');
            dispatch({
              type: 'login/logout',
            });
          }
        },
      });
    });
  };

  handleCancel = e => {
    e.preventDefault();
    this.setState({
      visible: false,
    });
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password2')) {
      callback(formatMessage({ id: 'validation.password.twice' }));
    } else {
      callback();
    }
  };

  checkPassword = (rule, value, callback) => {
    const { helpVisible, confirmDirty } = this.state;
    if (!value) {
      this.setState({
        help: formatMessage({ id: 'validation.password.required' }),
        helpVisible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!helpVisible) {
        this.setState({
          helpVisible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password2');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password2');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { currentUser, loading } = this.props;
    const { visible, helpVisible, type, help } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;

    const getModalContent = (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label="原密码" {...this.getFormLayout()}>
          {getFieldDecorator('password1', {
            rules: [
              {
                required: true,
                message: '请输入原密码',
              },
            ],
          })(<Input type="password" />)}
        </FormItem>
        <FormItem label="新密码" {...this.getFormLayout()} help={help}>
          <Popover
            getPopupContainer={node => node.parentNode}
            content={
              <div style={{ padding: '4px 0' }}>
                {passwordStatusMap[this.getPasswordStatus()]}
                {this.renderPasswordProgress()}
                <div style={{ marginTop: 10 }}>
                  <FormattedMessage id="validation.password.strength.msg" />
                </div>
              </div>
            }
            overlayStyle={{ width: 200 }}
            placement="right"
            visible={helpVisible}
          >
            {getFieldDecorator('password2', {
              rules: [
                {
                  validator: this.checkPassword,
                },
              ],
            })(<Input type="password" />)}
          </Popover>
        </FormItem>
        <FormItem label="新密码确认" {...this.getFormLayout()}>
          {getFieldDecorator('confirm', {
            rules: [
              {
                required: true,
                message: '请再次输入新密码',
              },
              {
                validator: this.checkConfirm,
              },
            ],
          })(<Input type="password" />)}
        </FormItem>
      </Form>
    );

    const getModalTitle = `${formatMessage(
      { id: 'app.settings.security.password' },
      'password'
    )}${formatMessage({ id: `app.settings.security.${type}` })}`;

    const modalFooter = { okText: '保存', onOk: this.handleSubmit, onCancel: this.handleCancel };

    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={this.getData(currentUser)}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
        <Modal
          title={getModalTitle}
          width={640}
          destroyOnClose
          visible={visible}
          {...modalFooter}
          confirmLoading={loading}
        >
          {getModalContent}
        </Modal>
      </Fragment>
    );
  }
}

export default SecurityView;
