# coding: utf-8

"""
    sci-log-db

    SciLogDB  # noqa: E501

    OpenAPI spec version: 1.0.0
    
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

from __future__ import absolute_import

import unittest

import swagger_client
from swagger_client.api.user_controller_api import UserControllerApi  # noqa: E501
from swagger_client.rest import ApiException


class TestUserControllerApi(unittest.TestCase):
    """UserControllerApi unit test stubs"""

    def setUp(self):
        self.api = UserControllerApi()  # noqa: E501

    def tearDown(self):
        pass

    def test_user_controller_create(self):
        """Test case for user_controller_create

        """
        pass

    def test_user_controller_find_by_id(self):
        """Test case for user_controller_find_by_id

        """
        pass

    def test_user_controller_login(self):
        """Test case for user_controller_login

        """
        pass

    def test_user_controller_print_current_user(self):
        """Test case for user_controller_print_current_user

        """
        pass


if __name__ == '__main__':
    unittest.main()