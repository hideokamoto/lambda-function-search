import {Command, flags} from '@oclif/command'
import { Lambda, SharedIniFileCredentials } from 'aws-sdk'
import chalk from 'chalk'

type ISearchQuery = {
  Runtime?: string
}

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
      description: 'region'
    }),
    // [For AWS SDK] profile
    profile: flags.string({
      char: 'p',
      description: 'AWS CLI profile'
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

  async run() {
    const {flags} = this.parse(LambdaFunctionSearch)
    const props: Lambda.ClientConfiguration = {}
    if (!flags.region) this.log(chalk.yellow('warning') + ': Missing region')
    if (flags.region) props.region = flags.region
    this.client = new Lambda(props)
    if (flags.profile) {
      const credentials = new SharedIniFileCredentials({profile: flags.profile})
      this.client.config.credentials = credentials
    }
    const query: ISearchQuery = {}
    if (flags.runtime) {
      this.log(`${chalk.green('Search condition')}: Runtime === ${flags.runtime}`)
      query.Runtime = flags.runtime
    }
    try {
      const result = await this.listAllFunctions(query)
      this.log(`${chalk.green('Matched Functions')}: ${result.length} / ${this.amount}`)
      this.log('====')
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
