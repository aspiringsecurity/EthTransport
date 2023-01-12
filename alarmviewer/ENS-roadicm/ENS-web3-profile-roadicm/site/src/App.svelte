<script>
  import Router from 'svelte-spa-router'
  import { routes } from './routes'

	export let name;
</script>

<div id="warning">
  <p>This application only works on the Ropsten testnet</p>
</div>

<Router {routes} />

<style>
  #warning {
    background: #c76b6b;
    font-size: 1em;
    font-weight: bold;
    color: #fff;
    padding: 0.7em;
    text-align: center;
  }
</style>
