# swagger_client.LogbookControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**logbook_controller_count**](LogbookControllerApi.md#logbook_controller_count) | **GET** /logbooks/count | 
[**logbook_controller_create**](LogbookControllerApi.md#logbook_controller_create) | **POST** /logbooks | 
[**logbook_controller_delete_by_id**](LogbookControllerApi.md#logbook_controller_delete_by_id) | **DELETE** /logbooks/{id} | 
[**logbook_controller_find**](LogbookControllerApi.md#logbook_controller_find) | **GET** /logbooks | 
[**logbook_controller_find_by_id**](LogbookControllerApi.md#logbook_controller_find_by_id) | **GET** /logbooks/{id} | 
[**logbook_controller_find_index_in_buffer**](LogbookControllerApi.md#logbook_controller_find_index_in_buffer) | **GET** /logbooks/index&#x3D;{id} | 
[**logbook_controller_find_with_search**](LogbookControllerApi.md#logbook_controller_find_with_search) | **GET** /logbooks/search&#x3D;{search} | 
[**logbook_controller_restore_deleted_id**](LogbookControllerApi.md#logbook_controller_restore_deleted_id) | **PATCH** /logbooks/{id}/restore | 
[**logbook_controller_update_all**](LogbookControllerApi.md#logbook_controller_update_all) | **PATCH** /logbooks | 
[**logbook_controller_update_by_id**](LogbookControllerApi.md#logbook_controller_update_by_id) | **PATCH** /logbooks/{id} | 

# **logbook_controller_count**
> LoopbackCount logbook_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.logbook_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_count: %s\n" % e)
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

# **logbook_controller_create**
> LogbookGroupsCompatibledeprecatedOwnerGroupaccessGroups logbook_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.logbook_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

[**LogbookGroupsCompatibledeprecatedOwnerGroupaccessGroups**](LogbookGroupsCompatibledeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logbook_controller_delete_by_id**
> logbook_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.logbook_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_delete_by_id: %s\n" % e)
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

# **logbook_controller_find**
> list[LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] logbook_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
filter = swagger_client.LogbookFilter() # LogbookFilter |  (optional)

try:
    api_response = api_instance.logbook_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**LogbookFilter**](.md)|  | [optional] 

### Return type

[**list[LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logbook_controller_find_by_id**
> LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups logbook_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.LogbookFilter1() # LogbookFilter1 |  (optional)

try:
    api_response = api_instance.logbook_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**LogbookFilter1**](.md)|  | [optional] 

### Return type

[**LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logbook_controller_find_index_in_buffer**
> LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups logbook_controller_find_index_in_buffer(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.LogbookFilter() # LogbookFilter |  (optional)

try:
    api_response = api_instance.logbook_controller_find_index_in_buffer(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_find_index_in_buffer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**LogbookFilter**](.md)|  | [optional] 

### Return type

[**LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logbook_controller_find_with_search**
> list[LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] logbook_controller_find_with_search(search, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
search = 'search_example' # str | 
filter = swagger_client.LogbookFilter() # LogbookFilter |  (optional)

try:
    api_response = api_instance.logbook_controller_find_with_search(search, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_find_with_search: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **str**|  | 
 **filter** | [**LogbookFilter**](.md)|  | [optional] 

### Return type

[**list[LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](LogbookGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logbook_controller_restore_deleted_id**
> logbook_controller_restore_deleted_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.logbook_controller_restore_deleted_id(id)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_restore_deleted_id: %s\n" % e)
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

# **logbook_controller_update_all**
> LoopbackCount logbook_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.logbook_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_update_all: %s\n" % e)
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

# **logbook_controller_update_by_id**
> logbook_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LogbookControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
body = NULL # dict(str, object) |  (optional)

try:
    api_instance.logbook_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling LogbookControllerApi->logbook_controller_update_by_id: %s\n" % e)
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

