# Overview

This chapter outlines the steps needed to install and operate a SciLog instance at your site.

Getting SciLog up and running at your site should be rather straight forward for a test deployment, see chapter [Step by Step Setup](Step_by_Step_Setup.md). However turning into a production ready system may involve a bit more work, because different existing systems will need to be interfaced to SciLog


## Understanding the Components

For the subsequent sections it will be useful to have a "helicopter" overview of the various components that need to play together seamlessly. 


### Backend

At the heart of the SciLog architecture is the [REST API server](https://github.com/paulscherrerinstitute/scilog/tree/main/sci-log-db). This is a  NodeJS application that uses the Loopback 4 framework to generate RESTful APIs. 

The persistence layer behind this API server is a [MongoDB](https://www.mongodb.com/) instance, i.e an open source, NoSQL, document-based database solution. The API server handles alll the bi-directional communication from the REST interface to the Database.

These two components together comprise the "backend" of the architecture.


### Frontend

To the REST server an arbitrary number of "clients" (frontends) can be connected. One of the most important clients is the [web based GUI frontend](https://github.com/paulscherrerinstitute/scilog/tree/main/scilog). The functionality of the GUI is described in the [User manual](../Users.html). This allows to communicate with the SciLog backend in a user friendly way. It is based on the Angular (9+) technology.

In addition to the GUI other clients exist, such as command line (CLI) clients (example exist written in Python)  The CLI tools are especially useful for automated workflows, e.g. to get the data into the electronic logbook from external processes. This process is termed "ingestion" of the data. 

### External systems

The most important external system, that you want to connect to is likely your local identity management (IDM) system, e.g. an LDAP/AD or OIDC based solution. This is usually the source of both the authentication and the authorization information, the latter being realized by simple group membership of the users.

Another important external system, that you may want to connect, is your local proposal handling system (such as DUO at PSI). You can use this information to pre-create logbook instances ready to be used by people joining a specific experiment or measurement time.

 If you do not have such a system you can fill the Proposal Information also by hand, or just leave it empty. If you have such a system you need to write scripts which synchronize the data in these systems with the corresponding tables in the SciCat Database, i.e. the *Proposal* collection. Example of such scripts are provided in  [proposal-sync.yml](https://github.com/paulscherrerinstitute/scilog-ci/blob/main/.github/workflows/proposal-sync.yml)
 
### Underlying Infrastructure

You may or may not run the infrastructure as part of a Kubernetes cluster. E.g. at PSI the API server, the GUI application and the Mongo cluster are all deployed within a Kubernetes cluster. Kubernetes is not necessary to have, but can simplify your life quite a bit. 







