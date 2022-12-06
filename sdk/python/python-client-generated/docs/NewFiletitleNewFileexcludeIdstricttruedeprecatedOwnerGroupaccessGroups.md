# NewFiletitleNewFileexcludeIdstricttruedeprecatedOwnerGroupaccessGroups

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**owner_group** | **str** | ownerGroup field is deprecated. Please create an ACL upfront and reference it through the aclId at snippet creation | [optional] 
**access_groups** | **list[str]** |  | [optional] 
**snippet_type** | **str** | Defines what type of information snippet is added, such as paragraph, image etc. | [optional] 
**is_private** | **bool** | Private snippets are meant not to be exported, e.g. as metadata to the data catalog. Often used for chat like communication | [optional] 
**default_order** | **float** | Default display order is given by createdAt Time in ms*1000. Override to allow to place snippet between existing other snippets created in the past | [optional] 
**created_at** | **datetime** |  | [optional] 
**created_by** | **str** | email of the user adding this view | [optional] 
**updated_at** | **datetime** |  | [optional] 
**expires_at** | **datetime** | Date after which the snippet becomes read only. | [optional] 
**updated_by** | **str** | email of the user updating this view | [optional] 
**create_acl** | **list[str]** |  | [optional] 
**read_acl** | **list[str]** |  | [optional] 
**update_acl** | **list[str]** |  | [optional] 
**delete_acl** | **list[str]** |  | [optional] 
**share_acl** | **list[str]** |  | [optional] 
**admin_acl** | **list[str]** |  | [optional] 
**calculated_acls** | **str** | ACL flags (UDSA) calculated for current user, taking her role into account | [optional] 
**parent_id** | **str** |  | [optional] 
**tags** | **list[str]** |  | [optional] 
**dashboard_name** | **str** | Human readable name of single snippet | [optional] 
**versionable** | **bool** | Versionable snippets will create a new history entry upon update. | [optional] 
**deleted** | **bool** | Defines whether the snippet has been deleted.  | [optional] 
**name** | **str** | Optional name of file as presented to user in GUI | [optional] 
**description** | **str** | Optional detailed definition of contents and purpose of this file | [optional] 
**filename** | **str** | Name of the file | [optional] 
**file_extension** | **str** | File extension of the file | [optional] 
**content_type** | **str** | Content type of the file, e.g. image/jpeg | [optional] 
**access_hash** | **str** | Access hash for directly accessing the resource. | [optional] 
**file_id** | **str** | File id of the file | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

