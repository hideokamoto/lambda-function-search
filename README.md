lambda-function-search
======================

A CLI tool to search and list AWS Lambda functions across regions with filtering capabilities.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/lambda-function-search.svg)](https://npmjs.org/package/lambda-function-search)
[![Downloads/week](https://img.shields.io/npm/dw/lambda-function-search.svg)](https://npmjs.org/package/lambda-function-search)
[![License](https://img.shields.io/npm/l/lambda-function-search.svg)](https://github.com/hideokamoto/lambda-function-search/blob/master/package.json)

<!-- toc -->

## Requirements

- Node.js >= 18.0.0
- AWS credentials configured (via AWS CLI, environment variables, or IAM role)

## What's New in v0.6.0

- ✨ **Modernized Dependencies**: Migrated to AWS SDK v3 and oclif v4
- 🔒 **Security**: Fixed all 12 security vulnerabilities
- 🚀 **Updated Runtime Support**: Added support for latest Lambda runtimes (Node.js 18/20/22, Python 3.11/3.12/3.13, etc.)
- 🌍 **Expanded Regions**: Updated AWS region list to include all current regions (29 regions supported)
- 🛠️ **Developer Experience**: Migrated from TSLint to ESLint, updated TypeScript to v5

## Installation

### Global Installation

```bash
npm i -g lambda-function-search
```

After installation, you can use the `lfs` or `lambda-function-search` command.

### Using with npx (No Installation Required)

You can use the tool directly with `npx` without installing it globally:

```bash
npx lambda-function-search --region us-east-1
```

Or use the shorter alias:

```bash
npx lfs --region us-east-1
```

## Usage

```bash
$ lfs --help
Search Lambda functions

USAGE
  $ lambda-function-search

OPTIONS
  -A, --showAll          Show all function data (full JSON output)

  -R, --runtime=runtime  Filter by Lambda runtime
                         Examples: nodejs18.x, nodejs20.x, nodejs22.x,
                         python3.11, python3.12, python3.13,
                         java11, java17, java21,
                         dotnet6, dotnet8,
                         ruby3.2, ruby3.3,
                         provided.al2, provided.al2023

  -h, --help             Show CLI help

  -p, --profile=profile  AWS CLI profile name

  -r, --region=region    AWS region (use "all" to search all regions)

  -s, --search=search    Search by function name (regex supported)
```

## Examples

> **Note**: If you installed globally, you can use `lfs` or `lambda-function-search`. If using `npx`, replace `lfs` with `npx lambda-function-search` or `npx lfs`.

### List All Functions in a Region

```bash
# With global installation
$ lfs --region us-east-1

# Or with npx (no installation required)
$ npx lambda-function-search --region us-east-1
=== Matched Functions: 5 / 5 ===
Region : us-east-1
ContactFormLambda
serverlessContactForm
HelloAlexa
Example
ServerlessTest
```

### List All Functions Across All Regions

```bash
$ lfs --region all
# Or: npx lambda-function-search --region all
=== Matched Functions: 5 / 5 ===
Region : ap-northeast-2
ContactFormLambda
serverlessContactForm
HelloAlexa
Example
ServerlessTest
=== Matched Functions: 2 / 5 ===
Region : ap-northeast-1
ContactFormLambda
serverlessContactForm
...
```

### Search by Runtime

```bash
$ lfs --region us-east-1 --runtime nodejs20.x
# Or: npx lambda-function-search --region us-east-1 --runtime nodejs20.x
Search condition: Runtime === nodejs20.x
=== Matched Functions: 5 / 43 ===
Region : us-east-1
ContactFormLambda
serverlessContactForm
HelloAlexa
Example
ServerlessTest
```

### Search by Function Name

```bash
$ lfs --region us-east-1 --search Form
# Or: npx lambda-function-search --region us-east-1 --search Form
Search condition: FunctionName contains Form
=== Matched Functions: 2 / 43 ===
Region : us-east-1
ContactFormLambda
serverlessContactForm
```

### Show Full Function Details

```bash
$ lfs --region us-east-1 --search Form --showAll
# Or: npx lambda-function-search --region us-east-1 --search Form --showAll
Search condition: FunctionName contains Form
=== Matched Functions: 2 / 43 ===
Region : us-east-1
ContactFormLambda
{
  FunctionName: 'ContactFormLambda',
  FunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:ContactFormLambda',
  Runtime: 'nodejs20.x',
  Role: 'arn:aws:iam::123456789012:role/lambda-role',
  ...
}
serverlessContactForm
{
  FunctionName: 'serverlessContactForm',
  ...
}
```

### Use AWS Profile

```bash
$ lfs --region us-east-1 --profile my-profile
# Or: npx lambda-function-search --region us-east-1 --profile my-profile
=== Matched Functions: 5 / 5 ===
Region : us-east-1
...
```

### Combine Filters

```bash
$ lfs --region us-east-1 --runtime nodejs20.x --search Form
# Or: npx lambda-function-search --region us-east-1 --runtime nodejs20.x --search Form
Search condition: Runtime === nodejs20.x
Search condition: FunctionName contains Form
=== Matched Functions: 2 / 43 ===
Region : us-east-1
ContactFormLambda
serverlessContactForm
```

## Supported Regions

The tool supports all 29 AWS regions:
- **Africa**: af-south-1
- **Asia Pacific**: ap-east-1, ap-northeast-1, ap-northeast-2, ap-northeast-3, ap-south-1, ap-south-2, ap-southeast-1, ap-southeast-2, ap-southeast-3, ap-southeast-4
- **Canada**: ca-central-1, ca-west-1
- **Europe**: eu-central-1, eu-central-2, eu-north-1, eu-south-1, eu-south-2, eu-west-1, eu-west-2, eu-west-3
- **Middle East**: il-central-1, me-central-1, me-south-1
- **South America**: sa-east-1
- **United States**: us-east-1, us-east-2, us-west-1, us-west-2

## Supported Runtimes

The tool supports filtering by all Lambda runtimes, including:
- **Node.js**: nodejs18.x, nodejs20.x, nodejs22.x (and older versions)
- **Python**: python3.11, python3.12, python3.13 (and older versions)
- **Java**: java11, java17, java21 (and older versions)
- **.NET**: dotnet6, dotnet8 (and older versions)
- **Ruby**: ruby3.2, ruby3.3 (and older versions)
- **Custom**: provided, provided.al2, provided.al2023
- **Go**: go1.x

## License

MIT
