# coding: utf-8

"""
    sci-log-db

    SciLogDB  # noqa: E501

    OpenAPI spec version: 1.0.0
    
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

import pprint
import re  # noqa: F401

import six

class ViewIncludeFilterItems(object):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    """
    Attributes:
      swagger_types (dict): The key is attribute name
                            and the value is attribute type.
      attribute_map (dict): The key is attribute name
                            and the value is json key in definition.
    """
    swagger_types = {
        'relation': 'str',
        'scope': 'ViewScopeFilter'
    }

    attribute_map = {
        'relation': 'relation',
        'scope': 'scope'
    }

    def __init__(self, relation=None, scope=None):  # noqa: E501
        """ViewIncludeFilterItems - a model defined in Swagger"""  # noqa: E501
        self._relation = None
        self._scope = None
        self.discriminator = None
        if relation is not None:
            self.relation = relation
        if scope is not None:
            self.scope = scope

    @property
    def relation(self):
        """Gets the relation of this ViewIncludeFilterItems.  # noqa: E501


        :return: The relation of this ViewIncludeFilterItems.  # noqa: E501
        :rtype: str
        """
        return self._relation

    @relation.setter
    def relation(self, relation):
        """Sets the relation of this ViewIncludeFilterItems.


        :param relation: The relation of this ViewIncludeFilterItems.  # noqa: E501
        :type: str
        """

        self._relation = relation

    @property
    def scope(self):
        """Gets the scope of this ViewIncludeFilterItems.  # noqa: E501


        :return: The scope of this ViewIncludeFilterItems.  # noqa: E501
        :rtype: ViewScopeFilter
        """
        return self._scope

    @scope.setter
    def scope(self, scope):
        """Sets the scope of this ViewIncludeFilterItems.


        :param scope: The scope of this ViewIncludeFilterItems.  # noqa: E501
        :type: ViewScopeFilter
        """

        self._scope = scope

    def to_dict(self):
        """Returns the model properties as a dict"""
        result = {}

        for attr, _ in six.iteritems(self.swagger_types):
            value = getattr(self, attr)
            if isinstance(value, list):
                result[attr] = list(map(
                    lambda x: x.to_dict() if hasattr(x, "to_dict") else x,
                    value
                ))
            elif hasattr(value, "to_dict"):
                result[attr] = value.to_dict()
            elif isinstance(value, dict):
                result[attr] = dict(map(
                    lambda item: (item[0], item[1].to_dict())
                    if hasattr(item[1], "to_dict") else item,
                    value.items()
                ))
            else:
                result[attr] = value
        if issubclass(ViewIncludeFilterItems, dict):
            for key, value in self.items():
                result[key] = value

        return result

    def to_str(self):
        """Returns the string representation of the model"""
        return pprint.pformat(self.to_dict())

    def __repr__(self):
        """For `print` and `pprint`"""
        return self.to_str()

    def __eq__(self, other):
        """Returns true if both objects are equal"""
        if not isinstance(other, ViewIncludeFilterItems):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other