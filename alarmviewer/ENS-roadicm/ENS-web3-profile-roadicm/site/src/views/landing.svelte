<script>
  import { link } from 'svelte-spa-router'
</script>

<main>
  <section id="hero">
    <div>
      <h1>LinkENS</h1>
      <p>Link aggregation made easy</p>
      <a class="fake-button cta cta-big" href="/wizard" use:link>Create a site</a>
      <!--
      <a class="fake-button" href="#for-creators">For Creators</a>
      <a class="fake-button" href="#for-supporters">For Supporters</a>
      -->
    </div>

    <div class="mh-300">
      <img src="https://picsum.photos/600/300?grayscale">
    </div>
  </section>

  <section id="for-creators">
    <div class="mh-200">
      <img src="https://picsum.photos/400/200?grayscale">
    </div>

    <div class="description">
      <h3>LinkENS is the social link aggregator for content creators</h3>
      <p>LinkENS simplifies the process of aggregating social media links and creating a website from your account on Ethereum. LinkENS is a social link aggregator for content creators. Create a subdomain and website with all of your social networks' links at once with just one transaction on Ethereum.</p>
      <a class="fake-button cta" href="/wizard" use:link>Create a site</a>
    </div>
  </section>

  <section id="cutter">
    <h3>A new way to monetize your social media content</h3>
  </section>

  <section id="for-supporters">
    <div class="description">
      <h3>Build a following with one click</h3>
      <p>Don't waste time, money, or energy building your own website; use LinkENS to build your profile and start attracting followers. With supporters searching for the creators they want to support, it's now easier than ever to find like-minded creators.</p>
      <a class="fake-button" href="#">Find your favourite creator</a>
    </div>

    <div class="mh-200">
      <img src="https://picsum.photos/400/200?grayscale">
    </div>
  </section>

  <section id="footer">
    <div>
      <img src="/dummy-logo.png" width="100" height="100">
    </div>

    <div>
      <p>LinkENS is a social link aggregator that lets you create a subdomain and website in just three quick steps. It's the ultimate marketing tool for content creators who want to focus on their content and not on their marketing.</p>
    </div>

    <div>
      <p>Links</p>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="/wizard" use:link>Creators</a></li>
        <li><a href="#">Supporters</a></li>
      </ul>
    </div>
  </section>
</main>

<style>
  main {
    padding: 0;
    margin: 0;
  }

  section {
    width: 100%;
    padding: 0;
    margin: 0 0 1rem 0;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  img {
    max-width: 100%;
  }

  p {
    max-width: 60ch;
  }

  .description {
    max-width: 60ch;
    padding: 0 1em;
  }

  #hero {
    background: #dedede;
    flex-direction: column-reverse;
    text-align: center;
    padding: 0;
  }

  #hero p {
    font-size: 1.2rem;
  }

  #footer {
    background: #3a3a3a;
    padding: 1rem;
    color: #efefef;
  }

  #footer div {
    margin: 1rem;
  }

  #for-supporters {
    flex-direction: column-reverse;
  }

  .fake-button {
    display: block;
    padding: 0.5rem;
    background: #464646;
    margin: 0.5rem auto;
    color: #f5f5f5;
    text-align: center;
    max-width: 30%;
  }

  .cta-big {
    max-width: 70%;
    padding: 0.8rem;
    font-size: 1.2em;
  }

  #cutter {
    flex-direction: row;
    justify-content: center;
    padding: 2.5em;
    font-size: 2em;
    background: #3a3a3a;
    color: #f5f5f5;
    font-style: italic;
  }

  .mh-300 {
    max-height: 300px;
  }

  .mh-200 {
    max-height: 200px;
  }

  .cta {
    background: #4a8a4c;
  }

  @media (min-width:801px) { /* tablet, landscape iPad, lo-res laptops ands desktops */
    section {
      flex-direction: row;
      justify-content: space-evenly;
      margin: 0 0 4em 0;
    }

    #for-supporters {
      flex-direction: row;
    }

    #hero {
      flex-direction: row;
      padding: 2em;
      justify-content: space-evenly;
    }

    #cutter {
      padding: 4.5em;
    }
  }
</style>
