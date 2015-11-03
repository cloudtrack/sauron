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
```

## Development

Run `gulp serve` command with foreman. It will automatically build webpack.

```sh
  $ foreman run gulp serve
```
