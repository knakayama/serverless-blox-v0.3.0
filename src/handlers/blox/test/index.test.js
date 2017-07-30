const expect = require('chai').expect;
const AWS = require('aws-sdk');

describe('GET /v1', () => {
  const api = {};
  const stackName = 'blox-v1';
  AWS.config.update({ region: 'ap-northeast-1' });
  const cloudformation = new AWS.CloudFormation(AWS.config);
  const apiGateway = new AWS.APIGateway(AWS.config);

  before(() => {
    return cloudformation.describeStackResource({ StackName: stackName, LogicalResourceId: 'ApiGatewayRestApi' }).promise()
      .then((data) => {
        api.restApiId = data.StackResourceDetail.PhysicalResourceId;
        return cloudformation.describeStackResource({ StackName: stackName, LogicalResourceId: 'ApiGatewayResourceProxyVar' }).promise();
      })
      .then((data) => {
        api.resourceId = data.StackResourceDetail.PhysicalResourceId;
      });
  });

  describe('/ping', () => {
    it('return status 200', () => {
      const params = {
        restApiId: api.restApiId,
        resourceId: api.resourceId,
        httpMethod: 'GET',
        headers: {},
        pathWithQueryString: '/v1/ping',
      };
      return apiGateway.testInvokeMethod(params).promise().then((response) => {
        expect(response).to.be.a('object');
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('/environments', () => {
    it('list environments', () => {
      const params = {
        restApiId: api.restApiId,
        resourceId: api.resourceId,
        httpMethod: 'GET',
        headers: {},
        pathWithQueryString: '/v1/environments',
      };
      return apiGateway.testInvokeMethod(params).promise().then((response) => {
        const body = JSON.parse(response.body);
        expect(body.items).to.be.a('array');
      });
    });
  });
});
