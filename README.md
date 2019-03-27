lambda-function-search
======================

Search your Lambda functions

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/lambda-function-search.svg)](https://npmjs.org/package/lambda-function-search)
[![Downloads/week](https://img.shields.io/npm/dw/lambda-function-search.svg)](https://npmjs.org/package/lambda-function-search)
[![License](https://img.shields.io/npm/l/lambda-function-search.svg)](https://github.com/hideokamoto/lambda-function-search/blob/master/package.json)

<!-- toc -->
# Usage
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
