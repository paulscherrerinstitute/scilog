# swagger_client.BasesnippetControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**basesnippet_controller_count**](BasesnippetControllerApi.md#basesnippet_controller_count) | **GET** /basesnippets/count | 
[**basesnippet_controller_create**](BasesnippetControllerApi.md#basesnippet_controller_create) | **POST** /basesnippets | 
[**basesnippet_controller_delete_by_id**](BasesnippetControllerApi.md#basesnippet_controller_delete_by_id) | **DELETE** /basesnippets/{id} | 
[**basesnippet_controller_find**](BasesnippetControllerApi.md#basesnippet_controller_find) | **GET** /basesnippets | 
[**basesnippet_controller_find_by_id**](BasesnippetControllerApi.md#basesnippet_controller_find_by_id) | **GET** /basesnippets/{id} | 
[**basesnippet_controller_find_index_in_buffer**](BasesnippetControllerApi.md#basesnippet_controller_find_index_in_buffer) | **GET** /basesnippets/index&#x3D;{id} | 
[**basesnippet_controller_find_with_search**](BasesnippetControllerApi.md#basesnippet_controller_find_with_search) | **GET** /basesnippets/search&#x3D;{search} | 
[**basesnippet_controller_prepare_export**](BasesnippetControllerApi.md#basesnippet_controller_prepare_export) | **GET** /basesnippets/export&#x3D;{exportType} | 
[**basesnippet_controller_restore_deleted_id**](BasesnippetControllerApi.md#basesnippet_controller_restore_deleted_id) | **PATCH** /basesnippets/{id}/restore | 
[**basesnippet_controller_update_all**](BasesnippetControllerApi.md#basesnippet_controller_update_all) | **PATCH** /basesnippets | 
[**basesnippet_controller_update_by_id**](BasesnippetControllerApi.md#basesnippet_controller_update_by_id) | **PATCH** /basesnippets/{id} | 

# **basesnippet_controller_count**
> LoopbackCount basesnippet_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.basesnippet_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_count: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | [**dict(str, object)**](object.md)|  | [optional] 

### Return type

[**LoopbackCount**](LoopbackCount.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_create**
> BasesnippetGroupsCompatibledeprecatedOwnerGroupaccessGroups basesnippet_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.basesnippet_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

[**BasesnippetGroupsCompatibledeprecatedOwnerGroupaccessGroups**](BasesnippetGroupsCompatibledeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_delete_by_id**
> basesnippet_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.basesnippet_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_delete_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

void (empty response body)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_find**
> list[BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] basesnippet_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
filter = swagger_client.BasesnippetFilter1() # BasesnippetFilter1 |  (optional)

try:
    api_response = api_instance.basesnippet_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**BasesnippetFilter1**](.md)|  | [optional] 

### Return type

[**list[BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_find_by_id**
> BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups basesnippet_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.BasesnippetFilter2() # BasesnippetFilter2 |  (optional)

try:
    api_response = api_instance.basesnippet_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**BasesnippetFilter2**](.md)|  | [optional] 

### Return type

[**BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_find_index_in_buffer**
> BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups basesnippet_controller_find_index_in_buffer(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.BasesnippetFilter() # BasesnippetFilter |  (optional)

try:
    api_response = api_instance.basesnippet_controller_find_index_in_buffer(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_find_index_in_buffer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**BasesnippetFilter**](.md)|  | [optional] 

### Return type

[**BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_find_with_search**
> list[BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] basesnippet_controller_find_with_search(search, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
search = 'search_example' # str | 
filter = swagger_client.BasesnippetFilter1() # BasesnippetFilter1 |  (optional)

try:
    api_response = api_instance.basesnippet_controller_find_with_search(search, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_find_with_search: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **str**|  | 
 **filter** | [**BasesnippetFilter1**](.md)|  | [optional] 

### Return type

[**list[BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_prepare_export**
> list[BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] basesnippet_controller_prepare_export(export_type, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
export_type = 'export_type_example' # str | 
filter = swagger_client.BasesnippetFilter() # BasesnippetFilter |  (optional)

try:
    api_response = api_instance.basesnippet_controller_prepare_export(export_type, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_prepare_export: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **export_type** | **str**|  | 
 **filter** | [**BasesnippetFilter**](.md)|  | [optional] 

### Return type

[**list[BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](BasesnippetGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_restore_deleted_id**
> basesnippet_controller_restore_deleted_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.basesnippet_controller_restore_deleted_id(id)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_restore_deleted_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

void (empty response body)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_update_all**
> LoopbackCount basesnippet_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.basesnippet_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 
 **where** | [**dict(str, object)**](object.md)|  | [optional] 

### Return type

[**LoopbackCount**](LoopbackCount.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **basesnippet_controller_update_by_id**
> basesnippet_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.BasesnippetControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
body = NULL # dict(str, object) |  (optional)

try:
    api_instance.basesnippet_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling BasesnippetControllerApi->basesnippet_controller_update_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

void (empty response body)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

