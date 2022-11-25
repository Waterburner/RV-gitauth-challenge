import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOnClickOutside } from "usehooks-ts";
import { IUserInfo } from "src/types";
import { CLIENT_ID } from "src/constants/constants";

interface LayoutsProps {
  children: React.ReactNode;
  handleLogout: () => void;
  userInfo: IUserInfo | undefined;
}

const Layouts: React.FC<LayoutsProps> = ({
  children,
  handleLogout,
  userInfo,
}) => {
  const ref = useRef(null);
  const location = useLocation();

  const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  const handleClickOutside = () => {
    setToggle(() => false);
  };

  useOnClickOutside(ref, handleClickOutside);
  return (
    <div className="container">
      <header className="container__header">
        {userInfo?.login ? (
          <div className="userInfo" onClick={handleToggle}>
            <img src={userInfo.avatarUrl} alt="github" />
            {toggle && (
              <div className="userInfo__modal" ref={ref}>
                <div className="userInfo__modal__user">
                  <p>
                    Signed in as <span>{userInfo.login}</span>
                  </p>
                </div>
                {location.pathname == "/" ? (
                  <div
                    className="userInfo__modal__link"
                    onClick={() => navigate(`/${userInfo.username}`)}
                  >
                    <p>Your Profile</p>
                  </div>
                ) : (
                  <div
                    className="userInfo__modal__link"
                    onClick={() => navigate("/")}
                  >
                    <p>Dashboard</p>
                  </div>
                )}
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() =>
              window.open(
                `https://github.com/login/oauth/authorize?scope=user:email&client_id=${CLIENT_ID}`,
                "_self"
              )
            }
            className="signIn"
          >
            Sign In with Github
          </button>
        )}
      </header>
      {children}
    </div>
  );
};

export default Layouts;
