lambda-function-search
======================

Search your Lambda functions

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/lambda-function-search.svg)](https://npmjs.org/package/lambda-function-search)
[![Downloads/week](https://img.shields.io/npm/dw/lambda-function-search.svg)](https://npmjs.org/package/lambda-function-search)
[![License](https://img.shields.io/npm/l/lambda-function-search.svg)](https://github.com/hideokamoto/lambda-function-search/blob/master/package.json)

<!-- toc -->
# Install

```
$ npm i -g lambda-function-search

```

# Usage

```
$ lfs --help
Search Lambda functions

USAGE
  $ lambda-function-search

OPTIONS
  -A, --showAll          Show all function data

  -R, --runtime=runtime  Lambda runtime
                         Example: nodejs, nodejs4.3, nodejs6.10, nodejs8.10, 
                         java8, python2.7, python3.6, python3.7, 
                         dotnetcore1.0, dotnetcore2.0, dotnetcore2.1, 
                         nodejs4.3-edge, go1.x, ruby2.5, provided

  -h, --help             show CLI help

  -p, --profile=profile  AWS CLI profile

  -r, --region=region    region

  -s, --search=search    search by name
```

<!-- usage -->
# Commands

## List all Function
```bash
$ lfs --region us-east-1
Matched Functions: 5 / 5
====
ContactFormLambda
serverlessContactForm
HelloAlexa
Example
ServerlessTest
```

## Search by Runtime

```bash
$ lfs --region us-east-1 --runtime nodejs6.10 
Search condition: Runtime === nodejs6.10
Matched Functions: 5 / 43
====
ContactFormLambda
serverlessContactForm
HelloAlexa
Example
ServerlessTest
```

## Search by FunctionName

```bash
$ lfs --region us-east-1 --search Form
Search condition: FunctionName contains Form
Matched Functions: 2 / 43
====
ContactFormLambda
serverlessContactForm
```
