// import { Twitter, Discord } from 'react-bootstrap-icons';
import * as Icon from 'react-bootstrap-icons'

export default function Footer() {
    return (
        <div className="footer">
            <div id="officialLinks">
                {/* OFFICIAL LINKS */}
                <div>
                    <a href="https://twitter.com/nfturtleverse" target="_blank" rel="noreferrer" ><Icon.Twitter size="2x" /></a>
                </div>
                <div>
                    <a href="https://discord.gg/ykBCBNAsPE" target="_blank" rel="noreferrer" ><Icon.Discord /></a>
                </div>
                <div>
                    <a href="https://instagram.com/turtleverse" target="_blank" rel="noreferrer" ><Icon.Instagram /></a>
                </div>
            </div>
            <div className="copyright">
                2022 Turtleverse 
            </div>
        </div>
    )
}
