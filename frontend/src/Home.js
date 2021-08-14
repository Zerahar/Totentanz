function NewsFeed() {
    return (
        <article>
            <h3>Update 11/11/2021</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in.</p>
        </article>
    );
}

function Home() {
    return (<div>
        <figure class="front-image" alt="Kuva mekaanikosta värikkäässä valaistuksessa" loading="lazy"></figure>
        <main class="text-container front-container container">

            <h2>Home</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <div>
                <NewsFeed />
                <NewsFeed />
            </div>
        </main></div>
    );
}
export default Home