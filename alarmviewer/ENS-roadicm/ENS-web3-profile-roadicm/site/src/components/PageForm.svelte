<script>
  export let profile = [
    { description: 'Instagram', value: '' },
    { description: 'Twitter', value: '' },
    { description: 'Facebook', value: '' },
  ]
  export let avatarCid = ''
</script>

<section>
  <h2>Social media profiles</h2>
  <p>Enter only your name.</p>
  <ul>
    {#each profile as field (field.description)}
      <li class="alignment">
        <label for="link-{field.description}">{field.description}</label>
        <input id="link-{field.description}" type="text" bind:value={field.value} />
      </li>
    {/each}
  </ul>

  <h2>Avatar</h2>
  <p>If you have a CID for your avatar you can enter it into this field. Otherwise, leave blank.</p>
  <div class="alignment">
    <label for="avatar-cid">Avatar</label>
    <input id="avatar-cid" type="text" bind:value={avatarCid} />
  </div>
</section>

<style>
  section {
    padding: 1em;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  .alignment {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
