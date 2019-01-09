import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Icon, Divider, Tooltip, Modal, message, Switch } from 'antd';

import CustomTable from '@/components/CustomTable';

@connect(({ article, loading }) => ({
  article,
  loading: loading.effects['article/fetchArticle'],
}))
@Form.create()
class ArticleList extends PureComponent {
  state = {
    visible: false,
    current: {},
  };

  columns = [
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      render: (text, record) => (
        <span>
          {record.category.level1.label}/{record.category.level2.label}/
          {record.category.level3.label}
        </span>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      render: (text, record) => <span>{record.author.name}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (text, record) => (
        <Switch
          checkedChildren="发表"
          unCheckedChildren="草稿"
          defaultChecked={text}
          onChange={checked => this.onSwitchChange(record, { status: checked })}
        />
      ),
    },
    {
      title: '评论状态',
      dataIndex: 'comment_status',
      render: (text, record) => (
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          defaultChecked={text}
          onChange={checked => this.onSwitchChange(record, { comment_status: checked })}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="修改文章信息">
            <a onClick={e => this.handleEdit(e, record)}>
              <Icon type="edit" theme="twoTone" />
            </a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="删除文章">
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
      type: 'article/fetchArticle',
      payload: {
        page_size: currentPageSize,
      },
    });
  }

  handleEdit = (e, record) => {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch({
      type: 'article/fetchAllArticle',
    });
    this.setState({
      visible: true,
      current: record,
    });
  };

  handleDelete = (e, record) => {
    Modal.confirm({
      title: '删除文章',
      content: `确定删除${record.title}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'article/deleteArticle',
          payload: record.id,
          callback: () => {
            const { currentPageSize } = this.customTable.current.state;
            dispatch({
              type: 'article/fetchArticle',
              payload: {
                page_size: currentPageSize,
              },
            });
          },
        });
      },
    });
  };

  handleBatchDelete = e => {
    e.preventDefault();
    e.target.blur();
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
            type: 'article/deleteArticle',
            payload: row.id,
            callback: () => {
              dispatch({
                type: 'article/fetchArticle',
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
    const id = current ? current.id : '';
    form.validateFields((error, fieldsValue) => {
      if (error) return;
      const { currentPageSize } = this.customTable.current.state;
      if (id) {
        dispatch({
          type: 'article/updateArticle',
          payload: { id, ...fieldsValue },
          callback: response => {
            if (response.id === id) {
              this.setState({
                visible: false,
              });
              message.success('文章信息修改成功！');
              dispatch({
                type: 'article/fetchArticle',
                payload: {
                  page_size: currentPageSize,
                },
              });
            }
          },
        });
      } else {
        dispatch({
          type: 'article/submitArticle',
          payload: { ...fieldsValue },
          callback: response => {
            if (response.id) {
              this.setState({
                visible: false,
              });
              message.success('添加成功！');
              dispatch({
                type: 'article/fetchArticle',
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

  onSwitchChange = (record, value) => {
    const { dispatch } = this.props;
    const { currentPage, currentPageSize } = this.customTable.current.state;
    const id = record ? record.id : '';
    dispatch({
      type: 'article/updateArticle',
      payload: { id, ...value },
      callback: () => {
        dispatch({
          type: 'article/fetchArticle',
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
      type: 'article/fetchArticle',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  showSizeChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'article/fetchArticle',
      payload: {
        page: current,
        page_size: pageSize,
      },
    });
  };

  render() {
    const {
      article: { articleList },
      loading,
    } = this.props;

    const { visible } = this.state;

    const modelFooter = {
      okText: '保存',
      onOk: this.handleSubmit,
      onCancel: this.handleCancel,
    };

    const paginationProps = {
      onShowSizeChange: this.showSizeChange,
      onChange: this.pageChange,
    };

    const modalContent = <Form onSubmit={this.handleSubmit} />;

    const tableModalProps = {
      tableModalTitle: '文章编辑',
      tableModalContent: modalContent,
      tableModelFooter: modelFooter,
      tableModelVisible: visible,
    };

    return (
      <CustomTable
        rowKey={record => record.id}
        loading={loading}
        data={articleList}
        pagination={paginationProps}
        columns={this.columns}
        tableModal={tableModalProps}
        onBatchDelete={this.handleBatchDelete}
        ref={this.customTable}
      />
    );
  }
}

export default ArticleList;
