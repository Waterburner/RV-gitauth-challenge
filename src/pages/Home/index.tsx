import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";

import { deletePost, updatePost, getAllPosts, createPost } from "src/api";
import { IAuth, IPost, IPostClient, IUserInfo } from "src/types";
import PostItem from "src/components/PostItem";
import Button from "src/components/Button";

import "./index.scss";
import Layouts from "src/components/Layouts";

const Home: React.FC = () => {
  const [userInfo, setUserInfo] = useState<IUserInfo>();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [post, setPost] = useState({
    poster: "",
    context: "",
    isPrivate: true,
  });

  const [cookies, removeCookie] = useCookies();
  const authCookie = cookies.AuthCookie;

  useEffect(() => {
    if (authCookie) {
      const decodedAuthInfo: IAuth = jwt_decode(authCookie);
      const { id, login, username, avatarUrl, url } = decodedAuthInfo;
      setUserInfo({
        _id: id,
        username,
        login,
        url,
        avatarUrl,
      });

      setPost((prev) => ({ ...prev }));
    }

    (async () => {
      const data = await getAllPosts();
      setPosts(data);
    })();
  }, [authCookie]);

  const handleLogout = () => {
    removeCookie("AuthCookie", "");
    setUserInfo({ url: "", username: "", login: "", avatarUrl: "" });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (post.context) {
      const res = await createPost(post, cookies.AuthCookie);
      if (res) {
        const data = await getAllPosts();
        toast.success("Successfully Added !", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1000,
        });
        setPosts(data);
        setPost((prev) => ({ ...prev, context: "" }));
      }
    }
  };

  const handlePost = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, name } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = e.target;
    setPost((prev) => ({ ...prev, isPrivate: checked }));
  };

  const handleEdit = async (data: IPostClient) => {
    const res = await updatePost(data, cookies.AuthCookie);
    if (res) {
      toast.success("Successfully Edited !", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1000,
      });
      const data = await getAllPosts();
      setPosts(data);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (id) {
      const res = await deletePost(id, cookies.AuthCookie);
      if (res) {
        toast.success("Successfully Deleted !", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1000,
        });
        const data = await getAllPosts();
        setPosts(data);
      }
    }
  };

  return (
    <Layouts handleLogout={handleLogout} userInfo={userInfo}>
      <section className="posts">
        <div className="posts__container">
          {posts.length ? (
            <React.Fragment>
              {posts.map((post) => (
                <PostItem
                  key={post._id}
                  post={post}
                  isLogin={userInfo?.username ? true : false}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </React.Fragment>
          ) : (
            <div className="posts__noposts"></div>
          )}
        </div>
        {userInfo?.login && (
          <div className="create--post">
            <div className="create--post_owner">
              <img src={userInfo?.avatarUrl} alt="github" />
            </div>
            <form onSubmit={handleSubmit} className="create--post_form">
              <textarea
                name="context"
                onChange={handlePost}
                className="content"
                placeholder="Leave comment"
                value={post.context}
                rows={8}
              />
              <div className="create--post_form__bottom">
                <div className="checkbox">
                  <label>Private</label>
                  <input
                    type="checkbox"
                    name="isPublic"
                    onChange={handleChecked}
                    checked={post.isPrivate}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={userInfo?.login ? false : true}
                >
                  Create New
                </Button>
              </div>
            </form>
          </div>
        )}
        <ToastContainer />
      </section>
    </Layouts>
  );
};

export default Home;
