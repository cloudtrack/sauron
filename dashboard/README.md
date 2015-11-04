# Sauron Dashboard

Dashboard application of Sauron.

## Installation

After cloning the project, install npm packages and foreman.

Installing foreman(for environment variable setup):

```
  gem install foreman
```

Installing gulp-cli:

```
  npm install -g gulp-cli
```

Installing npm packages:

```
  npm install
```

Create your own `.env`:

```sh
WEBPACK_DEV_SERVER_PORT=3000
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
AWS_REGION=ap-northeast-1
S3_BUCKET=<YOUR_S3_BUCKET>
```

## Development

Run `gulp serve` command with foreman. It will automatically build webpack.

```sh
  $ foreman run gulp serve
```

## Deploying

S3 Bucket must be set up with static website hosting feature turned on, and bucket `list` permission should be granted to `Everyone`.

Also to serve as single page application, when requested to non-existing path, it should redirect to index path. You can configure S3 bucket redirection rule as following:

```
<RoutingRules>
    <RoutingRule>
        <Condition>
            <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
        </Condition>
        <Redirect>
            <HostName>YOURDOMAIN</HostName>
            <ReplaceKeyPrefixWith>#!/</ReplaceKeyPrefixWith>
        </Redirect>
    </RoutingRule>
</RoutingRules>
```

Once S3 setup is complete, you can deploy to S3 by running
```sh
$ foreman run gulp deploy
```
