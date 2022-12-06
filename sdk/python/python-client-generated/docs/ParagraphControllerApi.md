# swagger_client.ParagraphControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**paragraph_controller_count**](ParagraphControllerApi.md#paragraph_controller_count) | **GET** /paragraphs/count | 
[**paragraph_controller_create**](ParagraphControllerApi.md#paragraph_controller_create) | **POST** /paragraphs | 
[**paragraph_controller_delete_by_id**](ParagraphControllerApi.md#paragraph_controller_delete_by_id) | **DELETE** /paragraphs/{id} | 
[**paragraph_controller_find**](ParagraphControllerApi.md#paragraph_controller_find) | **GET** /paragraphs | 
[**paragraph_controller_find_by_id**](ParagraphControllerApi.md#paragraph_controller_find_by_id) | **GET** /paragraphs/{id} | 
[**paragraph_controller_find_index_in_buffer**](ParagraphControllerApi.md#paragraph_controller_find_index_in_buffer) | **GET** /paragraphs/index&#x3D;{id} | 
[**paragraph_controller_find_with_search**](ParagraphControllerApi.md#paragraph_controller_find_with_search) | **GET** /paragraphs/search&#x3D;{search} | 
[**paragraph_controller_restore_deleted_id**](ParagraphControllerApi.md#paragraph_controller_restore_deleted_id) | **PATCH** /paragraphs/{id}/restore | 
[**paragraph_controller_update_all**](ParagraphControllerApi.md#paragraph_controller_update_all) | **PATCH** /paragraphs | 
[**paragraph_controller_update_by_id**](ParagraphControllerApi.md#paragraph_controller_update_by_id) | **PATCH** /paragraphs/{id} | 

# **paragraph_controller_count**
> LoopbackCount paragraph_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.paragraph_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_count: %s\n" % e)
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

# **paragraph_controller_create**
> ParagraphGroupsCompatibledeprecatedOwnerGroupaccessGroups paragraph_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.paragraph_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

[**ParagraphGroupsCompatibledeprecatedOwnerGroupaccessGroups**](ParagraphGroupsCompatibledeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paragraph_controller_delete_by_id**
> paragraph_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.paragraph_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_delete_by_id: %s\n" % e)
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

# **paragraph_controller_find**
> list[ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] paragraph_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
filter = swagger_client.ParagraphFilter() # ParagraphFilter |  (optional)

try:
    api_response = api_instance.paragraph_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**ParagraphFilter**](.md)|  | [optional] 

### Return type

[**list[ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paragraph_controller_find_by_id**
> ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups paragraph_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.ParagraphFilter1() # ParagraphFilter1 |  (optional)

try:
    api_response = api_instance.paragraph_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**ParagraphFilter1**](.md)|  | [optional] 

### Return type

[**ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paragraph_controller_find_index_in_buffer**
> ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups paragraph_controller_find_index_in_buffer(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.ParagraphFilter() # ParagraphFilter |  (optional)

try:
    api_response = api_instance.paragraph_controller_find_index_in_buffer(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_find_index_in_buffer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**ParagraphFilter**](.md)|  | [optional] 

### Return type

[**ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paragraph_controller_find_with_search**
> list[ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] paragraph_controller_find_with_search(search, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
search = 'search_example' # str | 
filter = swagger_client.ParagraphFilter() # ParagraphFilter |  (optional)

try:
    api_response = api_instance.paragraph_controller_find_with_search(search, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_find_with_search: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **str**|  | 
 **filter** | [**ParagraphFilter**](.md)|  | [optional] 

### Return type

[**list[ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](ParagraphGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paragraph_controller_restore_deleted_id**
> paragraph_controller_restore_deleted_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.paragraph_controller_restore_deleted_id(id)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_restore_deleted_id: %s\n" % e)
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

# **paragraph_controller_update_all**
> LoopbackCount paragraph_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.paragraph_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_update_all: %s\n" % e)
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

# **paragraph_controller_update_by_id**
> paragraph_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.ParagraphControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
body = NULL # dict(str, object) |  (optional)

try:
    api_instance.paragraph_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling ParagraphControllerApi->paragraph_controller_update_by_id: %s\n" % e)
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

