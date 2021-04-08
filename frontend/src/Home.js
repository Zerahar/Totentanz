import FrontImg from './images/front.jpeg'
import FrontSmallImg from './images/front-small.jpeg'

function NewsFeed() {
    return (
        <div>
            <h2>Update 11/11/2021</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in.</p>
        </div>
    );
}

function Home() {
    return (<div>
        <div class="front-image d-none d-md-block"><img src={FrontImg} alt="" class="w-100" /></div>
        <div class="front-image d-block d-md-none"><img src={FrontSmallImg} alt="" class="w-100" /></div>
        <div class="text-container front-container">

            <h2>Home</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <div>
                <NewsFeed />
                <NewsFeed />
            </div>
        </div></div>
    );
}
export default Home