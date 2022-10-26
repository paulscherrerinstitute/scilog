# SciLog Developer Guide

This guide aims to help developers understand the overall structure of the software and therefore enables people to contribute to the development of the software. See also the [Overview in the Operator Manual](../Operator/) for a helicopter view of the involved components.

If you want to contribute to the software you should also read the [Contributing](../Development/Contributing.html) and [GitHub flow](../Development/GitHubFlow.html)sections


# Getting an development environment set up
Start by reading the [local development section](../Development/LocalDevelopment.html)

# Architecture
SciLog is built on micro services using the following stack:

## Backend/API

* [Node 12.x](https://nodejs.org/en/)
* [Loopback 4](https://loopback.io/lb4)
* [MongoDB 4.x or later](https://www.mongodb.com)

The most important part to understand is how loopback works, because it is the platform which is directly addressed as part of the development. Please check the corresponding Loopback 4 documentation for all details

## Frontend/Web Browser Client

* [Angular 9+](https://angular.io/) 
* [Angular Material Widgets and Design](https://material.angular.io/) 
* [Loopback SDK generator for Angular](https://github.com/mean-expert-official/loopback-sdk-builder)


Again please of a look at the original documentation to understand how these tools and frameworks work.

