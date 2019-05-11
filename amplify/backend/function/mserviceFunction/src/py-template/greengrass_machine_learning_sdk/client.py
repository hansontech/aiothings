#
# Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#


def client(client_type, **kwargs):
    if client_type == 'inference':
        from .inference import Client
    else:
        raise Exception('Client type {} is not recognized.'.format(repr(client_type)))

    return Client(**kwargs)