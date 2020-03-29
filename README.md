# AURA Authentication Server

![Tests](https://github.com/teco-kit/explorer-auth/workflows/Tests/badge.svg?branch=master)

This is the authentication server for the AURA REST API.

# Getting started
Before you get started clone *this repository* and the *backend repository* 
and make sure, both repositories are located in the same folder.

You can either run the application within a docker container or directly.

## Docker 
Please refer to the <a href="https://aura-development.visualstudio.com/Aura/_git/backend.database-abstraction">backend installation guide</a>. 

Hint: Since the docker-compose file is located in the backend repository you need to 
run docker-compose from within the backend repository.

## Local installation
If you want to run the application locally, please follow the 
<a href="https://docs.mongodb.com/manual/installation/">mongoDB installation guide</a>.

Please make sure mongoDB is up and running.

Then run the following commands:
                                                                     
```
npm install
npm run start
```

# Testing
After developing and **before** committing, please make sure all test are passing. MongoDB and Aura Authentication
need to be up and running.

```
npm run test
```
