# Documentation

## Overview
The documentation consists of two main parts.

* The documentation proper, split into User,Operator,Ingestor and Developer manual. The source is located [here](]https://github.com/paulscherrerinstitute/scilog/tree/feature/addDocumentation/docs) .  It covers all components of the software, i.e  frontend and backend. The documentation tool [honkit](https://honkit.netlify.app/) (successor of gitbook) is used.

* The documentation of the REST API of the backend. This is auto-generated from the source and can be viewed at the respective *api/v1/explorer* URL, e.g. at this [example explorer](https://scilog.qa.psi.ch/api/v1/explorer)

The live documentation is kept in sync with the source of the documentation via [Github deploy-docu workflow ](https://github.com/paulscherrerinstitute/scilog/blob/feature/addDocumentation/.github/workflows/deploy-docu.yaml)

The live web site is then visible at the [following URL](https://paulscherrerinstitute.github.io/scilog/)


## Changes and Deployment 

```
git clone https://github.com/paulscherrerinstitute/scilog.git
cd scilog/docs

# make your changes, then git add and git commit as usual

git push origin main
```

After pushing the changes they will immediately become visible at the [following URL](https://paulscherrerinstitute.github.io/scilog/)

In case you want to check the changes first locally do the following

```
cd scilog/docs
npm install
npx honkit init
npx honkit build
npx honkit serve --port 4001

# then navigate in browser to http://localhost:4001
```

## Changes and Deployment of API Documentation

This is automatically generated from the source code.
