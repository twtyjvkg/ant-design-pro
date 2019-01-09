import React from 'react';
import { Row, Col } from 'antd';

import maintain from '../../../assets/maintain.png';

const Maintain = () => (
  <div align="center" style={{ marginTop: '10%' }}>
    <Row>
      <Col>
        <img src={maintain} alt="网站正在维护中" />
      </Col>
    </Row>
  </div>
);

export default Maintain;
