import Image from 'next/image';

export default function Founders() {
    return (
        <div id="ourTeam" className="founders mobile-top-margin-lg">
            <div className="fndr-header">
                <div className="white-divider hidden-mobile"></div>
                <h1>THE FOUNDERS</h1>
            </div>
            <div className="fndr-row">
                <div className="fndr-text">
                    <h3 className="fndr-subheader">JOHNNY VG (ART)</h3>
                    <ul className="fndr-ul">
                        <li>23+ years of art experience</li>
                        <li>Prefers rom-coms to action movies</li>
                        <li>Favorite Drink: Soda Water</li>
                    </ul>
                </div>
                <div className="fndr-img">
                    <Image layout="responsive" src="/JVG.png" alt="tv-white" width="200" height="200" />
                </div>
            </div>
            <div className="discord-divider">
                <div className="white-divider hidden-mobile" style={{width: "70%"}}></div>
                <span className="fndr-discord">DISCORD: JohnnyVG<span style= {{ letterSpacing: '0.3em' }}>#3661</span></span>
            </div>
            <div className="fndr-row">
                <div className="fndr-text">
                    <h3 className="fndr-subheader">HEX (TECH)</h3>
                    <ul className="fndr-ul">
                        <li>Once built a website for an alien space force</li>
                        <li>Prefers the book to the movie</li>
                        <li>Favorite Drink: Caffeine/caffeine</li>
                    </ul>
                </div>
                <div className="fndr-img">
                    <Image layout="responsive" src="/Hexenberg.jpg" alt="tv-white" width="350" height="350" />
                </div>
            </div>
            <div className="discord-divider">
                <div className="white-divider hidden-mobile" style={{width: "70%"}}></div>
                <span className="fndr-discord">DISCORD: awf825<span style= {{ letterSpacing: '0.3em' }}>#2022</span></span>
            </div>
            <div className="fndr-row">
                <div className="fndr-text">
                    <h3 className="fndr-subheader">MARKET (THE BUSINESSMAN)</h3>
                    <ul className="fndr-ul">
                        <li>Turned down multiple higher paying jobs to be here</li>
                        <li>Doesn&apos;t watch movies or listen to music</li>
                        <li>Favorite Drink: Dutch chocolate milk</li>
                    </ul>
                </div>
                <div className="fndr-img">
                    <Image layout="responsive" src="/Bobby.png" alt="tv-white" width="350" height="350" />
                </div>
            </div>
            <div className="discord-divider">
                <div className="white-divider hidden-mobile" style={{width: "70%"}}></div>
                <span className="fndr-discord">DISCORD: bob-o-pedic<span style= {{ letterSpacing: '0.3em' }}>#6832</span></span>
            </div>
            <div className="fndr-row">
                <div className="fndr-text">
                    <h3 className="fndr-subheader">BOUNCER (THE COMMUNITY)</h3>
                    <ul className="fndr-ul">
                        <li>Builds robots in his free time</li>
                        <li>Science-fiction movie aficianado</li>
                        <li>Favorite Drink: Scotch</li>
                    </ul>
                </div>
                <div className="fndr-img">
                    <Image layout="responsive" src="/Lou.png" alt="tv-white" width="350" height="350" />
                </div>
            </div>
            <div className="discord-divider">
                <div className="white-divider hidden-mobile" style={{width: "70%"}}></div>
                <span className="fndr-discord">DISCORD: Lou<span style= {{ letterSpacing: '0.3em' }}>#6380</span></span>
            </div>
        </div>
    )
}
