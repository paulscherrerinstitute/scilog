# swagger_client.ViewControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**view_controller_count**](ViewControllerApi.md#view_controller_count) | **GET** /views/count | 
[**view_controller_create**](ViewControllerApi.md#view_controller_create) | **POST** /views | 
[**view_controller_delete_by_id**](ViewControllerApi.md#view_controller_delete_by_id) | **DELETE** /views/{id} | 
[**view_controller_find**](ViewControllerApi.md#view_controller_find) | **GET** /views | 
[**view_controller_find_by_id**](ViewControllerApi.md#view_controller_find_by_id) | **GET** /views/{id} | 
[**view_controller_update_all**](ViewControllerApi.md#view_controller_update_all) | **PATCH** /views | 
[**view_controller_update_by_id**](ViewControllerApi.md#view_controller_update_by_id) | **PATCH** /views/{id} | 

# **view_controller_count**
> LoopbackCount view_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ViewControllerApi()
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.view_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ViewControllerApi->view_controller_count: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | [**dict(str, object)**](object.md)|  | [optional] 

### Return type

[**LoopbackCount**](LoopbackCount.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **view_controller_create**
> ViewGroupsCompatibledeprecatedOwnerGroupaccessGroups view_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ViewControllerApi()
body = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.view_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ViewControllerApi->view_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

[**ViewGroupsCompatibledeprecatedOwnerGroupaccessGroups**](ViewGroupsCompatibledeprecatedOwnerGroupaccessGroups.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **view_controller_delete_by_id**
> view_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ViewControllerApi()
id = 'id_example' # str | 

try:
    api_instance.view_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling ViewControllerApi->view_controller_delete_by_id: %s\n" % e)
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

# **view_controller_find**
> list[ViewGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] view_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ViewControllerApi()
filter = swagger_client.ViewFilter1() # ViewFilter1 |  (optional)

try:
    api_response = api_instance.view_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ViewControllerApi->view_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**ViewFilter1**](.md)|  | [optional] 

### Return type

[**list[ViewGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](ViewGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **view_controller_find_by_id**
> ViewGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups view_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ViewControllerApi()
id = 'id_example' # str | 
filter = swagger_client.ViewFilter() # ViewFilter |  (optional)

try:
    api_response = api_instance.view_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ViewControllerApi->view_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**ViewFilter**](.md)|  | [optional] 

### Return type

[**ViewGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](ViewGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **view_controller_update_all**
> LoopbackCount view_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ViewControllerApi()
body = NULL # dict(str, object) |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.view_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ViewControllerApi->view_controller_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 
 **where** | [**dict(str, object)**](object.md)|  | [optional] 

### Return type

[**LoopbackCount**](LoopbackCount.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **view_controller_update_by_id**
> view_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.ViewControllerApi()
id = 'id_example' # str | 
body = NULL # dict(str, object) |  (optional)

try:
    api_instance.view_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling ViewControllerApi->view_controller_update_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

