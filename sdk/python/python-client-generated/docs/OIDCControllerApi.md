# swagger_client.OIDCControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**o_idc_controller_login_to_third_party**](OIDCControllerApi.md#o_idc_controller_login_to_third_party) | **GET** /auth/thirdparty/{provider} | 
[**o_idc_controller_third_party_call_back**](OIDCControllerApi.md#o_idc_controller_third_party_call_back) | **GET** /auth/{provider}/callback | 

# **o_idc_controller_login_to_third_party**
> o_idc_controller_login_to_third_party(provider)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OIDCControllerApi()
provider = 'provider_example' # str | 

try:
    api_instance.o_idc_controller_login_to_third_party(provider)
except ApiException as e:
    print("Exception when calling OIDCControllerApi->o_idc_controller_login_to_third_party: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **str**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **o_idc_controller_third_party_call_back**
> o_idc_controller_third_party_call_back(provider)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.OIDCControllerApi()
provider = 'provider_example' # str | 

try:
    api_instance.o_idc_controller_third_party_call_back(provider)
except ApiException as e:
    print("Exception when calling OIDCControllerApi->o_idc_controller_third_party_call_back: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **str**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

