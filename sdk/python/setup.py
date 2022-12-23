from distutils.core import setup

setup(
    name="scilog",
    version="1.0",
    description="Scilog SDK",
    author="Klaus Wakonig",
    author_email="klaus.wakonig@psi.ch",
    packages=[
        "scilog",
    ],
    install_requires=[
        "requests >= 2.28.1",
        "typeguard==2.13.3",
    ],
)
