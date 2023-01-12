import { wrap } from 'svelte-spa-router/wrap'

import Landing from './views/landing.svelte'
import Wizard from './views/wizard.svelte'
import User from './views/user.svelte'

const routes = {
  '/': Landing,
  '/wizard': Wizard,
  '/user': User
}

export { routes }
