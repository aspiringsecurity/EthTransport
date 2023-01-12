<script>
  import { getContext } from 'svelte'
  import { STEPS } from './Steps.svelte'

  export let title

  const step = { title }
  const { registerStep, currentStep } = getContext(STEPS)

  registerStep(step)
</script>

<!-- TODO need to validate that a step is complete -->
{#if $currentStep === step}
  <slot slotStep={step}></slot>
{/if}
