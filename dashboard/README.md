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
