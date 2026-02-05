from distutils.core import setup

setup(
    name="scilog",
    version="1.1",
    description="Scilog SDK",
    author="Paul Scherrer Institute, Switzerland",
    author_email="scilog-help@lists.psi.ch",
    packages=["scilog"],
    install_requires=["requests >= 2.28.1", "typeguard~=4.0"],
)
