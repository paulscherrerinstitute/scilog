# swagger_client.TechniqueControllerApi

All URIs are relative to *https://pan-ontologies.psi.ch*

Method | HTTP request | Description
------------- | ------------- | -------------
[**technique_controller_count**](TechniqueControllerApi.md#technique_controller_count) | **GET** /techniques/count | 
[**technique_controller_find**](TechniqueControllerApi.md#technique_controller_find) | **GET** /techniques | 
[**technique_controller_find_by_id**](TechniqueControllerApi.md#technique_controller_find_by_id) | **GET** /techniques/{id} | 
[**technique_controller_find_pan_ontology**](TechniqueControllerApi.md#technique_controller_find_pan_ontology) | **GET** /techniques/pan-ontology | 

# **technique_controller_count**
> LoopbackCount technique_controller_count(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.TechniqueControllerApi()
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.technique_controller_count(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TechniqueControllerApi->technique_controller_count: %s\n" % e)
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

# **technique_controller_find**
> list[TechniqueWithRelations] technique_controller_find(filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.TechniqueControllerApi()
filter = swagger_client.TechniqueFilter1() # TechniqueFilter1 |  (optional)

try:
    api_response = api_instance.technique_controller_find(filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TechniqueControllerApi->technique_controller_find: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **filter** | [**TechniqueFilter1**](.md)|  | [optional] 

### Return type

[**list[TechniqueWithRelations]**](TechniqueWithRelations.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **technique_controller_find_by_id**
> TechniqueWithRelations technique_controller_find_by_id(id, filter=filter)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.TechniqueControllerApi()
id = 'id_example' # str | 
filter = swagger_client.TechniqueFilter() # TechniqueFilter |  (optional)

try:
    api_response = api_instance.technique_controller_find_by_id(id, filter=filter)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TechniqueControllerApi->technique_controller_find_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **filter** | [**TechniqueFilter**](.md)|  | [optional] 

### Return type

[**TechniqueWithRelations**](TechniqueWithRelations.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **technique_controller_find_pan_ontology**
> list[TechniqueWithRelations] technique_controller_find_pan_ontology(where=where)



### Example
```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = swagger_client.TechniqueControllerApi()
where = NULL # dict(str, object) |  (optional)

try:
    api_response = api_instance.technique_controller_find_pan_ontology(where=where)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling TechniqueControllerApi->technique_controller_find_pan_ontology: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **where** | [**dict(str, object)**](object.md)|  | [optional] 

### Return type

[**list[TechniqueWithRelations]**](TechniqueWithRelations.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

