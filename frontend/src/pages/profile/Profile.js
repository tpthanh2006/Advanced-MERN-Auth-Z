import "./Profile.scss"
import React, { useState } from "react";
import Card from "../../components/card/Card"
import profileImg from "../../assets/avatarr.png";
import PageMenu from "../../components/pageMenu/PageMenu";

const initialState = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  role: "",
  isVerified: false,
}

const Profile = () => {
    const [profile, setProfile] = useState(initialState);

    const handleImageChange = () => {

    }

    const handleInputChange = () => {

    }

  return <>
    <section>
      <div className="container">
        <PageMenu />
        <h2>Profile</h2>

        <div className="--flex-start profile">
          <Card cardClass={"card"}>
            <>
              <div className="profile-photo">
                <div>
                  <img src={profileImg} alt="profile_img" />
                  <h3>Role: Subscriber</h3>
                </div>
              </div>

              <form>
                <p>
                  <label>Change Photo:</label>
                  <input type="file" accept="image/*" name="image" onChange={handleImageChange}/>
                </p>

                <p>
                  <label>Name:</label>
                  <input type="text" name="name" value={profile.name} onChange={handleInputChange}/>
                </p>

                <p>
                  <label>Email:</label>
                  <input type="email" name="email" value={profile.email} onChange={handleInputChange} disabled/>
                </p>

                <p>
                  <label>Phone:</label>
                  <input type="text" name="phone" value={profile.phone} onChange={handleInputChange}/>
                </p>

                <p>
                  <label>Bio:</label>
                  <textarea name="bio" value={profile.bio} cols="30" rows="10" onChange={handleInputChange}/>
                </p>

                <button className="--btn --btn-primary --btn-block">
                  Update Profile
                </button>
              </form>
            </>
          </Card>
        </div>
      </div>
    </section>
  </>;
};

export default Profile;