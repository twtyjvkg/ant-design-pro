import React, { PureComponent } from 'react';
import { Button, Card, Dropdown, Icon, Modal, Table } from 'antd';
import styles from './index.less';

class CustomTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      currentPageSize: 10,
      currentPage: 1,
    };
  }

  handleAdd = e => {
    e.preventDefault();
    e.target.blur();
    const { onAdd } = this.props;
    if (onAdd) {
      onAdd(e);
    }
  };

  handleBatchDelete = e => {
    e.preventDefault();
    e.target.blur();
    const { onBatchDelete } = this.props;
    if (onBatchDelete) {
      onBatchDelete(e);
    }
  };

  handleShowSizeChange = (current, pageSize) => {
    this.setState({
      currentPageSize: pageSize,
      currentPage: current,
    });
    const {
      pagination: { onShowSizeChange },
    } = this.props;
    if (onShowSizeChange) {
      onShowSizeChange(current, pageSize);
    }
  };

  handlePageChange = (current, pageSize) => {
    this.setState({
      currentPageSize: pageSize,
      currentPage: current,
    });

    const {
      pagination: { onChange },
    } = this.props;
    if (onChange) {
      onChange(current, pageSize);
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      tableModal: {
        tableModelFooter: { onOk },
      },
    } = this.props;
    if (onOk) {
      onOk(e);
    }
  };

  handleCancel = e => {
    e.preventDefault();
    const {
      tableModal: {
        tableModelFooter: { onCancel },
      },
    } = this.props;
    if (onCancel) {
      onCancel(e);
    }
  };

  render() {
    const {
      data: { list, count },
      childrenColumnName,
      loading,
      columns,
      rowKey,
      tableModal: {
        tableModalTitle,
        tableModelConfirmLoading,
        tableModalContent,
        tableModelVisible,
        tableRowSelection,
      },
      extraMenu,
      onAdd,
    } = this.props;

    const { currentPageSize, currentPage, selectedRows } = this.state;

    const rowSelection = {
      onSelect: (record, selected, selectedItems) => {
        this.setState({
          selectedRows: selectedItems,
        });
        if (tableRowSelection) {
          const { onSelect } = tableRowSelection;
          if (onSelect) {
            onSelect(record, selected, selectedItems);
          }
        }
      },
      onSelectAll: (selected, selectedItems) => {
        this.setState({
          selectedRows: selectedItems,
        });
        if (tableRowSelection) {
          const { onSelectAll } = tableRowSelection;
          if (onSelectAll) {
            onSelectAll(selected, selectedItems);
          }
        }
      },
    };

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSize: currentPageSize,
      current: currentPage,
      onShowSizeChange: this.handleShowSizeChange,
      pageSizeOptions: ['5', '10', '20', '30', '40', '100'],
      onChange: this.handlePageChange,
      total: count,
    };

    const modelFooter = {
      okText: '保存',
      onOk: this.handleSubmit,
      onCancel: this.handleCancel,
    };

    return (
      <Card bordered={false}>
        <div className={styles.customTableList}>
          <div className={styles.customTableListOperator}>
            {onAdd && (
              <Button icon="plus" type="primary" onClick={this.handleAdd}>
                新建
              </Button>
            )}
            {selectedRows.length > 0 && (
              <Button icon="delete" type="danger" onClick={this.handleBatchDelete}>
                批量删除
              </Button>
            )}
            {selectedRows.length > 0 && extraMenu && (
              <Dropdown overlay={extraMenu}>
                <Button>
                  更多操作 <Icon type="down" />
                </Button>
              </Dropdown>
            )}
          </div>
        </div>
        <Table
          rowKey={rowKey || 'key'}
          rowSelection={rowSelection}
          loading={loading}
          pagination={paginationProps}
          childrenColumnName={childrenColumnName}
          dataSource={list}
          columns={columns}
        />
        <Modal
          title={tableModalTitle || '信息'}
          className={styles.customTableListForm}
          width={640}
          destroyOnClose
          confirmLoading={tableModelConfirmLoading}
          {...modelFooter}
          visible={tableModelVisible}
        >
          {tableModalContent}
        </Modal>
      </Card>
    );
  }
}

export default CustomTable;
