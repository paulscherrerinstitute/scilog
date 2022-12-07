# swagger_client.PingControllerApi

All URIs are relative to *https://pan-ontologies.psi.ch*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ping_controller_ping**](PingControllerApi.md#ping_controller_ping) | **GET** /ping | 

# **ping_controller_ping**
> PingResponse ping_controller_ping()



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.PingControllerApi()

try:
    api_response = api_instance.ping_controller_ping()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling PingControllerApi->ping_controller_ping: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**PingResponse**](PingResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

