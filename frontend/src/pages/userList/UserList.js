import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import ChangeRole from "../../components/changeRole/ChangeRole";
import { Spinner } from "../../components/loader/Loader";
import PageMenu from "../../components/pageMenu/PageMenu";
import Search from "../../components/search/Search";
import UserStats from "../../components/userStats/UserStats";
import useRedirectLoggedOutUser from "../../customHook/useRedirectLoggedOutUser";
import { getUsers } from "../../redux/features/auth/authSlice";
import "./UserList.scss";
//import { confirmAlert } from "react-confirm-alert";
//import "react-confirm-alert/src/react-confirm-alert.css";
/*import {
  FILTER_USERS,
  selectUsers,
} from "../../redux/features/auth/filterSlice";*/
//import ReactPaginate from "react-paginate";

const UserList = () => {
  useRedirectLoggedOutUser("/login");
  const dispatch = useDispatch();

  const { users, isLoading, isLoggedIn, isSuccess, message} = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch])

  return <section>
    <div className="container">
      <PageMenu />
      {/*<UserStats />*/}

      <div className="user-list">
        <div className="table">
          <div className="--flex-between">
            <span>
              <h3>
                All Users
              </h3>
            </span>

            <span>
              <Search />
            </span>
          </div>

          <table>
            <thead> 
              <tr>
                <th>S/N</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Change Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>1</td>
                <td>William</td>
                <td>williamtran@gmail.com</td>
                <td>Admin</td>
                <td>
                  <ChangeRole />
                </td>
                <td>
                  <span>
                    <FaTrash size={20} color="red"/>
                  </span>
                </td>
              </tr>

              <tr>
                <td>2</td>
                <td>Nick</td>
                <td>nicknguyen@gmail.com</td>
                <td>Subscriber</td>
                <td>
                  <ChangeRole />
                </td>
                <td>
                  <span>
                    <FaTrash size={20} color="red"/>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
}

export default UserList