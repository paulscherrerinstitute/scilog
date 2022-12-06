# swagger_client.UserPreferenceControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**user_preference_controller_count**](UserPreferenceControllerApi.md#user_preference_controller_count) | **GET** /user-preferences/count | 
[**user_preference_controller_create**](UserPreferenceControllerApi.md#user_preference_controller_create) | **POST** /user-preferences | 
[**user_preference_controller_delete_by_id**](UserPreferenceControllerApi.md#user_preference_controller_delete_by_id) | **DELETE** /user-preferences/{id} | 
[**user_preference_controller_find**](UserPreferenceControllerApi.md#user_preference_controller_find) | **GET** /user-preferences | 
[**user_preference_controller_find_by_id**](UserPreferenceControllerApi.md#user_preference_controller_find_by_id) | **GET** /user-preferences/{id} | 
[**user_preference_controller_update_all**](UserPreferenceControllerApi.md#user_preference_controller_update_all) | **PATCH** /user-preferences | 
[**user_preference_controller_update_by_id**](UserPreferenceControllerApi.md#user_preference_controller_update_by_id) | **PATCH** /user-preferences/{id} | 

# **user_preference_controller_count**
> LoopbackCount user_preference_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserPreferenceControllerApi(swagger_client.ApiClient(configuration))
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.user_preference_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserPreferenceControllerApi->user_preference_controller_count: %s\n" % e)
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

# **user_preference_controller_create**
> UserPreference user_preference_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserPreferenceControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.user_preference_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserPreferenceControllerApi->user_preference_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**dict(str, object)**](dict.md)|  | [optional] 

### Return type

[**UserPreference**](UserPreference.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_preference_controller_delete_by_id**
> user_preference_controller_delete_by_id(id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserPreferenceControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 

try:
    api_instance.user_preference_controller_delete_by_id(id)
except ApiException as e:
    print("Exception when calling UserPreferenceControllerApi->user_preference_controller_delete_by_id: %s\n" % e)
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

# **user_preference_controller_find**
> list[UserPreferenceWithRelations] user_preference_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserPreferenceControllerApi(swagger_client.ApiClient(configuration))
filter = swagger_client.UserPreferenceFilter1() # UserPreferenceFilter1 |  (optional)

try:
    api_response = api_instance.user_preference_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserPreferenceControllerApi->user_preference_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**UserPreferenceFilter1**](.md)|  | [optional] 

### Return type

[**list[UserPreferenceWithRelations]**](UserPreferenceWithRelations.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_preference_controller_find_by_id**
> UserPreferenceWithRelations user_preference_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserPreferenceControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
filter = swagger_client.UserPreferenceFilter() # UserPreferenceFilter |  (optional)

try:
    api_response = api_instance.user_preference_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserPreferenceControllerApi->user_preference_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**UserPreferenceFilter**](.md)|  | [optional] 

### Return type

[**UserPreferenceWithRelations**](UserPreferenceWithRelations.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_preference_controller_update_all**
> LoopbackCount user_preference_controller_update_all(body=body, where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserPreferenceControllerApi(swagger_client.ApiClient(configuration))
body = NULL # dict(str, object) |  (optional)
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.user_preference_controller_update_all(body=body, where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserPreferenceControllerApi->user_preference_controller_update_all: %s\n" % e)
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

# **user_preference_controller_update_by_id**
> user_preference_controller_update_by_id(id, body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserPreferenceControllerApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | 
body = NULL # dict(str, object) |  (optional)

try:
    api_instance.user_preference_controller_update_by_id(id, body=body)
except ApiException as e:
    print("Exception when calling UserPreferenceControllerApi->user_preference_controller_update_by_id: %s\n" % e)
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

