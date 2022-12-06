# swagger_client.FileControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**file_controller_count**](FileControllerApi.md#file_controller_count) | **GET** /filesnippet/count | 
[**file_controller_create**](FileControllerApi.md#file_controller_create) | **POST** /filesnippet | 
[**file_controller_delete_by_id**](FileControllerApi.md#file_controller_delete_by_id) | **DELETE** /filesnippet/{id} | 
[**file_controller_download_file**](FileControllerApi.md#file_controller_download_file) | **GET** /filesnippet/{id}/files | 
[**file_controller_file_upload**](FileControllerApi.md#file_controller_file_upload) | **POST** /filesnippet/files | 
[**file_controller_find**](FileControllerApi.md#file_controller_find) | **GET** /filesnippet | 
[**file_controller_find_by_id**](FileControllerApi.md#file_controller_find_by_id) | **GET** /filesnippet/{id} | 
[**file_controller_find_index_in_buffer**](FileControllerApi.md#file_controller_find_index_in_buffer) | **GET** /filesnippet/index&#x3D;{id} | 
[**file_controller_find_with_search**](FileControllerApi.md#file_controller_find_with_search) | **GET** /filesnippet/search&#x3D;{search} | 
[**file_controller_restore_deleted_id**](FileControllerApi.md#file_controller_restore_deleted_id) | **PATCH** /filesnippet/{id}/restore | 
[**file_controller_update_all**](FileControllerApi.md#file_controller_update_all) | **PATCH** /filesnippet | 
[**file_controller_update_by_id**](FileControllerApi.md#file_controller_update_by_id) | **PATCH** /filesnippet/{id} | 
[**file_controller_update_by_id_with_file**](FileControllerApi.md#file_controller_update_by_id_with_file) | **PATCH** /filesnippet/{id}/files | 

# **file_controller_count**
> LoopbackCount file_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.file_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_count: %s\n" % e)
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

# **file_controller_create**
> FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups file_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
body = swagger_client.NewFiletitleNewFileexcludeIdstricttruedeprecatedOwnerGroupaccessGroups() # NewFiletitleNewFileexcludeIdstricttruedeprecatedOwnerGroupaccessGroups |  (optional)

try:
    api_response = api_instance.file_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**NewFiletitleNewFileexcludeIdstricttruedeprecatedOwnerGroupaccessGroups**](NewFiletitleNewFileexcludeIdstricttruedeprecatedOwnerGroupaccessGroups.md)|  | [optional] 

### Return type

[**FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups**](FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_delete_by_id**
> file_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.file_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_delete_by_id: %s\n" % e)
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

# **file_controller_download_file**
> file_controller_download_file(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.FilesnippetFilter() # FilesnippetFilter |  (optional)

try:
    api_instance.file_controller_download_file(id, filter=filter)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_download_file: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**FilesnippetFilter**](.md)|  | [optional] 

### Return type

void (empty response body)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_file_upload**
> object file_controller_file_upload(fields, file)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
fields = swagger_client.FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups() # FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups | 
file = 'file_example' # str | 

try:
    api_response = api_instance.file_controller_file_upload(fields, file)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_file_upload: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fields** | [**FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups**](.md)|  | 
 **file** | **str**|  | 

### Return type

**object**

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_find**
> list[FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups] file_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
filter = swagger_client.FilesnippetFilter1() # FilesnippetFilter1 |  (optional)

try:
    api_response = api_instance.file_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**FilesnippetFilter1**](.md)|  | [optional] 

### Return type

[**list[FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups]**](FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_find_by_id**
> FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups file_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.FilesnippetFilter() # FilesnippetFilter |  (optional)

try:
    api_response = api_instance.file_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**FilesnippetFilter**](.md)|  | [optional] 

### Return type

[**FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups**](FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_find_index_in_buffer**
> FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups file_controller_find_index_in_buffer(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.FilesnippetFilter() # FilesnippetFilter |  (optional)

try:
    api_response = api_instance.file_controller_find_index_in_buffer(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_find_index_in_buffer: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**FilesnippetFilter**](.md)|  | [optional] 

### Return type

[**FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups**](FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_find_with_search**
> list[FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups] file_controller_find_with_search(search, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
search = 'search_example' # str | 
filter = swagger_client.FilesnippetFilter1() # FilesnippetFilter1 |  (optional)

try:
    api_response = api_instance.file_controller_find_with_search(search, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_find_with_search: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **search** | **str**|  | 
 **filter** | [**FilesnippetFilter1**](.md)|  | [optional] 

### Return type

[**list[FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups]**](FilesnippetGroupsCompatibleincludeRelationstruestricttruedeprecatedOwnerGroupaccessGroups.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_restore_deleted_id**
> file_controller_restore_deleted_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.file_controller_restore_deleted_id(id)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_restore_deleted_id: %s\n" % e)
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

# **file_controller_update_all**
> LoopbackCount file_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
body = swagger_client.FilesnippetGroupsCompatiblepartialtruestricttruedeprecatedOwnerGroupaccessGroups() # FilesnippetGroupsCompatiblepartialtruestricttruedeprecatedOwnerGroupaccessGroups |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.file_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_update_all: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**FilesnippetGroupsCompatiblepartialtruestricttruedeprecatedOwnerGroupaccessGroups**](FilesnippetGroupsCompatiblepartialtruestricttruedeprecatedOwnerGroupaccessGroups.md)|  | [optional] 
 **where** | [**dict(str, object)**](object.md)|  | [optional] 

### Return type

[**LoopbackCount**](LoopbackCount.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_update_by_id**
> file_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
body = swagger_client.FilesnippetGroupsCompatiblepartialtruestricttruedeprecatedOwnerGroupaccessGroups() # FilesnippetGroupsCompatiblepartialtruestricttruedeprecatedOwnerGroupaccessGroups |  (optional)

try:
    api_instance.file_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_update_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **body** | [**FilesnippetGroupsCompatiblepartialtruestricttruedeprecatedOwnerGroupaccessGroups**](FilesnippetGroupsCompatiblepartialtruestricttruedeprecatedOwnerGroupaccessGroups.md)|  | [optional] 

### Return type

void (empty response body)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **file_controller_update_by_id_with_file**
> object file_controller_update_by_id_with_file(fields, file, id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.FileControllerApi(swagger_client.ApiClient(configuration))
fields = swagger_client.FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups() # FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups | 
file = 'file_example' # str | 
id = 'id_example' # str | 

try:
    api_response = api_instance.file_controller_update_by_id_with_file(fields, file, id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling FileControllerApi->file_controller_update_by_id_with_file: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fields** | [**FilesnippetGroupsCompatiblestricttruedeprecatedOwnerGroupaccessGroups**](.md)|  | 
 **file** | **str**|  | 
 **id** | **str**|  | 

### Return type

**object**

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

