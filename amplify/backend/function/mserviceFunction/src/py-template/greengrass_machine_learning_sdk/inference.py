#
# Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#

import base64
import json
import os
import re

from io import BytesIO

from greengrass_ipc_python_sdk.ipc_facade import GreengrassServiceClient, GreengrassServiceMessage, GreengrassRuntimeException
from greengrass_common.env_vars import GGC_MAX_INTERFACE_VERSION
from greengrass_common.parse_version import parse_version

ALGO_TYPE = 'AlgoType'
SERVICE_NAME = 'ServiceName'
BODY = 'Body'
CONTENT_TYPE_PARAM = 'ContentType'
CONTENT_TYPE_HEADER = 'Content-Type'
ACCEPT = 'Accept'

sdk_IV_major = 1
sdk_IV_minor = 2

algo_type_pattern = re.compile('^[a-zA-Z0-9][a-zA-Z0-9-]{1,62}$')
service_name_pattern = re.compile('^[a-zA-Z0-9][a-zA-Z0-9-]{1,62}$')

class GreengrassInferenceException(Exception):
    """
        Exception for Greengrass inference error
    """
    pass


class GreengrassDependencyException(Exception):
    """
        Exception for Greengrass error
    """
    pass

def validate_required_gg_interface():
    max_IV_major, max_IV_minor = parse_version(GGC_MAX_INTERFACE_VERSION)
    if int(sdk_IV_major) != int(max_IV_major) or int(sdk_IV_minor) > int(max_IV_minor):
        err = ValueError('There was a version incompatibility between the Greengrass Machine Learning SDK used ' +
                         'by your function and the Greengrass Core. Please visit the AWS Greengrass Developer Guide for version compatibility information')
        raise err

class Client(object):
    def __init__(self):
        validate_required_gg_interface()
        self._gg_service_client = GreengrassServiceClient()

    def invoke_inference_service(self, **kwargs):
        """
            :param kwargs:
                AlgoType: the type of algorithm supported by the SDK
                ServiceName: the alias of the local inference service
                Body: holds the request body
                Accept: [Optional] specify the content-type expected for the response
                ContentType: specify the type of message in the Body
            :return:
                Body: Streamingbody holding the inference response
                Content-Type: content-type for the response
        """
        aws_region = os.environ['AWS_REGION']

        if SERVICE_NAME not in kwargs:
            raise ValueError(
                SERVICE_NAME + ' argument of Inference.Client.invoke_inference_service is a required argument but was not provided'
            )

        if BODY not in kwargs:
            raise ValueError(
                BODY + ' argument of Inference.Client.invoke_inference_service is a required argument but was not provided'
            )

        if ALGO_TYPE not in kwargs:
            raise ValueError(
                ALGO_TYPE + ' argument of Inference.Client.invoke_inference_service is a required argument but was not provided'
            )

        algo_type = kwargs.get(ALGO_TYPE)
        service_name = kwargs.get(SERVICE_NAME)

        if not algo_type_pattern.match(algo_type):
            raise ValueError('field algo_type must match the regex ^[a-zA-Z0-9][a-zA-Z0-9-]{1,62}$')

        if not service_name_pattern.match(service_name):
            raise ValueError('field service_name must match the regex ^[a-zA-Z0-9][a-zA-Z0-9-]{1,62}$')

        body = kwargs.get(BODY)

        metadata = {}

        if CONTENT_TYPE_PARAM in kwargs:
            metadata[CONTENT_TYPE_HEADER] = kwargs.get(CONTENT_TYPE_PARAM)

        if ACCEPT in kwargs:
            metadata[ACCEPT] = kwargs.get(ACCEPT)

        context = base64.b64encode(json.dumps(
            {'custom': metadata}).encode('utf-8'))

        msg = GreengrassServiceMessage(context, body)

        address = 'arn:aws:lambda:{}:aws:function:GG-ML-INF-{}-{}'.format(aws_region, algo_type, service_name)

        try:
            output = self._gg_service_client.call(address, msg)
            if output.error_response:
                raise GreengrassInferenceException(output.error_response)
            else:
                resp = json.loads(output.response.payload)
                resp[BODY] = StreamingBody(str(resp[BODY]))
                return resp
        except GreengrassRuntimeException as e:
            raise GreengrassDependencyException(e.message)


class StreamingBody(object):
    """Wrapper class for http response payload.

    This provides a consistent interface to Boto3 SageMaker SDK
    """

    def __init__(self, payload):
        self._raw_stream = BytesIO(payload)
        self._amount_read = 0

    def read(self, amt=None):
        """Read at most amt bytes from the stream.
        If the amt argument is omitted, read all data.
        """
        chunk = self._raw_stream.read(amt)
        self._amount_read += len(chunk)
        return chunk

    def close(self):
        self._raw_stream.close()