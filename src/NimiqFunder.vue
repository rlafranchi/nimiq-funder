<template>
  <div class="nimiq-funder">
    <div class="nf-backdrop" v-if="expanded" @click="expanded = false"></div>
    <div class="nf-main">
      <div class="nf-container" :class="{'nf-expanded': expanded}">
        <div @click="expand()">
          <div class="nf-logo">
            <span v-if="expanded"> NIMIQ FUNDER</span>
          </div>
          <small>{{ hashrateFriendly }}</small>
        </div>
        <div v-if="expanded">
          <p>This Website is funded through visitors hashing power on the Nimiq Blockchain. Find out more about Nimiq at <a href="https://nimiq.com" target="_blank">nimiq.com</a></p>
          <ul>
            <li>Consensus: {{ status }}</li>
            <li>Mining: {{ mining ? 'Enabled' : 'Disabled' }} </li>
            <li>Funding Address: <a :href="`https://nimiq.watch/#${address.replace(/\s/g, '+')}`" target="_blank">{{ address }}</a></li>
            <li>Height: #{{ height }}</li>
          </ul>
          <button class="nf-button" :class="{'nf-secondary-button': !mining}" @click="optIn()">Opt In</button>
          <button class="nf-button" :class="{'nf-secondary-button': mining}" @click="optOut()">Opt Out</button>
          <p class="nf-info" v-if="expanded">source: <a href="https://github.com/rlafranchi/nimiq-funder" target="_blank">rlafranchi/nimiq-funder</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global Nimiq */
/* global NIMIQ_ADDRESS */
/* global NIMIQ_POOL_HOST */
/* global NIMIQ_POOL_PORT */
const $nimiq = {}
export default {
  name: 'NimiqFunder',
  data () {
    return {
      status: 'Initializing',
      hashrate: 0,
      height: 0,
      address: 'NQ42 2XFM G9U0 8MSC 7T2H UTUV A9D6 RG13 P1RV',
      pool: {
        host: 'pool.nimiq.watch',
        port: 8443
      },
      mining: true,
      expanded: false,
      firstExpand: false
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
      if ($nimiq && $nimiq.miner) {
        vm.hashrate = $nimiq.miner._hashrate.toString()
        vm.height = $nimiq.blockchain.height.toString()
      }
    }, 1000)
    setTimeout(() => {
      if (!vm.firstExpand) {
        vm.expanded = true
      }
    }, 5000)
    Nimiq.init(async function() {
        vm.status = 'Syncing'
        Nimiq.GenesisConfig.main()
        $nimiq.consensus = await Nimiq.Consensus.light()
        $nimiq.blockchain = $nimiq.consensus.blockchain
        $nimiq.network = $nimiq.consensus.network
        $nimiq.accounts = $nimiq.blockchain.accounts
        $nimiq.mempool = $nimiq.consensus.mempool

        const address =  Nimiq.Address.fromUserFriendlyAddress(vm.address)
        const deviceId = Nimiq.BasePoolMiner.generateDeviceId($nimiq.network.config)
        $nimiq.miner = new Nimiq.SmartPoolMiner($nimiq.blockchain, $nimiq.accounts, $nimiq.mempool, $nimiq.network.time, address, deviceId)

        $nimiq.miner.on('connection-state', () => {
          vm.connectOrDisconnect()
        })

        $nimiq.consensus.on('established', () => {
          vm.status = 'Established'
          vm.connectOrDisconnect()
        })

        $nimiq.consensus.on('lost', () => {
          vm.status = 'Lost'
          vm.connectOrDisconnect()
        })

        $nimiq.network.connect()
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
      const previousVisit = localStorage.getItem('NimiqFunder')
      if (previousVisit) {
        const settings = JSON.parse(previousVisit);
        this.mining = settings.mining
        this.firstExpand = true
      } else {
        this.saveOptStatus()
      }
    },
    optIn() {
      if (this.mining) {
        this.expanded = false;
      }
      this.mining = true
      this.saveOptStatus()
      this.connectOrDisconnect()
    },
    optOut() {
      if (!this.mining) {
        this.expanded = false;
      }
      this.mining = false
      this.saveOptStatus()
      this.connectOrDisconnect()
    },
    connectOrDisconnect() {
      setTimeout(() => {
        if (this.mining) {
          if ($nimiq.miner.isConnected()) {
            $nimiq.miner.startWork()
          } else {
            try {
              $nimiq.miner.connect(this.pool.host, this.pool.port)
            } catch(e) {
              $nimiq.miner.disconnect()
            }
          }
        } else {
          if ($nimiq.miner.isConnected()) {
            $nimiq.miner.disconnect()
          } else {
            $nimiq.miner.stopWork()
          }
        }
      }, 1000);
    },
    expand() {
      this.expanded = !this.expanded
      this.firstExpand = true
    },
    saveOptStatus() {
      localStorage.setItem('NimiqFunder', JSON.stringify({mining: this.mining}))
    }
  }
}
</script>

