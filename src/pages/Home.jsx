import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div>
      {/* Section 1 */}
      <div className="relative mx-auto flex flex-col w-11/12 items-center max-w-maxContent text-white">
        <Link to="/signup">
          <div className=' group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit shadow-md shadow-pure-greys-500'>
            <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px]
                transition-all duration-200 group-hover:bg-richblack-900'>
              <p>Become an Instructor</p>
              <FaArrowRight />
            </div>
          </div>
        </Link>

      </div>
      {/* Section 2 */}

      {/* Section 3 */}

      {/* Footer */}
    </div>
  )
}

export default Home