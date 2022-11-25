const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
  try {
    const token = await request.headers.authorization.split(" ")[1];
    const decodeToken = jwt.verify(token, "authToken");

    const user = decodeToken;

    request.user = user;

    next();
  } catch (err) {
    response.status(401).send({ message: "User isn't authenticated", err });
  }
};
