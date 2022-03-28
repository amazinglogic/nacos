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
  Pagination,
  Table,
  Dialog,
  Message,
  ConfigProvider,
  Switch,
} from '@alifd/next';
import { request } from '../../../globalLib';
import { generateUrl } from '../../../utils/nacosutil';
import RegionGroup from '../../../components/RegionGroup';

import './DubboServiceCount.scss';

const FormItem = Form.Item;
const { Row, Col } = Grid;
const { Column } = Table;

@ConfigProvider.config
class DubboServiceCount extends React.Component {
  static displayName = 'DubboServiceCount';

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
      count: 0,
      dataSource: [],
      search: {
        applicationName: '',
      },
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
      url: `/nacos/v1/ns/app/detail?${parameter.join('&')}`,
      success: ({ count = 0, applicationList = [] } = {}) => {
        this.setState({
          dataSource: applicationList,
          loading: false,
          count,
        });
      },
      error: () =>
        this.setState({
          dataSource: [],
          loading: false,
          count: 0,
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

  rowColor = row => ({ className: !row.healthyInstanceCount ? 'row-bg-red' : '' });

  render() {
    const { locale = {} } = this.props;
    const { serviceList, applicationName, serviceNamePlaceholder, query, pubNoData } = locale;
    const { search, nowNamespaceName, nowNamespaceId } = this.state;
    const { init, getValue } = this.field;
    this.init = init;
    this.getValue = getValue;

    return (
      <div className="main-container dubbo-application-management">
        <div style={{ marginTop: -15 }}>
          <RegionGroup
            setNowNameSpace={this.setNowNameSpace}
            namespaceCallBack={this.getQueryLater}
          />
        </div>
        <h3 className="page-title">
          <span className="title-item">{serviceList}</span>
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
                <span>
                  {locale.ApplicationNumber}：{this.state.count}
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
              // getRowProps={row => this.rowColor(row)}
              loading={this.state.loading}
            >
              <Column title={locale.name} dataIndex="name" />
              <Column
                title={locale.heathy}
                cell={(value, index, record) => {
                  return <div>{record?.heathy?.join(', ')}</div>;
                }}
              />
              <Column
                title={locale.unhealthy}
                cell={(value, index, record) => {
                  return <div>{record?.unheathy?.join(', ')}</div>;
                }}
              />
            </Table>
          </Col>
        </Row>
      </div>
    );
  }
}

export default DubboServiceCount;
