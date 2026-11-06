import Link from 'next/link';
import Logo from './Logo';
import { DesktopNav, MobileNav } from './NavLinks';

export default function Header() {
  return (
    <div className="c-header">
      <div className="u-container c-header__bar">
        <div className="c-cobrand">
          <Link className="c-header__logo" href="/" aria-label="CePIA, inicio"><Logo /></Link>
          <span className="c-cobrand__sep" aria-hidden="true"></span>
          <img className="c-cobrand__udec" src="/img/udec-blanco.png" alt="Universidad de Concepción" width={240} height={95} />
        </div>
        <nav className="site-nav" aria-label="Principal">
          <DesktopNav />
          <Link className="c-btn c-btn--grte" href="/grte">GrTE</Link>
          <MobileNav />
        </nav>
      </div>
    </div>
  );
}
