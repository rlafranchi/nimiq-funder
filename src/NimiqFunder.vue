<template>
  <div class="nimiq-funder" :class="{expanded: expanded}">
    <div class="main">
      <div @click="expand()">
        <div class="logo">
          <span v-if="expanded"> NIMIQ FUNDER</span>
        </div>
        <small>{{ hashrateFriendly }}</small>
      </div>
      <div :transition="expand" v-if="expanded">
        <p>This Website is funded through visitors hashing power on the Nimiq Blockchain. Find out more about Nimiq at <a href="https://nimiq.com" target="_blank">nimiq.com</a></p>
        <ul>
          <li>Consensus: {{ status }}</li>
          <li>Mining: {{ mining ? 'Enabled' : 'Disabled' }} <a href="#" @click.prevent="toggleMining()">{{ mining ? 'Stop' : 'Start' }}</a></li>
          <li>Funding Address: <a :href="`https://nimiq.watch/#${address.replace(/\s/g, '+')}`" target="_blank">{{ address }}</a></li>
          <li>Height: #{{ height }}</li>
        </ul>
        <p class="info" v-if="expanded">source: <a href="https://github.com/rlafranchi/nimiq-funder" target="_blank">rlafranchi/nimiq-funder</a></p>
      </div>
    </div>
  </div>
</template>

<script>
/* global Nimiq */
/* global NIMIQ_ADDRESS */
/* global NIMIQ_POOL_HOST */
/* global NIMIQ_POOL_PORT */
export default {
  name: 'NimiqFunder',
  data () {
    return {
      nimiq: {},
      status: 'Initializing',
      hashrate: 0,
      height: 0,
      address: 'NQ42 2XFM G9U0 8MSC 7T2H UTUV A9D6 RG13 P1RV',
      pool: {
        host: 'pool.nimiq.watch',
        port: 8443
      },
      mining: true,
      expanded: false
    }
  },
  computed: {
    hashrateFriendly () {
      return `${this.hashrate} H/s`
    }
  },
  created () {
    this.setConfig()
    const vm = this
    setInterval(() => {
      if (vm.nimiq && vm.nimiq.miner) {
        vm.hashrate = vm.nimiq.miner._hashrate.toString()
        vm.height = vm.nimiq.blockchain.height.toString()
      }
    }, 1000)
    Nimiq.init(async function() {
        vm.status = 'Syncing'
        Nimiq.GenesisConfig.main()
        vm.nimiq.consensus = await Nimiq.Consensus.light()
        vm.nimiq.blockchain = vm.nimiq.consensus.blockchain
        vm.nimiq.network = vm.nimiq.consensus.network
        vm.nimiq.accounts = vm.nimiq.blockchain.accounts
        vm.nimiq.mempool = vm.nimiq.consensus.mempool

        const address =  Nimiq.Address.fromUserFriendlyAddress(vm.address)
        const deviceId = Nimiq.BasePoolMiner.generateDeviceId(vm.nimiq.network.config)
        vm.nimiq.miner = new Nimiq.SmartPoolMiner(vm.nimiq.blockchain, vm.nimiq.accounts, vm.nimiq.mempool, vm.nimiq.network.time, address, deviceId)

        vm.nimiq.miner.on('connection-state', () => {
          vm.connectOrDisconnect()
        })

        vm.nimiq.consensus.on('established', () => {
          vm.status = 'Established'
          vm.connectOrDisconnect()
        })

        vm.nimiq.consensus.on('lost', () => {
          vm.status = 'Lost'
          vm.connectOrDisconnect()
        })

        vm.nimiq.network.connect()
      },
      (err) => {
        console.error(err);
      },
      {}
    );
  },
  methods: {
    setConfig() {
      if (typeof Nimiq === 'undefined') {
        throw 'Nimiq not loaded please load https://cdn.nimiq.com/nimiq.js'
      }
      if (typeof NIMIQ_ADDRESS !== 'undefined') {
        this.address = NIMIQ_ADDRESS
      }
      if (typeof NIMIQ_POOL_HOST !== 'undefined') {
        this.pool.host = NIMIQ_POOL_HOST
      }
      if (typeof NIMIQ_POOL_PORT !== 'undefined') {
        this.pool.port = NIMIQ_POOL_PORT
      }
    },
    toggleMining() {
      this.mining = !this.mining
      this.connectOrDisconnect()
    },
    connectOrDisconnect() {
      console.info(this.nimiq.miner)
      setTimeout(() => {
        if (this.mining) {
          if (this.nimiq.miner.isConnected()) {
            this.nimiq.miner.startWork()
          } else {
            try {
              this.nimiq.miner.connect(this.pool.host, this.pool.port)
            } catch(e) {
              this.nimiq.miner.disconnect()
            }
          }
        } else {
          if (this.nimiq.miner.isConnected()) {
            this.nimiq.miner.disconnect()
          } else {
            this.nimiq.miner.stopWork()
          }
        }
      }, 1000);
    },
    expand() {
      this.expanded = !this.expanded
    }
  }
}
</script>

<style scoped lang="scss">

.nimiq-funder {
  color: rgba(255,255,255,0.9);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  right: 30px;
  margin-left: auto;
  margin-right: auto;
  height: 40px;
  width: 100px;
  background-image: linear-gradient(30deg, #3023AE, #9C58CB);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  transition: all 0.5s ease;

  .logo {
    height: 24px;
    box-sizing: border-box;
    background-image: url('data:image/svg+xml;utf8,<svg width="499" height="440" xmlns="http://www.w3.org/2000/svg"><path d="M389.33 20.73C382.65 9.28 366.48 0 353.24 0h-208c-13.26 0-29.4 9.28-36.09 20.73L5.33 198.87c-6.68 11.45-6.68 30.02 0 41.47l103.82 178.14c6.68 11.45 22.85 20.74 36.09 20.74h208c13.26 0 29.4-9.28 36.09-20.74l103.82-178.14c6.68-11.45 6.68-30.01 0-41.47L389.33 20.73zM272.6 347.45v41.1h-38.74v-39.53c-23.53-2.82-51.45-13.02-70.28-30.12l25.57-39.06c20.4 15.06 37.96 22.9 57.1 22.9 22.43 0 32.31-9.1 32.31-27.29 0-40.63-105.4-39.84-105.4-111.06 0-38.74 23.2-65.57 60.7-73.1V50.51h38.74v40c25.57 3.6 43.92 16.16 59.45 32.47l-29.49 33.26c-14.43-13.02-26.66-19.77-43.45-19.77-19.13 0-29.49 7.53-29.49 25.26 0 37.49 105.41 34.35 105.41 109.96-.15 37.8-21.33 67.13-62.43 75.76z" fill="%23FFC107" fill-rule="evenodd"/></svg>');
    background-size: 24px 21px;
    background-repeat: no-repeat;
    padding-left: 28px;
    cursor: pointer;
  }

  &.expanded {
    height: 200px;
    width: 210px;
    small {
      top: 2px;
    }
    transition: all 0.5s ease;
  }

  .main {
    width: 100%;
    height: auto;
    padding: 10px;
    > div {
      cursor: pointer;
    }

    .expand {
      float: right;
    }

  }

  small {
    position: absolute;
    top: 12px;
    right: 4px;
    font-size: 75%;
  }

  p, ul {
    font-size: 10px;
    padding-right: 10px;
    line-height: 1.2;
  }

  a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: underline;
  }

  ul {
    list-style-type: none;
    padding-left: 0px;
  }

  .info {
    position: absolute;
    bottom: 2px;
    left: 10px;
  }
}
</style>
