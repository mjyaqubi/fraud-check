## Description

Fraud check integration example.

## Installation

```bash
$ yarn install
```

## Environment variables
To pass the configuration to app, you can use the config files under config folder or use place holder inside the config file and add the actual value in `.env` file, here is an example of the `.env` file:
```
DOCS_USERNAME=docs
DOCS_PASSWORD=pass

FRAUD_AWAY_PATH=https://fraudaway.com/api/v1/fraud-risk/invoke
FRAUD_AWAY_TIMEOUT=3000

SIMPLE_FRAUD_PATH=https://simplefraud.com/api/v1/perform-check
SIMPLE_FRAUD_TIMEOUT=3000

RISK_SCORE=10
BYPASS_AMOUNT=100

DATABASE_DIALECT=mysql
DATABASE_HOST=locahost
DATABASE_PORT=3306
DATABASE_USERNAME=username
DATABASE_PASSWORD=password
DATABASE_DATABASE=fraud_check_results
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

## Improvement
Some area to improve listed below:
- The storage of third party API result separately incase of running some analysis otherwise as we only retrieve the existing result the current implementation is good enough
- Unit test coverage
- E2E test is missing

## License

Nest is [MIT licensed](LICENSE).
