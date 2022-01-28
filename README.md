# Hierarchical Sorting

Sorting a dataset in a hierarchical manner. The full challenge description can be found in the [CHALLENGE.md](CHALLENGE.md) file.

## Scripts

The available scripts are in the `package.json` file

- `npm run start` - start the application.
- `npm run test` -  run the unit tests, the results are printed to the console.
- `npm run lint` -  run linting of the application code.

## Docker

This service can be built as a Docker container. See the [`Dockerfile`](./Dockerfile)

- Build the Docker image

```shell
docker build -t hierarchical-sorting-challenge .
```

- Run the Docker container

```shell
docker run hierarchical-sorting-challenge
```
