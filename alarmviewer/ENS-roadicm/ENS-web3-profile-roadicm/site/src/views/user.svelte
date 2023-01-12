<script>
  import LinkInput from '../components/LinkInput.svelte'

  const socialMediaKeys = [
    'com.facebook',
    'com.twitter',
    'com.instagram',
    'com.tiktok',
    'com.youtube',
    'tv.twitch',
    'com.spotify',
    'com.apple.music',
    'com.apple.podcasts',
    'com.soundcloud',
    'com.linkedin',
    'com.github',
    'com.gitlab',
    'com.onlyfans',
    'tv.of'
  ]
</script>

<main>
  <section id="banner">
    <div id="avatar">
    </div>
    <input type="text" placeholder="your-name" spellcheck="false" />
  </section>

  <section id="body">
    <div id="profile-links">
      <h2>Links</h2>
      <ul>
        {#each socialMediaKeys.slice(0,6) as site}
          <li>
            <LinkInput network={site.split('.')[1]} />
          </li>
        {/each}
      </ul>
    </div>
  </section>
</main>

<style>
  main {
    padding: 0;
    margin: 0;
  }

  #body {
    padding: 0 1em;
    display: flex;
    flex-direction: column;
    margin-top: 4em;
  }

  #banner {
    height: 150px;
    background: #ccc;
  }

  #banner > input {
    display: block;
    border: 0;
    margin: 0 auto;
    margin-top: 60px;
    text-align: center;
    max-width: 75%;
    font-size: 1.5em;
    background: transparent;
    z-index: 1;
  }

  #banner > input::placeholder,
  #banner > input {
    text-shadow: 0px 3px 3px #b5b5b5;
  }

  #banner > input::placeholder {
    color: #727272;
  }

  #banner > input:focus {
    border: 0;
    border-bottom: 3px solid #000;
  }

  #profile-links > ul {
    display: grid;
    grid-template-columns: 1fr;
    list-style-type: none;
    padding: 0;
    margin-left: -15px;
  }

  #profile-links li {
    margin: 0 auto;
  }

  #avatar {
    display: block;
    width: 15ch;
    height: 15ch;
    margin: 0 auto;
    border-radius: 50%;
    border: 3px solid #000;
    background: #f6f6f6;
    overflow: hidden;
    position: relative;
    top: 40px;
    margin-bottom: 20px;
  }

  #avatar > img {
    width: 100%;
  }

  @media (min-width: 640px) {
    #body {
      max-width: 80ch;
      margin: 0 auto;
      margin-top: 4.5em;
    }

    #profile-links > ul {
      grid-template-rows: 1fr 1fr 1fr;
      grid-auto-columns: 1fr;
      grid-auto-flow: column;
    }

    #banner {
      height: 200px;
    }

    #avatar {
      top: 100px;
    }

    #banner > input {
      margin-top: 110px;
    }
  }
</style>
