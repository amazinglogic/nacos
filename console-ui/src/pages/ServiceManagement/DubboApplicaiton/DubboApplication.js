/*
 * Copyright 1999-2018 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Field,
  Form,
  Grid,
  Input,
  Loading,
  Message,
  Pagination,
  Table,
  Dialog,
  Balloon,
  ConfigProvider,
} from '@alifd/next';
import { request } from '../../../globalLib';
import { generateUrl } from '../../../utils/nacosutil';
import RegionGroup from '../../../components/RegionGroup';

import './DubboApplication.scss';
import axios from 'axios';

const FormItem = Form.Item;
const { Row, Col } = Grid;
const { Column } = Table;

@ConfigProvider.config
class DubboApplication extends React.Component {
  static displayName = 'DubboApplication';

  static propTypes = {
    locale: PropTypes.object,
    history: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.editServiceDialog = React.createRef();
    this.showcode = React.createRef();
    this.state = {
      loading: false,
      visible: false,
      dataSource: [],
      unhealthyServiceDataSource: [],
      search: {
        applicationName: '',
      },
      applicationCount: 0,
      serviceTotal: 0,
      consumer: 0,
      provider: 0,
    };
    this.field = new Field(this);
  }

  openLoading() {
    this.setState({ loading: true });
  }

  closeLoading() {
    this.setState({ loading: false });
  }

  openEditServiceDialog() {
    try {
      this.editServiceDialog.current.getInstance().show(this.state.service);
    } catch (error) {}
  }

  queryServiceList() {
    const { search } = this.state;
    const parameter = [`application=${search.applicationName}`];
    this.openLoading();
    request({
      url: `/nacos/v1/ns/app/info?${parameter.join('&')}`,
      success: ({
        applicationCount = 0,
        serviceTotal = 0,
        consumer = 0,
        provider = 0,
        applicationList = [],
      } = {}) => {
        this.setState({
          dataSource: applicationList,
          loading: false,
          applicationCount,
          serviceTotal,
          consumer,
          provider,
        });
      },
      error: () =>
        this.setState({
          dataSource: [],
          loading: false,
          applicationCount: 0,
          serviceTotal: 0,
          consumer: 0,
          provider: 0,
        }),
    });
  }

  getQueryLater = () => {
    setTimeout(() => this.queryServiceList());
  };

  showcode = () => {
    setTimeout(() => this.queryServiceList());
  };

  /**
   *
   * Added method to open sample code window
   * @author yongchao9  #2019年05月18日 下午5:46:28
   *
   */
  showSampleCode(record) {
    this.showcode.current.getInstance().openDialog(record);
  }

  querySubscriber(record) {
    const { name, groupName } = record;
    const namespace = this.state.nowNamespaceId;
    this.props.history.push(generateUrl('/subscriberList', { namespace, name, groupName }));
  }

  handlePageSizeChange(pageSize) {
    this.setState({ pageSize }, () => this.queryServiceList());
  }

  setNowNameSpace = (nowNamespaceName, nowNamespaceId) =>
    this.setState({
      nowNamespaceName,
      nowNamespaceId,
    });

  rowColor = row => ({
    className: !row.healthy ? 'row-bg-red' : '',
  });

  switchState(index, record) {
    const { ip, name, enabled } = record;
    request({
      method: 'POST',
      url: 'v1/ns/app/application',
      data: {
        name,
        ip,
        enabled: !enabled
      },
      dataType: 'text',
      success: () => {
        this.queryServiceList();
      },
      error: e => Message.error(e.responseText || 'error')
    });
  }

  onUnhealthyClick = (application, ip) => {
    this.openLoading();
    this.setState({
      visible: true,
    });
    const parameter = [`application=${application}`, `ip=${ip}`];
    request({
      url: `/nacos/v1/ns/app/services?${parameter.join('&')}`,
      success: ({ serviceList = [] } = {}) => {
        this.setState({
          unhealthyServiceDataSource: serviceList,
          loading: false,
        });
      },
      error: () =>
        this.setState({
          unhealthyServiceDataSource: [],
          loading: false,
        }),
    });
  };

  onClose = reason => {
    this.setState({
      unhealthyServiceDataSource: [],
      visible: false,
      loading: false,
    });
  };

  render() {
    const { locale = {} } = this.props;
    const { applicationList, applicationName, serviceNamePlaceholder, query, pubNoData } = locale;
    const { search, nowNamespaceName, nowNamespaceId } = this.state;
    const { init, getValue } = this.field;
    this.init = init;
    this.getValue = getValue;
    let record = null;
    return (
      <div className="main-container dubbo-application-management">
        <div style={{ marginTop: -15 }}>
          <RegionGroup
            setNowNameSpace={this.setNowNameSpace}
            namespaceCallBack={this.getQueryLater}
          />
        </div>
        <h3 className="page-title">
          <span className="title-item">{applicationList}</span>
          <span className="title-item">|</span>
          <span className="title-item">{nowNamespaceName}</span>
          <span className="title-item">{nowNamespaceId}</span>
        </h3>
        <Row
          className="demo-row"
          style={{
            marginBottom: 10,
            padding: 0,
          }}
        >
          <Col span="24">
            <Form inline field={this.field}>
              <FormItem label={applicationName}>
                <Input
                  placeholder={serviceNamePlaceholder}
                  style={{ width: 200 }}
                  value={search.applicationName}
                  onChange={applicationName =>
                    this.setState({ search: { ...search, applicationName } })
                  }
                  onPressEnter={() =>
                    this.setState({ currentPage: 1 }, () => this.queryServiceList())
                  }
                />
              </FormItem>
              <FormItem label="">
                <Button
                  type="primary"
                  onClick={() => this.setState({ currentPage: 1 }, () => this.queryServiceList())}
                  style={{ marginRight: 10 }}
                >
                  {query}
                </Button>
              </FormItem>
              <FormItem label="" style={{ float: 'right', marginTop: 10 }}>
                <span className="number">
                  {locale.applicationCount}：{this.state.applicationCount}
                </span>
                <span className="number">
                  {locale.serviceTotal}：{this.state.serviceTotal}
                </span>
                <span className="number">
                  {locale.consumer}：{this.state.consumer}
                </span>
                <span className="number">
                  {locale.provider}：{this.state.provider}
                </span>
              </FormItem>
            </Form>
          </Col>
        </Row>
        <Row style={{ padding: 0 }}>
          <Col span="24" style={{ padding: 0, marginBottom: 10 }}>
            <Table
              dataSource={this.state.dataSource}
              locale={{ empty: pubNoData }}
              getRowProps={row => this.rowColor(row)}
              loading={this.state.loading}
              onDoubleClick={() => {
                  this.onUnhealthyClick(record.name, record.ip);
                  record = null;
              }}
              onRowClick={row => {
                record = row;
              }}
            >
              <Column title={locale.name} dataIndex="name" />
              <Column title={locale.ip} dataIndex="ip" />
              <Column
                title={`${locale.total}`}
                cell={(value, index, record) => {
                  return (
                    <Balloon align="l" closable={false} trigger={<div>{record?.totalCount}</div>}>
                      <div>
                        <span className="serviceNum">{locale.provider}：</span>
                        {record.providerCount}
                      </div>
                      <div>
                        <span className="serviceNum">{locale.consumer}：</span>
                        {record.consumerCount}
                      </div>
                      <div>
                        <span className="serviceNum">{locale.healthyCount}：</span>
                        {record.healthyCount}
                      </div>
                    </Balloon>
                  );
                }}
              />
              <Column title={locale.apiVersion} dataIndex="apiVersion" />
              <Table.Column
                title={locale.operation}
                width={160}
                cell={(value, index, record) => (
                  <div>
                    <Button
                      type={record.enabled ? 'normal' : 'secondary'}
                      onClick={() => this.switchState(index, record)}
                    >
                      {locale[record.enabled ? 'offline' : 'online']}
                    </Button>
                  </div>
              )}
              />
            </Table>
          </Col>
        </Row>
        <Dialog
          title={locale.title}
          visible={this.state.visible}
          footer={false}
          style={{ width: 800 }}
          onCancel={this.onClose.bind(this, 'cancelClick')}
          onClose={this.onClose}
        >
          <Table
            dataSource={this.state.unhealthyServiceDataSource}
            locale={{ empty: pubNoData }}
            loading={this.state.loading}
            getRowProps={row => this.rowColor(row)}
          >
            <Column title={locale.unhealthyName} dataIndex="name" />
            <Column title={locale.unhealthyGroup} dataIndex="group" />
            <Column
              title={`${locale.unhealthyEnabled}`}
              cell={(value, index, record) => {
                  return (
                      <div>
                        {record.enabled ? '是' : '否'}
                      </div>
                  );
                }}
            />
            <Column title={locale.unhealthyLastBeat} dataIndex="lastBeat" />
          </Table>
        </Dialog>
      </div>
    );
  }
}

export default DubboApplication;
