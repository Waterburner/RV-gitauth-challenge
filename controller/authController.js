const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const fetch = require("cross-fetch");

const gitAuth = async (request, response) => {
  const { access_token } = request.body;

  const user_res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${access_token}`,
    },
  });

  const user_data = await user_res.json();
  const { avatar_url, login, name, url, node_id } = user_data;
  const user = await User.findOne({
    username: name,
    login: login,
    avatarUrl: avatar_url,
    url: url,
    nodeId: node_id,
  });

  if (user) {
    console.log(user);
    const authToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        login: user.login,
        url: user.url,
        avatarUrl: user.avatarUrl,
        nodeId: user.nodeId,
      },
      "authToken",
      { expiresIn: "1h" }
    );
    return response.send({ message: "Login Success!", token: authToken });
  } else {
    const newUser = new User({
      username: name,
      login: login,
      url: url,
      avatarUrl: avatar_url,
      nodeId: node_id,
    });

    newUser.save((error, result) => {
      if (error) {
        response.send({ message: "Login Failed!" });
      } else {
        const authToken = jwt.sign(
          {
            id: result._id,
            username: result.username,
            login: result.login,
            url: result.url,
            avatarUrl: result.avatarUrl,
            nodeId: result.nodeId,
          },
          "authToken",
          { expiresIn: "1h" }
        );

        response.send({ message: "Login Success!", token: authToken });
      }
    });
  }
};

module.exports = { gitAuth };
