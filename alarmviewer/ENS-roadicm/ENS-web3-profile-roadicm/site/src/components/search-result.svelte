<script>
  export let profile = {}

  const count = profile.links.length
</script>

<div class="container">
  <div class="avatar">
    <img src={profile.avatar}>
  </div>

  <div>
    <p class="title">
      <a href="/user/{profile.userId}">{profile.name}</a>
    </p>
    <p>Has {count} {count > 1 ? 'links' : 'link'}</p>
  </div>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
  }

  .container div {
    margin: 0.5rem 1rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
  }

  .avatar img {
    width: 100%;
  }
</style>
