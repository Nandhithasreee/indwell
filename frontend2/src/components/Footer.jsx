import {
  faEnvelope,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[#8a704e]/25 bg-[linear-gradient(135deg,#5a4430_0%,#473221_52%,#332417_100%)] light:border-hairline-light light:bg-[linear-gradient(135deg,#efe4c8_0%,#f7f1e4_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-2xl font-semibold text-linen light:text-deep">
              In<span className="text-brass">Dwell</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#f2e7d0] light:text-muted-light">
              Describe a room. Step inside it. InDwell turns a floor plan brief into a
              walkable 3D space, built from structured AI data instead of a flat image.
            </p>
            <div className="mt-6 flex gap-4 text-[#f2e7d0] light:text-muted-light">
              <a href="#" aria-label="X" className="hover:text-brass"><FontAwesomeIcon icon={faXTwitter} /></a>
              <a href="#" aria-label="GitHub" className="hover:text-brass"><FontAwesomeIcon icon={faGithub} /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-brass"><FontAwesomeIcon icon={faLinkedin} /></a>
            </div>
          </div>

          <div>
            <p className="dim-label !justify-start text-[#f2e7d0] light:text-muted-light">Product</p>
            <ul className="mt-4 space-y-3 text-sm text-[#f2e7d0] light:text-muted-light">
              <li><a href="/#features" className="hover:text-brass">Features</a></li>
              <li><Link to="/signup" className="hover:text-brass">Get started</Link></li>
            </ul>
          </div>

          <div>
            <p className="dim-label !justify-start text-[#f2e7d0] light:text-muted-light">Company</p>
            <ul className="mt-4 space-y-3 text-sm text-[#f2e7d0] light:text-muted-light">
              <li><Link to="/about" className="hover:text-brass">About</Link></li>
              <li><Link to="/feedback" className="hover:text-brass">Feedback</Link></li>
            </ul>
          </div>

          <div>
            <p className="dim-label !justify-start text-[#f2e7d0] light:text-muted-light">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-[#f2e7d0] light:text-muted-light">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-brass" /> hello@indwell.app
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-brass" /> Bengaluru, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#8a704e]/25 pt-5 text-xs text-[#f2e7d0] md:flex-row light:border-hairline-light light:text-muted-light">
          <span>© {new Date().getFullYear()} InDwell. All rights reserved.</span>
          <span className="font-mono">Built on structured data, not static images.</span>
        </div>
      </div>
    </footer>
  );
}
