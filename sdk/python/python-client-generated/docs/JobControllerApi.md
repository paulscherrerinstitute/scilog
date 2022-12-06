# swagger_client.JobControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**job_controller_count**](JobControllerApi.md#job_controller_count) | **GET** /jobs/count | 
[**job_controller_create**](JobControllerApi.md#job_controller_create) | **POST** /jobs | 
[**job_controller_delete_by_id**](JobControllerApi.md#job_controller_delete_by_id) | **DELETE** /jobs/{id} | 
[**job_controller_find**](JobControllerApi.md#job_controller_find) | **GET** /jobs | 
[**job_controller_find_by_id**](JobControllerApi.md#job_controller_find_by_id) | **GET** /jobs/{id} | 
[**job_controller_update_all**](JobControllerApi.md#job_controller_update_all) | **PATCH** /jobs | 
[**job_controller_update_by_id**](JobControllerApi.md#job_controller_update_by_id) | **PATCH** /jobs/{id} | 

# **job_controller_count**
> LoopbackCount job_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.JobControllerApi(swagger_client.ApiClient(configuration))
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.job_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling JobControllerApi->job_controller_count: %s\n" % e)
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

# **job_controller_create**
> JobGroupsCompatibledeprecatedOwnerGroupaccessGroups job_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.JobControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.job_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling JobControllerApi->job_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

[**JobGroupsCompatibledeprecatedOwnerGroupaccessGroups**](JobGroupsCompatibledeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **job_controller_delete_by_id**
> job_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.JobControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.job_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling JobControllerApi->job_controller_delete_by_id: %s\n" % e)
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

# **job_controller_find**
> list[JobGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups] job_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.JobControllerApi(swagger_client.ApiClient(configuration))
filter = swagger_client.JobFilter1() # JobFilter1 |  (optional)

try:
    api_response = api_instance.job_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling JobControllerApi->job_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**JobFilter1**](.md)|  | [optional] 

### Return type

[**list[JobGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups]**](JobGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **job_controller_find_by_id**
> JobGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups job_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.JobControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.JobFilter() # JobFilter |  (optional)

try:
    api_response = api_instance.job_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling JobControllerApi->job_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**JobFilter**](.md)|  | [optional] 

### Return type

[**JobGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups**](JobGroupsCompatibleincludeRelationstruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **job_controller_update_all**
> LoopbackCount job_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.JobControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.job_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling JobControllerApi->job_controller_update_all: %s\n" % e)
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

# **job_controller_update_by_id**
> job_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.JobControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
body = NULL # dict(str, object) |  (optional)

try:
    api_instance.job_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling JobControllerApi->job_controller_update_by_id: %s\n" % e)
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

