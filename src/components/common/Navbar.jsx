import { Link, matchPath, useLocation } from "react-router-dom"
import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { useSelector } from "react-redux"
import ProfileDropdown from "../core/Auth/ProfileDropdown"
import { ACCOUNT_TYPE } from "../../utils/constants"

const Navbar = () => {
  const location = useLocation()

  const token = useSelector(state => state.auth.token)
  const user = useSelector(state => state.profile.user)
  const totalItems = useSelector(state => state.cart.totalItems)

  const matchRoute = (currentRoute) => {
    return matchPath({ path: currentRoute }, location.pathname)
  }

  return (
    <div className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 transition-all duration-200`}>
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {
              NavbarLinks.map((link, index) => (
                <li key={link.id}>
                  {
                    link.title === "Catalog" ? (
                      <div>
                      </div>
                    ) : (
                      <Link to={link?.path}>
                        <span
                          className={`
                          ${matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}`}>
                          {link.title}
                        </span>
                      </Link>
                    )
                  }
                </li>
              ))
            }
          </ul>
        </nav>

        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
          {/* Dashboard */}
          {user && user?.accountType != ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {
                totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                    {totalItems}
                  </span>)
              }
            </Link>
          )}
          {/* Login */}
          {token === null && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Log in
              </button>
            </Link>
          )}
          {/* Signup */}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Sign up
              </button>
            </Link>
          )}
          {/* Profile Dropdown */}
          {token !== null && <ProfileDropdown />}
        </div>
        <button className="mr-4 md:hidden">
          <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
        </button>
      </div>
    </div>
  )
}

export default Navbar