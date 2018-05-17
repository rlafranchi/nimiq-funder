# Nimiq Funder
Funding websites with [Nimiq](https://nimiq.com)

See the [Demo](https://rlafranchi.github.io/nimiq-funder) or see it in action on [my blog](https://rlafranchi.github.io)

![screenshot](/screenshot.png)

Nimiq Funder is built using [Vue](https://vuejs.org) and [vue-cli](https://github.com/vuejs/vue-cli).

### Requirements

* Node
* Yarn `npm install -g yarn`

### Installing
```
$ yarn install
```

### Running a development server
```
$ yarn serve
```

### Build Distribution
```
$ yarn build

# or the umd build
$ vue-cli-service build --target lib --name nimiq-funder ./src/main.js
```

### Running in your website
Nimiq Funder is designed to work with mining pools, and is configured by default to connect to the [nimiq.watch](https://nimiq.watch) pool.  The funding address along with the pool configuration may applied appropriately.  Download the zip [release](https://github.com/rlafranchi/nimiq-funder/releases/), extract and take a look at demo.html as an example.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>nimiq-funder demo</title>
    <link rel="stylesheet" href="./nimiq-funder.css">
  </head>
  <body>
    <!-- element the Vue instance mounts to -->
    <div id="nimiq-funder"></div>
    <!-- load in Vue dependency -->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.min.js"></script>
    <!-- load in nimiq cdn link -->
    <script src="https://cdn.nimiq.com/nimiq.js"></script>
    <script>
      // config - comment out and define your funding address and pool configuration if desired
      // var NIMIQ_ADDRESS = 'NQ42 2X..';
      // var NIMIQ_POOL_HOST = 'pool.nimiq.watch';
      // var NIMIQ_POOL_PORT = 8443;
    </script>
    <script src="./nimiq-funder.umd.js"></script>
  </body>
</html>
```

Like this Project? Donate some NIM to NQ42 2XFM G9U0 8MSC 7T2H UTUV A9D6 RG13 P1RV
