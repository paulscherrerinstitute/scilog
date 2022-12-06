# swagger_client.ImageControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**image_controller_download_file**](ImageControllerApi.md#image_controller_download_file) | **GET** /images/{id} | 

# **image_controller_download_file**
> image_controller_download_file(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ImageControllerApi()
id = 'id_example' # str | 

try:
    api_instance.image_controller_download_file(id)
except ApiException as e:
    print("Exception when calling ImageControllerApi->image_controller_download_file: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

