# swagger_client.UserControllerApi

All URIs are relative to *https://scilog.qa.psi.ch/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**user_controller_create**](UserControllerApi.md#user_controller_create) | **POST** /users | 
[**user_controller_find_by_id**](UserControllerApi.md#user_controller_find_by_id) | **GET** /users/{userId} | 
[**user_controller_login**](UserControllerApi.md#user_controller_login) | **POST** /users/login | 
[**user_controller_print_current_user**](UserControllerApi.md#user_controller_print_current_user) | **GET** /users/me | 

# **user_controller_create**
> User user_controller_create(body=body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserControllerApi()
body = swagger_client.NewUser() # NewUser |  (optional)

try:
    api_response = api_instance.user_controller_create(body=body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserControllerApi->user_controller_create: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**NewUser**](NewUser.md)|  | [optional] 

### Return type

[**User**](User.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_controller_find_by_id**
> User user_controller_find_by_id(user_id)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserControllerApi(swagger_client.ApiClient(configuration))
user_id = 'user_id_example' # str | 

try:
    api_response = api_instance.user_controller_find_by_id(user_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserControllerApi->user_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user_id** | **str**|  | 

### Return type

[**User**](User.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_controller_login**
> InlineResponse200 user_controller_login(body)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.UserControllerApi()
body = swagger_client.UsersLoginBody() # UsersLoginBody | The input of login function

try:
    api_response = api_instance.user_controller_login(body)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserControllerApi->user_controller_login: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**UsersLoginBody**](UsersLoginBody.md)| The input of login function | 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **user_controller_print_current_user**
> InlineResponse2001 user_controller_print_current_user()



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint


# create an instance of the API class
api_instance = swagger_client.UserControllerApi(swagger_client.ApiClient(configuration))

try:
    api_response = api_instance.user_controller_print_current_user()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UserControllerApi->user_controller_print_current_user: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

