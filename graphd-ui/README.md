# graphd.ai UI

# Developing

## Prerequisites
- Node.js v14 (LTS)

## Running

First run (or new dependency updates)
```
npm install
```

```
npm start
```

Then you should be able to access the webapp through `http://localhost:3000`.

# Building


```
npm install
npm build
```

Then deploy the content in `build` directory.

# Building with Docker (prod)

```
docker build . -t graphd/ui:latest
```
