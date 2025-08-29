import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { setCredentials, logOut } from "../../redux/slices/authSlice";
import api from "../../api/axios";

const PersistLogin = () => {

  return <Outlet />;
};

export default PersistLogin;
