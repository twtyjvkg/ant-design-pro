import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Button, Form, Input, message, Steps, Icon, Popover, Progress } from 'antd';
import reqwest from 'reqwest';

import styles from './Reset.less';

const { Step } = Steps;
const FormItem = Form.Item;

const passwordStatusMap = {
  ok: (
    <div className={styles.success}>
      <FormattedMessage id="validation.password.strength.strong" />
    </div>
  ),
  pass: (
    <div className={styles.warning}>
      <FormattedMessage id="validation.password.strength.medium" />
    </div>
  ),
  poor: (
    <div className={styles.error}>
      <FormattedMessage id="validation.password.strength.short" />
    </div>
  ),
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

@Form.create()
class ResetPassword extends PureComponent {
  state = {
    count: 0,
    current: 1,
    status: 'process',
    emailSubmitting: false,
    confirmDirty: false,
    visible: false,
    help: '',
  };

  componentWillMount() {
    clearInterval(this.interval);
  }

  handleEmail = e => {
    e.target.value = e.target.value.replace(/@[^@]*/, '');
  };

  preStep = e => {
    e.preventDefault();
    this.setState({
      current: 0,
    });
  };

  onGetCaptcha = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll(['email'], (errors, values) => {
      if (errors) {
        this.setState({
          status: 'error',
        });
        return;
      }
      this.setState({
        emailSubmitting: true,
        status: 'wait',
      });
      const mail = `${values.email}@hand-china.com`;
      reqwest({
        url: `/api/cms/email_code`,
        type: 'json',
        method: 'post',
        data: {
          email: mail,
        },
        success: () => {
          message.success(`验证码已发送至邮箱：${mail},请查收！`);
          this.setState({
            emailSubmitting: false,
            status: 'process',
            current: 1,
          });
          let count = 59;
          this.setState({ count });
          this.interval = setInterval(() => {
            count -= 1;
            this.setState({ count });
            if (count === 0) {
              clearInterval(this.interval);
            }
          }, 1000);
        },
        error: err => {
          this.setState({
            emailSubmitting: false,
            status: 'error',
          });
          switch (err.status) {
            case 500:
              message.error('服务器错误');
              break;
            case 400: {
              const { code, email, error } = JSON.parse(err.responseText);
              form.setFields({
                email: {
                  value: values.email,
                  errors: email ? [new Error(email[0])] : '',
                },
                captcha: {
                  errors: code ? [new Error(code[0])] : '',
                },
              });
              if (error && error.message) {
                message.error(error.message);
              }
              break;
            }
            default:
              message.error(err.responseText);
              break;
          }
        },
      });
    });
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(formatMessage({ id: 'validation.password.twice' }));
    } else {
      callback();
    }
  };

  checkPassword = (rule, value, callback) => {
    const { visible, confirmDirty } = this.state;
    if (!value) {
      this.setState({
        help: formatMessage({ id: 'validation.password.required' }),
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!visible) {
        this.setState({
          visible: !!value,
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

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
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
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { current, count, status, emailSubmitting, help, visible } = this.state;

    return (
      <div className={styles.main}>
        <h3 align="center">忘记密码</h3>
        <Steps current={current} status={status}>
          <Step title="邮箱验证" icon={<Icon type="mail" />} />
          <Step title="密码重置" icon={<Icon type="solution" />} />
          <Step title="完成" />
        </Steps>
        <Form className={styles.resetForm}>
          <FormItem>
            {getFieldDecorator('email', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'validation.email.required' }),
                },
                {
                  pattern: /\w+([-+.]\w+)*@hand-china.com+$/,
                  message: '请输入汉得邮箱',
                  transform(value) {
                    return value ? `${value.replace(/@[^@]*/, '')}@hand-china.com` : value;
                  },
                },
              ],
              validateTrigger: 'onBlur',
            })(
              <Input
                size="large"
                onKeyUp={this.handleEmail}
                addonAfter="@hand-china.com"
                placeholder={formatMessage({ id: 'form.email.placeholder' })}
              />
            )}
          </FormItem>
          {current === 1 && (
            <FormItem help={help}>
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
                overlayStyle={{ width: 240 }}
                placement="right"
                visible={visible}
              >
                {getFieldDecorator('password', {
                  rules: [
                    {
                      validator: this.checkPassword,
                    },
                  ],
                })(
                  <Input
                    size="large"
                    type="password"
                    placeholder={formatMessage({ id: 'form.password.placeholder' })}
                  />
                )}
              </Popover>
            </FormItem>
          )}
          {current === 1 && (
            <FormItem>
              {getFieldDecorator('confirm', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'validation.confirm-password.required' }),
                  },
                  {
                    validator: this.checkConfirm,
                  },
                ],
              })(
                <Input
                  size="large"
                  type="password"
                  placeholder={formatMessage({ id: 'form.confirm-password.placeholder' })}
                />
              )}
            </FormItem>
          )}
          {current === 0 && (
            <FormItem>
              <Button
                size="large"
                disabled={count}
                className={styles.getCaptcha}
                onClick={this.onGetCaptcha}
                loading={emailSubmitting}
                type="primary"
              >
                {count ? `${count} s` : '获取验证码'}
              </Button>
            </FormItem>
          )}
          {current === 1 && (
            <div style={{ paddingLeft: '10%', paddingRight: '10%' }}>
              <Button style={{ float: 'left' }} size="large" onClick={this.preStep}>
                上一步
              </Button>
              <Button type="primary" style={{ float: 'right' }} size="large">
                提交
              </Button>
            </div>
          )}
        </Form>
      </div>
    );
  }
}

export default ResetPassword;
