# Login

To get access to the data, for which you have read access, you first have to login. 

TODO add screenshot ![Login to SciLog](img/login.png)

There are two types of account associated with SciLog: *User* and *Functional* . 

In most cases you login with your personal *User* account. *User* accounts are tied into the login system that is used by your institution, for example: Active Directory or an OIDC identity provider. You are able to log into the system using the same credentials you use on that account. This process is called *authentication* in IT tech terminology.

A *functional* account will primarily be used by instrument responsibles or beamline managers for automated tasks and ingests. Also the general "admin" user is  a functional account. Functional accounts and their passwords are stored within SciLog itself and are defined at boot time of the application.

When you login, your user management system will assign groups (think of them as *roles*) to the logged in user. These roles are the basis of authorization decisons, i.e. they define which part of the logbooks and snippet data are visible to the authenticated user. The logic that defines, what parts of the data you can see, is called "authorization" in IT terminology.



