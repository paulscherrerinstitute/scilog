import requests

# TODO: add params/payload and response validation


def get_request(url, params=None, headers=None, timeout=10):
    response = requests.get(
        url, params=params, headers=headers, timeout=timeout, verify=False
    ).json()
    return response


def post_request(url, payload=None, headers=None, timeout=10):
    response = requests.post(
        url, json=payload, headers=headers, timeout=timeout, verify=False
    ).json()
    return response


def typename(obj):
    return type(obj).__name__
