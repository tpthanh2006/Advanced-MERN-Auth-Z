import React, { useEffect } from 'react';
import "./UserStats.scss";
import InfoBox from "../infoBox/InfoBox";
import { BiUserCheck, BiUserMinus, BiUserX } from 'react-icons/bi';
import { FaUsers } from 'react-icons/fa';
import { useDispatch, useSelector } from "react-redux";
import {
  CALC_SUSPENDED_USER,
  CALC_VERIFIED_USER,
} from "../../redux/features/auth/authSlice";

// Icons
const icon1 = <FaUsers size={40} color="#fff" />;
const icon2 = <BiUserCheck size={40} color="#fff" />;
const icon3 = <BiUserMinus size={40} color="#fff" />;
const icon4 = <BiUserX size={40} color="#fff" />;

const UserStats = () => {
  const dispatch = useDispatch();
  const { users, verifiedUsers, suspendedUsers } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(CALC_VERIFIED_USER());
    dispatch(CALC_SUSPENDED_USER());
  }, [dispatch, users])

  return <div className="user-summary">
    <h3 className="--mt">User Stats</h3>
    <div className="info-summary">
      <InfoBox icon={icon1} title={"Total Users"} count={users.length} bgColor="card1" />
      <InfoBox icon={icon2} title={"Verified Users"} count={"2"} bgColor="card2" />
      <InfoBox icon={icon3} title={"Unverified Users"} count={"1"} bgColor="card3" />
      <InfoBox icon={icon4} title={"Suspended Users"} count={"0"} bgColor="card4" />
    </div>
  </div>
}

export default UserStats