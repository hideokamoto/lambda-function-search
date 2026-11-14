
import { Command, Flags } from '@oclif/core';
import {
  LambdaClient,
  ListFunctionsCommand,
  type FunctionConfiguration,
  type LambdaClientConfig,
} from '@aws-sdk/client-lambda';
import { fromIni } from '@aws-sdk/credential-providers';
import chalk from 'chalk';

type IRuntime =
  | 'nodejs'
  | 'nodejs4.3'
  | 'nodejs6.10'
  | 'nodejs8.10'
  | 'nodejs10.x'
  | 'nodejs12.x'
  | 'nodejs14.x'
  | 'nodejs16.x'
  | 'nodejs18.x'
  | 'nodejs20.x'
  | 'nodejs22.x'
  | 'python2.7'
  | 'python3.6'
  | 'python3.7'
  | 'python3.8'
  | 'python3.9'
  | 'python3.10'
  | 'python3.11'
  | 'python3.12'
  | 'python3.13'
  | 'java8'
  | 'java8.al2'
  | 'java11'
  | 'java17'
  | 'java21'
  | 'dotnetcore1.0'
  | 'dotnetcore2.0'
  | 'dotnetcore2.1'
  | 'dotnetcore3.1'
  | 'dotnet6'
  | 'dotnet8'
  | 'go1.x'
  | 'ruby2.5'
  | 'ruby2.7'
  | 'ruby3.2'
  | 'ruby3.3'
  | 'provided'
  | 'provided.al2'
  | 'provided.al2023'
  | string;

type ISearchQuery = {
  Runtime?: IRuntime;
  name?: string;
};

interface IQueryBuilder {
  addRuntime(runtime: IRuntime): IQueryBuilder;
  addSearchQuery(name: string): IQueryBuilder;
  getQuery(): ISearchQuery;
}

function createQueryBuilder(log: (message?: string) => void): IQueryBuilder {
  const query: ISearchQuery = {};
  return {
    addRuntime(runtime: IRuntime) {
      log(`${chalk.green('Search condition')}: Runtime === ${runtime}`);
      query.Runtime = runtime;
      return this;
    },
    addSearchQuery(name: string) {
      log(`${chalk.green('Search condition')}: FunctionName contains ${name}`);
      query.name = name;
      return this;
    },
    getQuery() {
      return query;
    },
  };
}

const regions = [
  'af-south-1',
  'ap-east-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ap-south-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-southeast-3',
  'ap-southeast-4',
  'ca-central-1',
  'ca-west-1',
  'eu-central-1',
  'eu-central-2',
  'eu-north-1',
  'eu-south-1',
  'eu-south-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'il-central-1',
  'me-central-1',
  'me-south-1',
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
];

class LambdaFunctionSearch extends Command {
  static description = 'Search Lambda functions';
  static examples = [
    '<%= config.bin %> --region us-east-1',
    '<%= config.bin %> --region all',
    '<%= config.bin %> --region us-east-1 --runtime nodejs20.x',
    '<%= config.bin %> --region us-east-1 --search myfunction',
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    // runtime
    runtime: Flags.string({
      char: 'R',
      description: [
        'Lambda runtime',
        `Example: ${[
          'nodejs18.x',
          'nodejs20.x',
          'nodejs22.x',
          'python3.11',
          'python3.12',
          'python3.13',
          'java11',
          'java17',
          'java21',
          'dotnet6',
          'dotnet8',
          'ruby3.2',
          'ruby3.3',
          'provided.al2',
          'provided.al2023',
        ].join(', ')}`,
      ].join('\n'),
    }),
    // [For AWS SDK] region
    region: Flags.string({
      char: 'r',
      description: 'region, (If you set "all", list all regions)',
    }),
    // [For AWS SDK] profile
    profile: Flags.string({
      char: 'p',
      description: 'AWS CLI profile',
    }),
    search: Flags.string({
      char: 's',
      description: 'search by name',
    }),
    showAll: Flags.boolean({
      char: 'A',
      description: 'Show all function data',
      default: false,
    }),
  };

  private async listAllFunctions(
    client: LambdaClient,
    query: ISearchQuery = {},
    nextMarker?: string,
    functions: FunctionConfiguration[] = [],
    totalAmount = 0
  ): Promise<{ functions: FunctionConfiguration[]; amount: number }> {
    const command = new ListFunctionsCommand({
      Marker: nextMarker,
    });
    const { NextMarker, Functions } = await client.send(command);
    const targetFunctions = !Functions
      ? []
      : Functions.filter((func: FunctionConfiguration) => {
          if (query.name) {
            const reg = new RegExp(query.name);
            if (func.FunctionName && !func.FunctionName.match(reg)) return false;
          }
          if (query.Runtime) return func.Runtime === query.Runtime;
          return true;
        });
    const items = functions.concat(targetFunctions);
    const amount = totalAmount + (Functions ? Functions.length : 0);
    if (NextMarker) {
      return this.listAllFunctions(client, query, NextMarker, items, amount);
    }
    return { functions: items, amount };
  }

  async getAllRegionFuncs(
    query: ISearchQuery,
    clientConfig: { profile?: string },
    showAll: boolean
  ): Promise<void> {
    // Execute sequentially to avoid race conditions with shared state
    for (const region of regions) {
      await this.worker(
        query,
        {
          ...clientConfig,
          region,
        },
        showAll
      );
    }
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(LambdaFunctionSearch);
    const queryBuilder = createQueryBuilder(this.log.bind(this));
    if (flags.runtime) queryBuilder.addRuntime(flags.runtime);
    if (flags.search) queryBuilder.addSearchQuery(flags.search);
    const clientConfig: { profile?: string; region?: string } = {};
    if (!flags.region) this.log(`${chalk.yellow('warning')}: Missing region`);
    if (flags.region) {
      if (flags.region === 'all') {
        if (flags.profile) clientConfig.profile = flags.profile;
        return this.getAllRegionFuncs(queryBuilder.getQuery(), clientConfig, flags.showAll);
      }
      clientConfig.region = flags.region;
    }
    if (flags.profile) clientConfig.profile = flags.profile;
    return this.worker(queryBuilder.getQuery(), clientConfig, flags.showAll);
  }

  private async worker(
    query: ISearchQuery,
    clientConfig: { profile?: string; region?: string },
    showAll: boolean
  ) {
    const config: LambdaClientConfig = {};
    if (clientConfig.region) config.region = clientConfig.region;
    if (clientConfig.profile) {
      config.credentials = fromIni({ profile: clientConfig.profile });
    }
    const client = new LambdaClient(config);
    try {
      const { functions: result, amount } = await this.listAllFunctions(client, query);
      this.log(`=== ${chalk.green('Matched Functions')}: ${result.length} / ${amount} ===`);
      if (clientConfig.region) this.log(`${chalk.green('Region')} : ${clientConfig.region}`);
      for (const item of result) {
        this.log(item.FunctionName || 'unknown');
        if (showAll) console.log(item);
      }
    } catch (e) {
      this.error(chalk.red(String(e)));
      this.exit(1);
    }
  }
}

export = LambdaFunctionSearch;
