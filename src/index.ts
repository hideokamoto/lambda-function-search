import {Command, flags} from '@oclif/command'
import { Lambda, SharedIniFileCredentials } from 'aws-sdk'
import chalk from 'chalk'

type IRuntime = "nodejs" | "nodejs4.3" | "nodejs6.10" | "nodejs8.10" | "java8" | "python2.7" | "python3.6" | "python3.7" | "dotnetcore1.0" | "dotnetcore2.0" | "dotnetcore2.1" | "nodejs4.3-edge" | "go1.x" | "ruby2.5" | "provided" | string
type ISearchQuery = {
  Runtime?: IRuntime,
  name?: string
}
interface IQueryBuilder {
  addRuntime(runtime: IRuntime): IQueryBuilder
  addSearchQuery(name: string): IQueryBuilder
  getQuery(): ISearchQuery
}

class QueryFactory {
  public static init(log: Function): IQueryBuilder {
    const query: ISearchQuery = {}
    return {
      addRuntime(runtime: IRuntime) {
        log(`${chalk.green('Search condition')}: Runtime === ${runtime}`)
        query.Runtime = runtime
        return this
      },
      addSearchQuery(name: string) {
        log(`${chalk.green('Search condition')}: FunctionName contains ${name}`)
        query.name = name
        return this
      },
      getQuery() {
        return query
      }
    }
  }
}

const regions = [
  "eu-north-1",
  "ap-south-1",
  "eu-west-3",
  "eu-west-2",
  "eu-west-1",
  "ap-northeast-2",
  "ap-northeast-1",
  "sa-east-1",
  "ca-central-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "eu-central-1",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2"
]

class LambdaFunctionSearch extends Command {
  static description = 'Search Lambda functions'
  private NextMarker: string = ''
  private amount: number = 0
  private client: Lambda | undefined

  static flags = {
    help: flags.help({char: 'h'}),
    // runtime
    runtime: flags.string({
      char: 'R', 
      description: [
        'Lambda runtime',
        'Example: ' + [
          "nodejs",
          "nodejs4.3",
          "nodejs6.10",
          "nodejs8.10",
          "java8",
          "python2.7",
          "python3.6",
          "python3.7",
          "dotnetcore1.0",
          "dotnetcore2.0",
          "dotnetcore2.1",
          "nodejs4.3-edge",
          "go1.x",
          "ruby2.5",
          "provided"
        ].join(', ')
      ].join('\n')
    }),
    // [For AWS SDK] region
    region: flags.string({
      char: 'r',
      description: 'region, (If you set "all", list all regions)'
    }),
    // [For AWS SDK] profile
    profile: flags.string({
      char: 'p',
      description: 'AWS CLI profile'
    }),
    search: flags.string({
      char: 's',
      description: 'search by name'
    }),
    showAll: flags.boolean({
      char: 'A',
      description: 'Show all function data',
      default: false
    }),

  }
  async listAllFunctions(query: ISearchQuery = {}, functions: Lambda.FunctionList = []): Promise<Lambda.FunctionList> {
    if (!this.client) {
      throw new Error('Failed to initilize AWS SDK Class')
    }
    const params: Lambda.ListFunctionsRequest = {}
    if (this.NextMarker) params.Marker = this.NextMarker
    const { NextMarker, Functions} = await this.client.listFunctions(params).promise()
    this.NextMarker = NextMarker || ''
    const targetFunctions = !Functions ? [] : Functions.filter(func => {
      if (query.name) {
        const reg = new RegExp(query.name)
        if (func.FunctionName && !func.FunctionName.match(reg)) return false
      }
      if (query.Runtime) return func.Runtime === query.Runtime
      return true
    })
    const items = functions.concat(targetFunctions)
    this.amount += Functions ? Functions.length : 0
    if (this.NextMarker) {
      return this.listAllFunctions(query, items)
    }
    return items
  }

  async getAllRegionFuncs(
    query: ISearchQuery,
    props: Lambda.ClientConfiguration = {},
  ) {
    return await Promise.all(regions.map(region => {
      return this.worker(query, {
        ...props,
        region
      })
    }))
  }

  async run() {
    const {flags} = this.parse(LambdaFunctionSearch)
    const queryBuilder = QueryFactory.init(this.log)
    if (flags.runtime) queryBuilder.addRuntime(flags.runtime)
    if (flags.search) queryBuilder.addSearchQuery(flags.search)
    const props: Lambda.ClientConfiguration = {}
    if (!flags.region) this.log(chalk.yellow('warning') + ': Missing region')
    if (flags.region) {
      if (flags.region === 'all') return this.getAllRegionFuncs(queryBuilder.getQuery(), props)
      props.region = flags.region
    }
    return this.worker(queryBuilder.getQuery(), props)
  }

  async worker(
    query: ISearchQuery,
    props: Lambda.ClientConfiguration = {},
  ) {
    const {flags} = this.parse(LambdaFunctionSearch)
    this.client = new Lambda(props)
    if (flags.profile) {
      const credentials = new SharedIniFileCredentials({profile: flags.profile})
      this.client.config.credentials = credentials
    }
    try {
      this.amount = 0
      const result = await this.listAllFunctions(query)
      this.log(`=== ${chalk.green('Matched Functions')}: ${result.length} / ${this.amount} ===`)
      if (props.region) this.log(`${chalk.green('Region')} : ${props.region}`)
      result.forEach(item => {
        this.log(item.FunctionName)
        if (flags.showAll) console.log(item)
      })
    } catch (e) {
      this.error(chalk.red(e))
      this.exit(1)
    }
  }
}

export = LambdaFunctionSearch
