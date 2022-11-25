import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";

import { CLIENT_ID } from "src/constants/constants";
import { deletePost, updatePost, getUserPosts } from "src/api";
import { IAuth, IPost, IPostClient, IUserInfo } from "src/types";

import PostItem from "src/components/PostItem";
import Layouts from "src/components/Layouts";

enum FILTER {
  ALL,
  PRIVATE,
  PUBLIC,
}

const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<IUserInfo>();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<IPost[]>([]);
  const [toggle, setToggle] = useState<boolean>(false);
  const [filter, setFilter] = useState<FILTER>(FILTER.ALL);

  const [post, setPost] = useState<IPostClient>({
    poster: "",
    context: "",
    isPrivate: true,
  });

  const [cookies, removeCookie] = useCookies();

  const navigate = useNavigate();
  const param = useParams();
  const getUserInfo = () => {
    const auth = cookies.AuthCookie;
    if (auth) {
      const decodedAuthInfo: IAuth = jwt_decode(auth);
      const { id, login, username, avatarUrl, url } = decodedAuthInfo;
      setUserInfo({
        _id: id,
        username,
        login,
        url,
        avatarUrl,
      });

      setPost((prev) => ({ ...prev, username }));
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    getUserInfo();
    (async () => {
      if (param.username) {
        setPost({ ...post, poster: param.username });
        const data = await getUserPosts(param.username, cookies.AuthCookie);
        setPosts(data);
        setFilteredPosts(data);
      }
    })();
  }, [param]);

  const handleLogout = () => {
    removeCookie("AuthCookie", "");
    setUserInfo({ url: "", username: "", login: "", avatarUrl: "" });
    navigate("/");
  };

  const handleEdit = async (data: IPostClient) => {
    const res = await updatePost(data, cookies.AuthCookie);
    if (res && post.poster) {
      const data = await getUserPosts(post.poster, cookies.AuthCookie);
      toast.success("Successfully Edited !", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1000,
      });
      setPosts(data);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (id) {
      const res = await deletePost(id, cookies.AuthCookie);
      if (res && post.poster) {
        const data = await getUserPosts(post.poster, cookies.AuthCookie);
        toast.success("Successfully Deleted !", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1000,
        });
        setPosts(data);
      }
    }
  };

  const handleFilterChange = (currentFilter: FILTER) => {
    setFilter(currentFilter);
    switch (currentFilter) {
      case FILTER.ALL: {
        setFilteredPosts(posts);
        break;
      }
      case FILTER.PRIVATE: {
        setFilteredPosts(posts.filter((item) => item.isPrivate === true));
        break;
      }
      case FILTER.PUBLIC: {
        setFilteredPosts(posts.filter((item) => item.isPrivate !== true));
        break;
      }
      default: {
        setFilteredPosts(posts);
      }
    }
  };

  return (
    <Layouts handleLogout={handleLogout} userInfo={userInfo}>
      <section className="posts">
        <div className="posts_body">
          <div className="posts_body__tabs">
            <button
              onClick={() => handleFilterChange(FILTER.ALL)}
              className={`tab tab__all ${
                filter === FILTER.ALL ? "select" : ""
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange(FILTER.PUBLIC)}
              className={`tab tab__all ${
                filter === FILTER.PUBLIC ? "select" : ""
              }`}
            >
              Public
            </button>
            <button
              onClick={() => handleFilterChange(FILTER.PRIVATE)}
              className={`tab tab__all ${
                filter === FILTER.PRIVATE ? "select" : ""
              }`}
            >
              Private
            </button>
          </div>
          <div className="posts__container">
            {posts.length ? (
              <React.Fragment>
                {filteredPosts.map((post) => (
                  <PostItem
                    key={post._id}
                    post={post}
                    isLogin={userInfo?._id ? true : false}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </React.Fragment>
            ) : (
              <div className="posts__noposts">
                No {userInfo?.username}'s Posts
              </div>
            )}
          </div>
        </div>
        <ToastContainer />
      </section>
    </Layouts>
  );
};

export default Profile;
