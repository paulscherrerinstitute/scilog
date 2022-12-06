# swagger_client.LocationControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**location_controller_count**](LocationControllerApi.md#location_controller_count) | **GET** /locations/count | 
[**location_controller_create**](LocationControllerApi.md#location_controller_create) | **POST** /locations | 
[**location_controller_delete_by_id**](LocationControllerApi.md#location_controller_delete_by_id) | **DELETE** /locations/{id} | 
[**location_controller_find**](LocationControllerApi.md#location_controller_find) | **GET** /locations | 
[**location_controller_find_by_id**](LocationControllerApi.md#location_controller_find_by_id) | **GET** /locations/{id} | 
[**location_controller_find_index_in_buffer**](LocationControllerApi.md#location_controller_find_index_in_buffer) | **GET** /locations/index&#x3D;{id} | 
[**location_controller_find_with_search**](LocationControllerApi.md#location_controller_find_with_search) | **GET** /locations/search&#x3D;{search} | 
[**location_controller_restore_deleted_id**](LocationControllerApi.md#location_controller_restore_deleted_id) | **PATCH** /locations/{id}/restore | 
[**location_controller_update_all**](LocationControllerApi.md#location_controller_update_all) | **PATCH** /locations | 
[**location_controller_update_by_id**](LocationControllerApi.md#location_controller_update_by_id) | **PATCH** /locations/{id} | 

# **location_controller_count**
> LoopbackCount location_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.location_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_count: %s\n" % e)
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

# **location_controller_create**
> LocationGroupsCompatibledeprecatedOwnerGroupaccessGroups location_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.location_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

[**LocationGroupsCompatibledeprecatedOwnerGroupaccessGroups**](LocationGroupsCompatibledeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **location_controller_delete_by_id**
> location_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.location_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_delete_by_id: %s\n" % e)
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

# **location_controller_find**
> list[LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] location_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
filter = swagger_client.LocationFilter() # LocationFilter |  (optional)

try:
    api_response = api_instance.location_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**LocationFilter**](.md)|  | [optional] 

### Return type

[**list[LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **location_controller_find_by_id**
> LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups location_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.LocationFilter1() # LocationFilter1 |  (optional)

try:
    api_response = api_instance.location_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**LocationFilter1**](.md)|  | [optional] 

### Return type

[**LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **location_controller_find_index_in_buffer**
> LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups location_controller_find_index_in_buffer(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.LocationFilter() # LocationFilter |  (optional)

try:
    api_response = api_instance.location_controller_find_index_in_buffer(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_find_index_in_buffer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**LocationFilter**](.md)|  | [optional] 

### Return type

[**LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **location_controller_find_with_search**
> list[LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] location_controller_find_with_search(search, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
search = 'search_example' # str | 
filter = swagger_client.LocationFilter() # LocationFilter |  (optional)

try:
    api_response = api_instance.location_controller_find_with_search(search, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_find_with_search: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **str**|  | 
 **filter** | [**LocationFilter**](.md)|  | [optional] 

### Return type

[**list[LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](LocationGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **location_controller_restore_deleted_id**
> location_controller_restore_deleted_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.location_controller_restore_deleted_id(id)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_restore_deleted_id: %s\n" % e)
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

# **location_controller_update_all**
> LoopbackCount location_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.location_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_update_all: %s\n" % e)
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

# **location_controller_update_by_id**
> location_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.LocationControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
body = NULL # dict(str, object) |  (optional)

try:
    api_instance.location_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling LocationControllerApi->location_controller_update_by_id: %s\n" % e)
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