<style scoped lang="scss">

.nimiq-funder {
  .nf-backdrop {
    position: fixed;
    background-color: rgba(0,0,0,0.3);
    background-size: cover;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 99998;
    transition: all 0.5s ease-in-out;
  }

  .nf-main {
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
    background-image: linear-gradient(30deg, #3023AE, #9C58CB);
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    padding: 10px;

    .nf-container {
      width: 100px;
      height: 20px;
      transition: all 0.5s ease;
      &.nf-expanded {
        height: 220px;
        width: 200px;
        small {
          top: 2px;
        }
        transition: all 0.5s ease;
      }
    }

    .nf-logo {
      height: 24px;
      box-sizing: border-box;
      background-image: url('data:image/svg+xml;utf8,<svg width="499" height="440" xmlns="http://www.w3.org/2000/svg"><path d="M389.33 20.73C382.65 9.28 366.48 0 353.24 0h-208c-13.26 0-29.4 9.28-36.09 20.73L5.33 198.87c-6.68 11.45-6.68 30.02 0 41.47l103.82 178.14c6.68 11.45 22.85 20.74 36.09 20.74h208c13.26 0 29.4-9.28 36.09-20.74l103.82-178.14c6.68-11.45 6.68-30.01 0-41.47L389.33 20.73zM272.6 347.45v41.1h-38.74v-39.53c-23.53-2.82-51.45-13.02-70.28-30.12l25.57-39.06c20.4 15.06 37.96 22.9 57.1 22.9 22.43 0 32.31-9.1 32.31-27.29 0-40.63-105.4-39.84-105.4-111.06 0-38.74 23.2-65.57 60.7-73.1V50.51h38.74v40c25.57 3.6 43.92 16.16 59.45 32.47l-29.49 33.26c-14.43-13.02-26.66-19.77-43.45-19.77-19.13 0-29.49 7.53-29.49 25.26 0 37.49 105.41 34.35 105.41 109.96-.15 37.8-21.33 67.13-62.43 75.76z" fill="%23FFC107" fill-rule="evenodd"/></svg>');
      background-size: 24px 21px;
      background-repeat: no-repeat;
      padding-left: 28px;
      cursor: pointer;
    }

    .nf-expand {
      float: right;
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
      width: 100%;
    }

    a {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: underline;
    }

    ul {
      list-style-type: none;
      padding-left: 0px;
    }

    .nf-info {
      position: absolute;
      bottom: 2px;
      left: 10px;
    }

    .nf-button {
      color: white;
      background: #e2a62f;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2);
      display: inline-block;
      font-size: 14px;
      text-shadow: none;
      vertical-align: middle;
      line-height: 28px;
      margin: 8px;
      letter-spacing: 0;
      font-weight: 600;
      transition: background .2s ease;
    }

    .nf-button:hover {
      background: #E69E1D;
    }

    .nf-secondary-button {
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, .2);
      border: 2px solid rgba(255, 255, 255, 0.7);
      color: white;
      transition: color .3s, border .3s;
    }

    .nf-button,
    .nf-secondary-button {
      border-radius: 3px;
      margin: 6px;
      padding: 4px 12px !important;
      cursor: pointer;
      text-decoration: none;
      letter-spacing: 1pt;
    }

    .nf-secondary-button {
      background-color: transparent;
    }
  }
}
</style>
