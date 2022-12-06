# swagger_client.TaskControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**task_controller_count**](TaskControllerApi.md#task_controller_count) | **GET** /tasks/count | 
[**task_controller_create**](TaskControllerApi.md#task_controller_create) | **POST** /tasks | 
[**task_controller_delete_by_id**](TaskControllerApi.md#task_controller_delete_by_id) | **DELETE** /tasks/{id} | 
[**task_controller_find**](TaskControllerApi.md#task_controller_find) | **GET** /tasks | 
[**task_controller_find_by_id**](TaskControllerApi.md#task_controller_find_by_id) | **GET** /tasks/{id} | 
[**task_controller_find_index_in_buffer**](TaskControllerApi.md#task_controller_find_index_in_buffer) | **GET** /tasks/index&#x3D;{id} | 
[**task_controller_find_with_search**](TaskControllerApi.md#task_controller_find_with_search) | **GET** /tasks/search&#x3D;{search} | 
[**task_controller_restore_deleted_id**](TaskControllerApi.md#task_controller_restore_deleted_id) | **PATCH** /tasks/{id}/restore | 
[**task_controller_update_all**](TaskControllerApi.md#task_controller_update_all) | **PATCH** /tasks | 
[**task_controller_update_by_id**](TaskControllerApi.md#task_controller_update_by_id) | **PATCH** /tasks/{id} | 

# **task_controller_count**
> LoopbackCount task_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.task_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_count: %s\n" % e)
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

# **task_controller_create**
> TaskGroupsCompatibledeprecatedOwnerGroupaccessGroups task_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.task_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

[**TaskGroupsCompatibledeprecatedOwnerGroupaccessGroups**](TaskGroupsCompatibledeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **task_controller_delete_by_id**
> task_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.task_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_delete_by_id: %s\n" % e)
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

# **task_controller_find**
> list[TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] task_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
filter = swagger_client.TaskFilter2() # TaskFilter2 |  (optional)

try:
    api_response = api_instance.task_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**TaskFilter2**](.md)|  | [optional] 

### Return type

[**list[TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **task_controller_find_by_id**
> TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups task_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.TaskFilter1() # TaskFilter1 |  (optional)

try:
    api_response = api_instance.task_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**TaskFilter1**](.md)|  | [optional] 

### Return type

[**TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **task_controller_find_index_in_buffer**
> TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups task_controller_find_index_in_buffer(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.TaskFilter() # TaskFilter |  (optional)

try:
    api_response = api_instance.task_controller_find_index_in_buffer(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_find_index_in_buffer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**TaskFilter**](.md)|  | [optional] 

### Return type

[**TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **task_controller_find_with_search**
> list[TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] task_controller_find_with_search(search, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
search = 'search_example' # str | 
filter = swagger_client.TaskFilter() # TaskFilter |  (optional)

try:
    api_response = api_instance.task_controller_find_with_search(search, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_find_with_search: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **str**|  | 
 **filter** | [**TaskFilter**](.md)|  | [optional] 

### Return type

[**list[TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](TaskGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **task_controller_restore_deleted_id**
> task_controller_restore_deleted_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.task_controller_restore_deleted_id(id)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_restore_deleted_id: %s\n" % e)
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

# **task_controller_update_all**
> LoopbackCount task_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.task_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_update_all: %s\n" % e)
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

# **task_controller_update_by_id**
> task_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.TaskControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
body = NULL # dict(str, object) |  (optional)

try:
    api_instance.task_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling TaskControllerApi->task_controller_update_by_id: %s\n" % e)
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

