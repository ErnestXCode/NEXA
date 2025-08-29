import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/axios';
import { store } from '../../redux/store';
import { logOut, selectCurrentUser } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Link, NavLink } from "react-router-dom";


const Navigation = () => {
    const [sidenav, setSidenav] = useState(false);
    const navigate = useNavigate()
      // console.log('currentUser', currentUser);
      const currentUser = useSelector(selectCurrentUser);
      const handleLogout = async () => {
        try {
          await api.post("/auth/logout");
          store.dispatch(logOut());
          navigate("/");
        } catch (err) {
          console.error("Logout failed:", err);
        }
      };
    
      const handleCloseSidenav = () => {
        setSidenav(false);
      };
      const dispatch = useDispatch();
  return (
     <nav className="p-4 flex gap-4 justify-between items-center pr-10 bg-gray-900">
        <h1 className="font-semibold">
          <Link to="/" className="cursor-pointer">
            NEXA | Hello, {currentUser.name}
          </Link>
        </h1>
        <section className="flex  gap-2 items-center">
          <>
            <div className="size-10 bg-black rounded-full flex items-center justify-center font-semibold">
              {currentUser?.name[0]}
            </div>
            <section onClick={() => setSidenav(true)}>Sidenav</section>
            {sidenav ? (
              <>
                <section className="bg-gray-950 fixed right-0 w-90 top-0 h-screen p-5">
                  <section className="flex justify-between ">
                    <button
                      className="bg-gray-100 cursor-pointer text-black rounded-2xl p-2 font-semibold hover:bg-black hover:text-white"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>

                    <button onClick={handleCloseSidenav}>X</button>
                  </section>

                  <section className="flex flex-col bg-gray-900 p-2 mt-5 rounded-2xl gap-4">
                    <NavLink onClick={() => setSidenav(false)} to="/dashboard/dashboard">
                      Dashboard
                    </NavLink>
                    <NavLink onClick={() => setSidenav(false)} to="/dashboard/fees">
                      Fees
                    </NavLink>
                    <NavLink onClick={() => setSidenav(false)} to="/dashboard/exams">
                      Exams
                    </NavLink>
                    <NavLink onClick={() => setSidenav(false)} to="/dashboard/attendance">
                      Attendance
                    </NavLink>
                    <NavLink
                      onClick={() => setSidenav(false)}
                      to="/dashboard/communication"
                    >
                      Communication
                    </NavLink>
                    <NavLink onClick={() => setSidenav(false)} to="/dashboard/settings">
                      Settings
                    </NavLink>
                  </section>
                </section>
              </>
            ) : (
              ""
            )}
          </>
        </section>
      </nav>
  )
}

export default Navigation
