import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import ChangeRole from "../../components/changeRole/ChangeRole";
import { Spinner } from "../../components/loader/Loader";
import PageMenu from "../../components/pageMenu/PageMenu";
import Search from "../../components/search/Search";
import UserStats from "../../components/userStats/UserStats";
import useRedirectLoggedOutUser from "../../customHook/useRedirectLoggedOutUser";
import { deleteUser, getUsers } from "../../redux/features/auth/authSlice";
import "./UserList.scss";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
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

  const removeUser = async (id) => {
    await dispatch(deleteUser(id));
    dispatch(getUsers());
  }

  const confirmDelete = (id) => {
    confirmAlert({
      title: "Delete This User",
      message: "Are you sure to do delete this user?",
      buttons: [
        {
          label: "Delete",
          onClick: () => removeUser(id),
        },
        {
          label: "Cancel",
        },
      ],
    });
  };

  return <section>
    <div className="container">
      <PageMenu />
      {/*<UserStats />*/}

      <div className="user-list">
      {isLoading && <Spinner />}
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

          {!isLoading && users.length === 0 ? (
            <>No User Found</>
          ) : (
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
                {users.map((user, index) => {
                  const {_id, name, email, role} = user;
                  return (
                    <tr key={_id}>
                      <td>{index}</td>
                      <td>{name}</td>
                      <td>{email}</td>
                      <td>{role}</td>
                      <td>
                        <ChangeRole _id={_id} email={email}/>
                      </td>
                      <td>
                        <span>
                          <FaTrash size={20} color="red" onClick={() => confirmDelete(_id)}/>
                        </span>
                      </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          
        </div>
      </div>
    </div>
  </section>
}

export default UserList